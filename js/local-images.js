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
 * By default the public site uses local files FIRST (no Supabase wait).
 * Admin preview still prefers cloud uploads when you save in the CMS.
 */
(function () {
  'use strict';

  window.LOCAL_IMAGES = {
    // Paste overrides here (CMS key → path or URL). Examples:
    // 'about/headshot.jpg': 'images/about/headshot.jpg',
    // 'hero-cards/case-01.jpg': 'images/hero-cards/case-01.jpg',
    // 'hero-cards/design-01.jpg': 'images/hero-cards/design-01.jpg',
    // 'case-studies/credigo.jpg': 'images/case-studies/credigo.jpg',
    // 'cases/credigo/hero.png': 'images/cases/credigo/hero.png',
  };

  /** Public site: local files win. Set true only if you want Supabase URLs first. */
  window.LOCAL_IMAGES_PREFER_CMS = false;

  window.LocalImages = {
    base: 'images/',

    resolve: function (key) {
      if (!key) return '';
      var k = String(key).replace(/^\//, '');
      if (window.LOCAL_IMAGES && window.LOCAL_IMAGES[k]) {
        return window.LOCAL_IMAGES[k];
      }
      return window.LocalImages.base + k;
    },

    preferCms: function () {
      return window.LOCAL_IMAGES_PREFER_CMS === true;
    }
  };
})();
