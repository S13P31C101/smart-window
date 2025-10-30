module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 만약 react-native-reanimated를 설치했다면 이 줄의 주석을 푸세요.
    'react-native-reanimated/plugin', 
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
  ],
};
