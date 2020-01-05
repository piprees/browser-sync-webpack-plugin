const browserSync = require('browser-sync')
const getCssOnlyEmittedAssetsNames = require('./getCssOnlyEmittedAssetsNames')
const { wasCompilationAboutCSS, CSSEmittedAssetNames } = require('./getEmittedAssetNamesIfTriggerIsCSSLike');

const defaultPluginOptions = {
  reload: true,
  name: 'bs-webpack-plugin',
  callback: undefined,
  injectCss: false,
  injectableTriggerFileTypes: '(scss|sass|less|sss|css)'
}

class BrowserSyncPlugin {
  constructor (browserSyncOptions, pluginOptions) {
    this.browserSyncOptions = Object.assign({}, browserSyncOptions)
    this.options = Object.assign({}, defaultPluginOptions, pluginOptions)

    this.browserSync = browserSync.create(this.options.name)
    this.isWebpackWatching = false
    this.isBrowserSyncRunning = false
  }

  apply (compiler) {
    const watchRunCallback = () => {
      this.isWebpackWatching = true
      if (this.options.reload && this.options.injectCss) {
        this.compilationTriggerWasAboutCss = wasCompilationAboutCSS(compiler, new RegExp(this.options.injectableTriggerFileTypes), 'g');
      }
    };

    const compilationCallback = () => {
      if (this.isBrowserSyncRunning && this.browserSyncOptions.notify) {
        this.browserSync.notify('Rebuilding...')
      }
    };

    const doneCallback = stats => {
      if (!this.isBrowserSyncRunning) {
        this.browserSync.init(this.browserSyncOptions, this.options.callback);
        this.isBrowserSyncRunning = true;
        return;
      }

      if (!this.isWebpackWatching) return;

      if (this.options.reload) {
        if (this.isBrowserSyncRunning && this.browserSyncOptions.notify && this.compilationTriggerWasAboutCss !== null) {
          this.browserSync.notify('Reloading...');
        }

        if (this.compilationTriggerWasAboutCss !== null) {
          this.browserSync.reload(this.options.injectCss && this.compilationTriggerWasAboutCss ? CSSEmittedAssetNames(stats) : true);
        }
      }
    };

    if (typeof compiler.hooks !== 'undefined') {
      compiler.hooks.watchRun.tap(BrowserSyncPlugin.name, watchRunCallback);
      compiler.hooks.compilation.tap(BrowserSyncPlugin.name, compilationCallback);
      compiler.hooks.done.tap(BrowserSyncPlugin.name, doneCallback);
    } else {
      compiler.plugin('watch-run', (watching, callback) => {
        watchRunCallback()
        callback(null, null)
      });
      compiler.plugin('compilation', compilationCallback);
      compiler.plugin('done', () => {
        watchRunCallback(...arguments);
        doneCallback(...arguments)
      });
    }
  }
}

module.exports = BrowserSyncPlugin
