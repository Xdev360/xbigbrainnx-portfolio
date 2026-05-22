/**
 * Apply local image URLs before cms.js runs — instant load, no Supabase.
 */
(function () {
  'use strict';

  function markSlot(img) {
    img.classList.add('is-loaded');
    var slot = img.parentElement;
    if (slot && slot.classList.contains('image-slot')) {
      slot.classList.add('filled');
    }
  }

  function bindImage(img, key) {
    if (!key || !window.LocalImages) return;
    var val = window.LocalImages.resolve(key);
    if (!val) return;

    img.addEventListener('load', function () { markSlot(img); }, { once: true });
    img.addEventListener('error', function () {
      img.classList.remove('is-loaded');
      var slot = img.parentElement;
      if (slot) slot.classList.remove('filled');
    }, { once: true });

    if (img.getAttribute('src') !== val) {
      img.src = val;
    }
    img.decoding = 'async';
    if (img.complete && img.naturalWidth > 0) {
      markSlot(img);
    }
  }

  function hydrate() {
    if (!document.querySelectorAll) return;
    document.querySelectorAll('[data-admin-image]').forEach(function (img) {
      bindImage(img, img.getAttribute('data-admin-image'));
    });
  }

  hydrate();

  window.__CMS_HYDRATE_IMAGES__ = hydrate;
})();
