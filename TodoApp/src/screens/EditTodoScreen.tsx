import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  useTheme,
  Text,
  Card,
  SegmentedButtons,
  IconButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Priority, RootStackParamList, UpdateTodoRequest, Todo } from '../types';
import { apiService } from '../services/api';
import { useSnackbar } from '../components/SnackbarProvider';
import { formatDateOnly, getPriorityLabel } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

type EditTodoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditTodo'>;
type EditTodoScreenRouteProp = RouteProp<RootStackParamList, 'EditTodo'>;

const EditTodoScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<EditTodoScreenNavigationProp>();
  const route = useRoute<EditTodoScreenRouteProp>();
  const { showSuccess, showError } = useSnackbar();

  const { todoId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [todo, setTodo] = useState<Todo | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    dueDate?: string;
  }>({});

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
    },
    card: {
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    input: {
      marginBottom: 16,
    },
    dateContainer: {
      marginBottom: 16,
    },
    dateButton: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    priorityContainer: {
      marginBottom: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statusText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
  });

  useEffect(() => {
    loadTodo();
  }, [todoId]);

  const loadTodo = async () => {
    try {
      setLoading(true);
      const fetchedTodo = await apiService.getTodoById(todoId);
      setTodo(fetchedTodo);
      
      // Populate form fields
      setTitle(fetchedTodo.title);
      setDescription(fetchedTodo.description);
      setDueDate(new Date(fetchedTodo.dueDate));
      setPriority(fetchedTodo.priority);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load task');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !todo) {
      return;
    }

    try {
      setSaving(true);

      const updateData: UpdateTodoRequest = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.toISOString(),
        priority,
      };

      await apiService.updateTodo(todoId, updateData);
      showSuccess('Task updated successfully!');
      navigation.goBack();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!todo) return;

    try {
      const updatedTodo = await apiService.toggleTodoComplete(todoId, !todo.completed);
      setTodo(updatedTodo);
      showSuccess(updatedTodo.completed ? 'Task marked as completed!' : 'Task marked as incomplete');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update task status');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const priorityButtons = [
    {
      value: Priority.LOW,
      label: getPriorityLabel(Priority.LOW),
      icon: 'chevron-down',
    },
    {
      value: Priority.MEDIUM,
      label: getPriorityLabel(Priority.MEDIUM),
      icon: 'minus',
    },
    {
      value: Priority.HIGH,
      label: getPriorityLabel(Priority.HIGH),
      icon: 'chevron-up',
    },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading task..." />;
  }

  if (!todo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Task Status</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Status: {todo.completed ? 'Completed' : 'Active'}
            </Text>
            <Button
              mode={todo.completed ? 'outlined' : 'contained'}
              onPress={handleToggleStatus}
              icon={todo.completed ? 'check-circle-outline' : 'check-circle'}>
              {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          <TextInput
            label="Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            error={!!errors.title}
            maxLength={100}
            placeholder="Enter task title"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            error={!!errors.description}
            maxLength={500}
            placeholder="Enter task description (optional)"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Due Date</Text>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateButton}>
              <Text style={styles.dateText}>
                {formatDateOnly(dueDate.toISOString())}
              </Text>
              <IconButton
                icon="calendar"
                size={24}
                onPress={() => setShowDatePicker(true)}
              />
            </View>
            {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Priority</Text>
          
          <View style={styles.priorityContainer}>
            <SegmentedButtons
              value={priority}
              onValueChange={(value) => setPriority(value as Priority)}
              buttons={priorityButtons}
            />
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            icon="close">
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            icon="content-save"
            disabled={!title.trim() || saving}
            loading={saving}>
            Save Changes
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditTodoScreen;