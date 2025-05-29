module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.dependencies && pkg.dependencies.globals) {
        delete pkg.dependencies.globals;
      }
      if (pkg.devDependencies && pkg.devDependencies.globals) {
        delete pkg.devDependencies.globals;
      }
      return pkg;
    }
  }
}; 