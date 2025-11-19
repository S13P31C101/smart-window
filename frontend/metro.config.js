const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// 1. React Native의 기본 설정을 동기적으로 불러옵니다.
const defaultConfig = getDefaultConfig(__dirname);

// 2. SVG 설정을 추가하기 위한 별도의 설정 객체를 만듭니다.
const svgConfig = {
  transformer: {
    // 기존 transformer 설정을 유지하면서 SVG 변환기 경로만 추가/수정합니다.
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // 기존 resolver 설정을 유지하면서 SVG 확장자 규칙만 수정합니다.
    ...defaultConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

// 3. 기본 설정과 SVG 설정을 안전하게 병합하여 최종 설정을 내보냅니다.
module.exports = mergeConfig(defaultConfig, svgConfig);
