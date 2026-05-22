/**
 * Apply cached CMS image URLs before cms.js runs — avoids placeholder flash.
 */
(function () {
  'use strict';

  var STORAGE = 'xbb-portfolio-cms-v1';

  function isUrl(val) {
    return typeof val === 'string' && (val.indexOf('http') === 0 || val.indexOf('data:') === 0);
  }

  function hydrate(cache) {
    if (!cache || !document.querySelectorAll) return;
    document.querySelectorAll('[data-admin-image]').forEach(function (img) {
      var key = img.getAttribute('data-admin-image');
      if (!key) return;
      var val = cache[key];
      if (!isUrl(val)) return;
      if (img.getAttribute('src') === val) return;
      img.src = val;
      img.decoding = 'async';
      var slot = img.parentElement;
      if (slot && slot.classList.contains('image-slot')) {
        slot.classList.add('filled');
      }
    });
  }

  try {
    window.__CMS_IMAGE_CACHE__ = JSON.parse(localStorage.getItem(STORAGE) || '{}');
  } catch (e) {
    window.__CMS_IMAGE_CACHE__ = {};
  }

  hydrate(window.__CMS_IMAGE_CACHE__);

  window.__CMS_HYDRATE_IMAGES__ = hydrate;
})();
