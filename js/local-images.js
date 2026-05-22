/**
 * Local images — all site images load from the images/ folder in this repo.
 * Admin handles text + voice notes only. Supabase never stores or loads images.
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

    isStorageKey: function (key) {
      if (!key || typeof key !== 'string') return false;
      if (key.indexOf('__list.') === 0 || key.indexOf('settings.') === 0) return false;
      if (/\.(mp3|wav|m4a|ogg|aac)$/i.test(key)) return false;
      if (/\.(jpg|jpeg|png|webp|gif)$/i.test(key)) return true;
      return false;
    },

    isImageValue: function (val) {
      if (typeof val !== 'string' || !val) return false;
      if (val.indexOf('data:image') === 0) return true;
      if ((val.indexOf('http://') === 0 || val.indexOf('https://') === 0) &&
          /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(val)) {
        return true;
      }
      return false;
    },

    /** Remove legacy Supabase image entries from CMS store objects. */
    stripFromStore: function (data) {
      if (!data || typeof data !== 'object') return {};
      var out = {};
      Object.keys(data).forEach(function (key) {
        var val = data[key];
        if (window.LocalImages.isStorageKey(key)) return;
        if (window.LocalImages.isImageValue(val)) return;
        out[key] = val;
      });
      return out;
    },

    resolve: function (key) {
      if (!key) return '';
      var k = String(key).replace(/^\//, '');
      return 'images/' + k;
    },

    repoPath: function (key) {
      return this.resolve(key);
    },

    applyAll: function (root) {
      root = root || document;
      if (!root.querySelectorAll) return;
      root.querySelectorAll('[data-admin-image]').forEach(function (img) {
        var key = img.getAttribute('data-admin-image');
        if (!key) return;
        var val = window.LocalImages.resolve(key);
        if (!val) return;
        if (img.getAttribute('src') !== val) {
          img.src = val;
        }
        img.classList.add('is-loaded');
        img.dataset.localSrc = val;
        var slot = img.parentElement;
        if (slot && slot.classList.contains('image-slot')) {
          slot.classList.add('filled');
        }
        if (img.dataset.localWatch === 'true') return;
        img.dataset.localWatch = 'true';
        var observer = new MutationObserver(function () {
          var currentKey = img.getAttribute('data-admin-image');
          var currentVal = window.LocalImages.resolve(currentKey);
          if (currentVal && img.getAttribute('src') !== currentVal) {
            img.src = currentVal;
          }
        });
        observer.observe(img, { attributes: true, attributeFilter: ['src', 'data-admin-image'] });
      });
    }
  };

  document.addEventListener('cms:applied', function () {
    window.LocalImages.applyAll(document);
  });
})();
