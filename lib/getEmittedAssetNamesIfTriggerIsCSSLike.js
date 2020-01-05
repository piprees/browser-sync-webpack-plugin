function wasCompilationAboutCSS(compiler, expressionConfirmingCompilationWasAboutCSS){
  const { watchFileSystem } = compiler;
  const watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;

  const files = [...Object.keys(watcher.mtimes)];
  const editedFiles = files.filter((value) => value !== '.');
  const hasFiles = editedFiles.length > 0;
  const filesThatAreCSS = editedFiles.filter(file => expressionConfirmingCompilationWasAboutCSS.test(file));
  const everyFileIsCSS = filesThatAreCSS.length === editedFiles.length;

  if (hasFiles) {
    if (everyFileIsCSS) return true;
    return false;
  }
  return null;
}

function CSSEmittedAssetNames(stats) {
  return Object.keys(stats.compilation.assets).filter(fileName => fileName.includes('.css')) || '*.css';
}

module.exports = { wasCompilationAboutCSS, CSSEmittedAssetNames }
