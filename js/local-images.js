/**
 * Local image manifest — edit this ONE file to map CMS keys to your files.
 *
 * HOW TO USE
 * ----------
 * 1. Drop image files into the `images/` folder (paths mirror CMS keys).
 *    Example: headshot → images/about/headshot.jpg
 *             case 01 hero card → images/hero-cards/case-01.jpg
 *
 * 2. Optional: override a key below with a custom path or full URL:
 *    'about/headshot.jpg': 'images/about/headshot.jpg',
 *    'about/headshot.jpg': 'https://example.com/photo.jpg',
 *
 * 3. Commit the images/ folder and push — GitHub Pages serves them instantly.
 *
 * Bundled images in LOCAL_IMAGES always win over Supabase uploads.
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

  window.LOCAL_IMAGES = {
    'about/headshot.jpg': 'images/about/headshot.jpg',
    'hero-cards/case-02.jpg': 'images/hero-cards/case-02.jpg',
    'case-studies/credigo.jpg': 'images/case-studies/credigo.jpg',
    'cases/credigo/hero.png': 'images/cases/credigo/hero.png',
    'cases/credigo/design-system.png': 'images/cases/credigo/design-system.png',
    'cases/credigo/screen-01.png': 'images/cases/credigo/screen-01.png',
    'cases/credigo/screen-02.png': 'images/cases/credigo/screen-02.png',
    'cases/credigo/screen-03.png': 'images/cases/credigo/screen-03.png',
    'cases/credigo/screen-04.png': 'images/cases/credigo/screen-04.png',
    'cases/credigo/screen-05.png': 'images/cases/credigo/screen-05.png'
  };

  /** Public site: local files win. Admin sets this true to preview fresh uploads first. */
  window.LOCAL_IMAGES_PREFER_CMS = false;

  window.LocalImages = {
    base: 'images/',

    hasLocal: function (key) {
      if (!key) return false;
      var k = String(key).replace(/^\//, '');
      return !!(window.LOCAL_IMAGES && window.LOCAL_IMAGES[k]);
    },

    resolve: function (key) {
      if (!key) return '';
      var k = String(key).replace(/^\//, '');
      var rel = (window.LOCAL_IMAGES && window.LOCAL_IMAGES[k]) || (window.LocalImages.base + k);
      return toAbsolute(rel);
    },

    preferCms: function () {
      return window.LOCAL_IMAGES_PREFER_CMS === true;
    }
  };
})();
