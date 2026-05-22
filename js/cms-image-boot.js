/**
 * Apply local image URLs before cms.js runs — instant load, no Supabase.
 */
(function () {
  'use strict';

  function markSlot(img) {
    var slot = img.parentElement;
    if (slot && slot.classList.contains('image-slot')) {
      slot.classList.add('filled');
    }
  }

  function hydrate() {
    if (!window.LocalImages || !document.querySelectorAll) return;
    document.querySelectorAll('[data-admin-image]').forEach(function (img) {
      var key = img.getAttribute('data-admin-image');
      if (!key) return;
      var val = window.LocalImages.resolve(key);
      if (!val) return;
      if (img.getAttribute('src') !== val) {
        img.src = val;
      }
      img.decoding = 'async';
      markSlot(img);
    });
  }

  hydrate();

  window.__CMS_HYDRATE_IMAGES__ = hydrate;
})();
