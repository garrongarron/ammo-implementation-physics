const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "node_modules/three/examples/js/libs/ammo.wasm.js", to: "ammo.wasm.js" },
        { from: "node_modules/three/examples/js/libs/ammo.wasm.wasm", to: "ammo.wasm.wasm" },
      ],
    }),
  ],
};