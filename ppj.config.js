module.exports = {
  persist: ['author', 'description', 'keywords', 'license', 'name', 'repository', 'version'],
  alter: {
    main: './lib/index.js',
    module: './lib/esm/index.js',
  },
};
