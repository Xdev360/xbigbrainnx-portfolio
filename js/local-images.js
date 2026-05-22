/**
 * Local images — all site images load from the images/ folder in this repo.
 * Admin handles text + voice notes only. Drop files here, commit, push.
 */
(function () {
  'use strict';

  function detectSiteBase() {
    var script = document.currentScript;
    if (script && script.src) {
      return script.src.replace(/js\/local-images\.js(\?.*)?$/i, '');
    }
    var path = window.location.pathname;
    if (/\.html$/i.test(path)) {
      return window.location.origin + path.replace(/[^/]*$/, '');
    }
    if (path.endsWith('/')) {
      return window.location.origin + path;
    }
    return window.location.origin + path + '/';
  }

  window.SITE_BASE = detectSiteBase();

  window.LocalImages = {
    base: 'images/',

    /** CMS key → repo path under images/ (relative, works on GitHub Pages) */
    resolve: function (key) {
      if (!key) return '';
      var k = String(key).replace(/^\//, '');
      return 'images/' + k;
    },

    repoPath: function (key) {
      return this.resolve(key);
    }
  };
})();
