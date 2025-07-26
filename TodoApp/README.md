# Todo App - React Native

A beautiful and responsive mobile frontend for a To-Do List App built with React Native, TypeScript, and Material Design principles.

## Features

- 📱 **Modern Material Design UI** - Beautiful and intuitive interface following Android Material Design guidelines
- 📝 **Complete Todo Management** - Create, edit, delete, and manage your tasks
- ✅ **Task Completion** - Mark tasks as completed/incomplete with checkboxes
- 🎯 **Priority System** - Set task priorities (Low, Medium, High) with color coding
- 📅 **Due Date Management** - Set and track due dates for your tasks
- 🔍 **Search & Filter** - Search tasks and filter by status (All, Active, Completed)
- 📱 **Profile Management** - Upload profile pictures and manage user information
- 🌙 **Dark/Light Theme** - Toggle between light and dark modes with persistent preference
- 🔄 **Real-time Sync** - Seamless integration with REST API backend
- 💬 **Toast Messages** - Success and error notifications using Material Design snackbars
- 📲 **Responsive Design** - Optimized for various Android screen sizes

## Tech Stack

- **React Native** 0.72.6
- **TypeScript** 4.8.4
- **React Native Paper** 5.11.1 (Material Design)
- **React Navigation** 6.x
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **React Native Vector Icons** for Material Design icons
- **React Native Image Picker** for profile picture uploads
- **React Native Date Picker** for date selection

## Project Structure

```
TodoApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── TodoItem.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── SnackbarProvider.tsx
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── AddTodoScreen.tsx
│   │   ├── EditTodoScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── contexts/            # React contexts
│   │   └── ThemeContext.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── utils/               # Utility functions
│       └── helpers.ts
├── App.tsx                  # Main app component
├── index.js                 # Entry point
└── package.json
```

## Prerequisites

- Node.js (>= 16)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- Java Development Kit (JDK) 11 or newer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TodoApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure Android Icons**
   ```bash
   npx react-native link react-native-vector-icons
   ```

## Configuration

### Backend Integration

Update the API base URL in `src/services/api.ts`:

```typescript
const BASE_URL = 'http://your-backend-url/api'; // Replace with your backend URL
```

### Required Backend Endpoints

The app expects the following REST API endpoints:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a specific todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion status
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/picture` - Upload profile picture

### API Response Format

All API responses should follow this format:

```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## Running the App

### Development

1. **Start Metro bundler**
   ```bash
   npm start
   # or
   yarn start
   ```

2. **Run on Android**
   ```bash
   npm run android
   # or
   yarn android
   ```

3. **Run on iOS (macOS only)**
   ```bash
   npm run ios
   # or
   yarn ios
   ```

### Production Build

1. **Android APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **iOS (requires Xcode)**
   - Open `ios/TodoApp.xcworkspace` in Xcode
   - Select "Product" > "Archive"

## Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Permissions

The app requires the following permissions:

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

### iOS (ios/TodoApp/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take profile pictures</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select profile pictures</string>
```

## Key Features Implementation

### Material Design Components
- Uses React Native Paper for consistent Material Design UI
- Custom color themes for light and dark modes
- Material Design typography and spacing

### State Management
- React Context for theme management
- Local state management with React hooks
- Persistent theme preference with AsyncStorage

### API Integration
- Axios for HTTP requests with interceptors
- Error handling and loading states
- Offline-first approach considerations

### Navigation
- Stack navigation with Material Design styling
- Type-safe navigation with TypeScript

### Image Handling
- Profile picture upload and management
- Image picker integration
- Image compression and optimization

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

3. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Vector icons not showing**
   - Make sure to run `npx react-native link react-native-vector-icons`
   - For Android, manually add fonts to `android/app/src/main/assets/fonts/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.