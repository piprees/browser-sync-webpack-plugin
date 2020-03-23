function wasCompilationAboutCSS(compiler, expressionConfirmingCompilationWasAboutCSS){
  const { watchFileSystem } = compiler;
  const watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;

  const files = [...Object.keys(watcher.mtimes).filter((value) => value !== '.')];
  const allFilesAreCSS = files.every((value) => expressionConfirmingCompilationWasAboutCSS.test(value));

  if (files.length > 0) {
    if (allFilesAreCSS) return true;
    return false;
  }
  return null;
}

function CSSEmittedAssetNames(stats) {
  return Object.keys(stats.compilation.assets).filter(fileName => fileName.includes('.css')) || '*.css';
}

module.exports = { wasCompilationAboutCSS, CSSEmittedAssetNames }
