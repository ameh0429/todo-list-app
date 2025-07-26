import { Priority } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays === -1) {
    return 'Tomorrow';
  } else if (diffInDays > 0) {
    return `${diffInDays} days ago`;
  } else {
    return `In ${Math.abs(diffInDays)} days`;
  }
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getPriorityColor = (priority: Priority, isDarkMode: boolean = false): string => {
  const colors = {
    [Priority.LOW]: isDarkMode ? '#4CAF50' : '#2E7D32',
    [Priority.MEDIUM]: isDarkMode ? '#FF9800' : '#F57C00',
    [Priority.HIGH]: isDarkMode ? '#F44336' : '#C62828',
  };
  return colors[priority];
};

export const getPriorityLabel = (priority: Priority): string => {
  const labels = {
    [Priority.LOW]: 'Low',
    [Priority.MEDIUM]: 'Medium',
    [Priority.HIGH]: 'High',
  };
  return labels[priority];
};

export const isOverdue = (dueDate: string): boolean => {
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
};

export const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

export const sortTodosByPriority = <T extends { priority: Priority }>(todos: T[]): T[] => {
  const priorityOrder = {
    [Priority.HIGH]: 3,
    [Priority.MEDIUM]: 2,
    [Priority.LOW]: 1,
  };

  return [...todos].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
};

export const sortTodosByDueDate = <T extends { dueDate: string }>(todos: T[]): T[] => {
  return [...todos].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

export const filterTodosByStatus = <T extends { completed: boolean }>(
  todos: T[],
  showCompleted: boolean = true
): T[] => {
  if (showCompleted) {
    return todos;
  }
  return todos.filter(todo => !todo.completed);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const showSuccessMessage = (message: string): void => {
  // This will be implemented with the Snackbar component
  console.log('Success:', message);
};

export const showErrorMessage = (message: string): void => {
  // This will be implemented with the Snackbar component
  console.log('Error:', message);
};