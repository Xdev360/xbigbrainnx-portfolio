/**
 * Apply local + cached CMS image URLs before cms.js runs — avoids placeholder flash.
 */
(function () {
  'use strict';

  var STORAGE = 'xbb-portfolio-cms-v1';

  function isUrl(val) {
    return typeof val === 'string' && (val.indexOf('http') === 0 || val.indexOf('data:') === 0);
  }

  function resolveSrc(key, cache) {
    if (!key) return '';
    if (window.LocalImages && window.LocalImages.hasLocal && window.LocalImages.hasLocal(key)) {
      return window.LocalImages.resolve(key);
    }
    var preferCms = window.LocalImages && window.LocalImages.preferCms();
    if (!preferCms && window.LocalImages) {
      return window.LocalImages.resolve(key);
    }
    if (cache && cache[key] && isUrl(cache[key])) {
      return cache[key];
    }
    if (window.LocalImages) {
      return window.LocalImages.resolve(key);
    }
    return '';
  }

  function markSlot(img) {
    var slot = img.parentElement;
    if (slot && slot.classList.contains('image-slot')) {
      slot.classList.add('filled');
    }
  }

  function bindFallback(img, key) {
    if (img.dataset.localFallback === 'true') return;
    img.dataset.localFallback = 'true';
    img.addEventListener('error', function onError() {
      if (!window.LocalImages || !key) return;
      var local = window.LocalImages.resolve(key);
      if (!local || img.src === local) return;
      img.src = local;
      markSlot(img);
    }, { once: true });
  }

  function hydrate(cache) {
    if (!document.querySelectorAll) return;
    document.querySelectorAll('[data-admin-image]').forEach(function (img) {
      var key = img.getAttribute('data-admin-image');
      if (!key) return;
      bindFallback(img, key);
      var val = resolveSrc(key, cache);
      if (!val) return;
      if (img.getAttribute('src') !== val) {
        img.src = val;
      }
      img.decoding = 'async';
      markSlot(img);
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
