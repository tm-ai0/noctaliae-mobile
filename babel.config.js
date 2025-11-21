module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Temporairement commenté jusqu'à ce que react-native-worklets soit installé
    // plugins: ['react-native-reanimated/plugin'],
  };
};
