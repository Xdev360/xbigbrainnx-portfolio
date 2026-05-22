/**
 * Apply local image URLs before cms.js runs — instant load, no Supabase.
 */
(function () {
  'use strict';

  function hydrate() {
    if (window.LocalImages) {
      window.LocalImages.applyAll(document);
    }
  }

  hydrate();

  window.__CMS_HYDRATE_IMAGES__ = hydrate;
})();
