import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  Checkbox,
  IconButton,
  Chip,
  useTheme,
} from 'react-native-paper';
import { Todo } from '../types';
import {
  formatDate,
  getPriorityColor,
  getPriorityLabel,
  isOverdue,
  truncateText,
} from '../utils/helpers';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const priorityColor = getPriorityColor(todo.priority, theme.dark);
  const isTaskOverdue = isOverdue(todo.dueDate);

  const styles = StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: todo.completed
        ? theme.colors.surfaceVariant
        : theme.colors.surface,
    },
    cardContent: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    checkbox: {
      marginRight: 12,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: todo.completed
        ? theme.colors.onSurfaceVariant
        : theme.colors.onSurface,
      textDecorationLine: todo.completed ? 'line-through' : 'none',
    },
    description: {
      fontSize: 14,
      color: todo.completed
        ? theme.colors.onSurfaceVariant
        : theme.colors.onSurfaceVariant,
      marginTop: 4,
      textDecorationLine: todo.completed ? 'line-through' : 'none',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    leftFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rightFooter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priorityChip: {
      marginRight: 8,
    },
    dueDateText: {
      fontSize: 12,
      color: isTaskOverdue && !todo.completed
        ? theme.colors.error
        : theme.colors.onSurfaceVariant,
      fontWeight: isTaskOverdue && !todo.completed ? '500' : '400',
    },
    actionButton: {
      marginLeft: 4,
    },
    priorityIndicator: {
      width: 4,
      height: '100%',
      backgroundColor: priorityColor,
      borderRadius: 2,
      marginRight: 12,
    },
  });

  return (
    <Card style={styles.card} elevation={todo.completed ? 1 : 2}>
      <TouchableOpacity
        onPress={() => onEdit(todo)}
        activeOpacity={0.7}
        style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.priorityIndicator} />
          <Checkbox
            status={todo.completed ? 'checked' : 'unchecked'}
            onPress={() => onToggleComplete(todo.id, !todo.completed)}
            color={theme.colors.primary}
            style={styles.checkbox}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {truncateText(todo.title, 50)}
            </Text>
            {todo.description && (
              <Text style={styles.description}>
                {truncateText(todo.description, 100)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.leftFooter}>
            <Chip
              mode="outlined"
              compact
              style={[styles.priorityChip, { borderColor: priorityColor }]}
              textStyle={{ color: priorityColor, fontSize: 11 }}>
              {getPriorityLabel(todo.priority)}
            </Chip>
            <Text style={styles.dueDateText}>
              {formatDate(todo.dueDate)}
            </Text>
          </View>

          <View style={styles.rightFooter}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.primary}
              style={styles.actionButton}
              onPress={() => onEdit(todo)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              style={styles.actionButton}
              onPress={() => onDelete(todo.id)}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

export default TodoItem;