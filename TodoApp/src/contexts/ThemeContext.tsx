import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#6750A4',
  primaryContainer: '#EADDFF',
  secondary: '#625B71',
  secondaryContainer: '#E8DEF8',
  tertiary: '#7D5260',
  tertiaryContainer: '#FFD8E4',
  surface: '#FFFBFE',
  surfaceVariant: '#E7E0EC',
  background: '#FFFBFE',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#21005D',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1D192B',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#31111D',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  onError: '#FFFFFF',
  onErrorContainer: '#410002',
  onBackground: '#1C1B1F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  shadow: '#000000',
  scrim: '#000000',
  surfaceDisabled: '#1C1B1F1F',
  onSurfaceDisabled: '#1C1B1F61',
  backdrop: '#00000040',
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#D0BCFF',
  primaryContainer: '#4F378B',
  secondary: '#CCC2DC',
  secondaryContainer: '#4A4458',
  tertiary: '#EFB8C8',
  tertiaryContainer: '#633B48',
  surface: '#1C1B1F',
  surfaceVariant: '#49454F',
  background: '#1C1B1F',
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onPrimary: '#371E73',
  onPrimaryContainer: '#EADDFF',
  onSecondary: '#332D41',
  onSecondaryContainer: '#E8DEF8',
  onTertiary: '#492532',
  onTertiaryContainer: '#FFD8E4',
  onSurface: '#E6E1E5',
  onSurfaceVariant: '#CAC4D0',
  onError: '#690005',
  onErrorContainer: '#FFDAD6',
  onBackground: '#E6E1E5',
  outline: '#938F99',
  outlineVariant: '#49454F',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750A4',
  shadow: '#000000',
  scrim: '#000000',
  surfaceDisabled: '#E6E1E51F',
  onSurfaceDisabled: '#E6E1E561',
  backdrop: '#00000040',
};

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '100',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  android: {
    regular: {
      fontFamily: 'Roboto',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Roboto',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto',
      fontWeight: '100',
    },
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: lightColors,
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
  fonts: configureFonts({ config: fontConfig }),
};

interface ThemeContextType {
  isDarkMode: boolean;
  theme: typeof lightTheme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // If no saved preference, use system theme
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };

  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
    saveThemePreference(isDark);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleTheme,
        setTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};