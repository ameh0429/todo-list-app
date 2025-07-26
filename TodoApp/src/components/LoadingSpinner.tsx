import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text = 'Loading...',
  overlay = false,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: overlay
        ? theme.colors.backdrop
        : theme.colors.background,
    },
    overlayContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backdrop,
      zIndex: 1000,
    },
    content: {
      alignItems: 'center',
      padding: 20,
    },
    text: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
  });

  const Container = overlay ? View : View;
  const containerStyle = overlay ? styles.overlayContainer : styles.container;

  return (
    <Container style={containerStyle}>
      <View style={styles.content}>
        <ActivityIndicator
          animating={true}
          color={theme.colors.primary}
          size={size}
        />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </Container>
  );
};

export default LoadingSpinner;