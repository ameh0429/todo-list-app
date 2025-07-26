import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Switch,
  List,
  Divider,
  Avatar,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

import { User } from '../types';
import { apiService } from '../services/api';
import { useSnackbar } from '../components/SnackbarProvider';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail } from '../utils/helpers';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const navigation = useNavigation();
  const { showSuccess, showError } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>();

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
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
    profileContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    editImageButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
    },
    userName: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    input: {
      marginBottom: 16,
    },
    settingsItem: {
      paddingVertical: 8,
    },
    buttonContainer: {
      marginTop: 24,
    },
    button: {
      marginBottom: 12,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.backdrop,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await apiService.getUserProfile();
      setUser(userProfile);
      setName(userProfile.name);
      setEmail(userProfile.email);
      setProfilePicture(userProfile.profilePicture);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await apiService.updateUserProfile({
        name: name.trim(),
        email: email.trim(),
      });
      setUser(updatedUser);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          uploadProfilePicture(asset.uri);
        }
      }
    });
  };

  const uploadProfilePicture = async (imageUri: string) => {
    try {
      setUploadingImage(true);
      const imageUrl = await apiService.uploadProfilePicture(imageUri);
      setProfilePicture(imageUrl);
      
      // Update user profile with new image
      if (user) {
        const updatedUser = await apiService.updateUserProfile({
          profilePicture: imageUrl,
        });
        setUser(updatedUser);
      }
      
      showSuccess('Profile picture updated successfully!');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setProfilePicture(undefined);
              if (user) {
                const updatedUser = await apiService.updateUserProfile({
                  profilePicture: undefined,
                });
                setUser(updatedUser);
              }
              showSuccess('Profile picture removed');
            } catch (error) {
              showError('Failed to remove profile picture');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        
        <Card style={styles.card}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              {profilePicture ? (
                <TouchableOpacity onPress={handleImagePicker}>
                  <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleImagePicker}>
                  <Avatar.Text
                    size={120}
                    label={name ? name.charAt(0).toUpperCase() : 'U'}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
              )}
              
              <IconButton
                icon="camera"
                size={24}
                style={styles.editImageButton}
                iconColor={theme.colors.onPrimary}
                onPress={handleImagePicker}
              />
            </View>

            <Text style={styles.userName}>{name || 'User Name'}</Text>
            <Text style={styles.userEmail}>{email || 'user@example.com'}</Text>
            
            {profilePicture && (
              <Button
                mode="text"
                onPress={handleRemoveProfilePicture}
                textColor={theme.colors.error}
                compact>
                Remove Photo
              </Button>
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput
            label="Full Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            error={!!errors.name}
            placeholder="Enter your full name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            label="Email Address *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            error={!!errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Button
            mode="contained"
            onPress={handleSaveProfile}
            style={styles.button}
            loading={saving}
            disabled={saving}
            icon="content-save">
            Save Profile
          </Button>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <List.Item
            title="Dark Mode"
            description="Toggle between light and dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
            style={styles.settingsItem}
          />
          
          <Divider />
          
          <List.Item
            title="About"
            description="App version and information"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Todo App',
                'Version 1.0.0\n\nA beautiful and modern todo application built with React Native and Material Design.',
                [{ text: 'OK' }]
              );
            }}
            style={styles.settingsItem}
          />
        </Card>
      </ScrollView>

      {uploadingImage && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner text="Uploading image..." size="large" />
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;