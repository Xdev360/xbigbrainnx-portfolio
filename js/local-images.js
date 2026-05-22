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

  function toAbsolute(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.indexOf('data:') === 0) return path;
    if (path.charAt(0) === '/') return window.location.origin + path;
    return window.SITE_BASE + path.replace(/^\.\//, '');
  }

  window.SITE_BASE = detectSiteBase();

  window.LocalImages = {
    base: 'images/',

    /** CMS key → repo path under images/ */
    resolve: function (key) {
      if (!key) return '';
      var k = String(key).replace(/^\//, '');
      return toAbsolute('images/' + k);
    },

    repoPath: function (key) {
      if (!key) return '';
      return 'images/' + String(key).replace(/^\//, '');
    }
  };
})();
