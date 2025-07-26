import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'clipboard-list-outline',
  actionText,
  onAction,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: theme.colors.background,
    },
    icon: {
      marginBottom: 24,
      color: theme.colors.onSurfaceVariant,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    actionButton: {
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Icon name={icon} size={80} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.actionButton}
          icon="plus">
          {actionText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;