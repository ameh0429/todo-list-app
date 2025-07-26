import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, useTheme } from 'react-native-paper';

interface SnackbarMessage {
  text: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface SnackbarContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);
  const [visible, setVisible] = useState(false);

  const showSnackbar = useCallback((message: SnackbarMessage) => {
    setSnackbar(message);
    setVisible(true);
  }, []);

  const hideSnackbar = useCallback(() => {
    setVisible(false);
    setTimeout(() => setSnackbar(null), 300); // Wait for animation to complete
  }, []);

  const showSuccess = useCallback((text: string, duration = 4000) => {
    showSnackbar({ text, type: 'success', duration });
  }, [showSnackbar]);

  const showError = useCallback((text: string, duration = 5000) => {
    showSnackbar({ text, type: 'error', duration });
  }, [showSnackbar]);

  const showInfo = useCallback((text: string, duration = 4000) => {
    showSnackbar({ text, type: 'info', duration });
  }, [showSnackbar]);

  const getSnackbarStyle = () => {
    if (!snackbar) return {};

    switch (snackbar.type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getActionColor = () => {
    if (!snackbar) return theme.colors.onSurface;

    switch (snackbar.type) {
      case 'success':
        return '#FFFFFF';
      case 'error':
        return theme.colors.onError;
      case 'info':
      default:
        return theme.colors.onPrimary;
    }
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
      }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={snackbar?.duration || 4000}
        action={{
          label: 'Dismiss',
          onPress: hideSnackbar,
          textColor: getActionColor(),
        }}
        style={getSnackbarStyle()}
        theme={theme}>
        {snackbar?.text || ''}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};