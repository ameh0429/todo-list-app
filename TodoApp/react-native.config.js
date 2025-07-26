module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          project: './ios/TodoApp.xcodeproj',
          xcodeprojModifier: (pbxProject) => {
            // optional: modify the generated project
          },
        },
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/android/',
          packageImportPath: 'import io.callstack.react_native_vector_icons.VectorIconsPackage;',
        },
      },
    },
  },
};