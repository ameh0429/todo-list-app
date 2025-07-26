import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  FAB,
  Searchbar,
  SegmentedButtons,
  useTheme,
  Menu,
  Divider,
  IconButton,
  Appbar,
} from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Todo, RootStackParamList, Priority } from '../types';
import { apiService } from '../services/api';
import { useSnackbar } from '../components/SnackbarProvider';
import TodoItem from '../components/TodoItem';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  sortTodosByPriority,
  sortTodosByDueDate,
  filterTodosByStatus,
} from '../utils/helpers';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type SortOption = 'priority' | 'dueDate' | 'title';
type FilterOption = 'all' | 'active' | 'completed';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { showSuccess, showError } = useSnackbar();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      backgroundColor: theme.colors.surface,
    },
    listContainer: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
    header: {
      backgroundColor: theme.colors.surface,
      elevation: 0,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTodos = await apiService.getTodos();
      setTodos(fetchedTodos);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  }, [loadTodos]);

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, [loadTodos])
  );

  useEffect(() => {
    applyFiltersAndSort();
  }, [todos, searchQuery, sortBy, filterBy]);

  const applyFiltersAndSort = () => {
    let filtered = [...todos];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        todo =>
          todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          todo.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filterBy === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // Apply sorting
    switch (sortBy) {
      case 'priority':
        filtered = sortTodosByPriority(filtered);
        break;
      case 'dueDate':
        filtered = sortTodosByDueDate(filtered);
        break;
      case 'title':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredTodos(filtered);
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const updatedTodo = await apiService.toggleTodoComplete(id, completed);
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? updatedTodo : todo))
      );
      showSuccess(completed ? 'Task completed!' : 'Task marked as incomplete');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const handleEditTodo = (todo: Todo) => {
    navigation.navigate('EditTodo', { todoId: todo.id });
  };

  const handleDeleteTodo = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTodo(id),
        },
      ]
    );
  };

  const deleteTodo = async (id: string) => {
    try {
      await apiService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      showSuccess('Task deleted successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onToggleComplete={handleToggleComplete}
      onEdit={handleEditTodo}
      onDelete={handleDeleteTodo}
    />
  );

  const renderEmptyComponent = () => {
    if (loading) return null;

    if (searchQuery || filterBy !== 'all') {
      return (
        <EmptyState
          title="No tasks found"
          message="Try adjusting your search or filter criteria"
          icon="magnify"
        />
      );
    }

    return (
      <EmptyState
        title="No tasks yet"
        message="Create your first task to get started with organizing your day"
        actionText="Add Task"
        onAction={() => navigation.navigate('AddTodo')}
      />
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner text="Loading your tasks..." />;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="My Tasks" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }>
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Profile');
            }}
            title="Profile"
            leadingIcon="account"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setSortBy('priority');
            }}
            title="Sort by Priority"
            leadingIcon={sortBy === 'priority' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setSortBy('dueDate');
            }}
            title="Sort by Due Date"
            leadingIcon={sortBy === 'dueDate' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setSortBy('title');
            }}
            title="Sort by Title"
            leadingIcon={sortBy === 'title' ? 'check' : undefined}
          />
        </Menu>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterBy}
          onValueChange={(value) => setFilterBy(value as FilterOption)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
      </View>

      <FlatList
        style={styles.listContainer}
        data={filteredTodos}
        renderItem={renderTodoItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredTodos.length === 0 ? { flex: 1 } : undefined
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddTodo')}
        label="Add Task"
      />
    </View>
  );
};

export default HomeScreen;