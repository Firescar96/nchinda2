const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      '/images': path.resolve(__dirname, './public/images/'),
      '/fonts': path.resolve(__dirname, './public/fonts/'),
    },
  },
}