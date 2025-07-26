import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { SnackbarProvider } from './src/components/SnackbarProvider';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
        translucent={Platform.OS === 'android'}
      />
      <SnackbarProvider>
        <AppNavigator />
      </SnackbarProvider>
    </PaperProvider>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;