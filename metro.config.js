const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { assetExts, sourceExts},
  } = await getDefaultConfig();

  return {
    transformer: {
      assetPlugins: ['metro-transform-worker'],
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      assetExts: [
        ...assetExts,
        'png',
        'jpg',
        'obj',
        'mtl',
        'JPG',
        'vrx',
        'hdr',
        'gltf',
        'glb',
        'bin',
        'arobject',
        'gif',
      ],
      sourceExts: [...sourceExts, 'obj']
    },
    resetCache: true,
    maxWorkers: 2, // Adjust based on your CPU cores
  };
})();