// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // Adds support for `.obj` files for 3D Objects
  "obj"
);
config.resolver.assetExts.push(
  // Adds support for `.fbx` files for 3D Objects's metadata
  "fbx"
);

module.exports = config;
