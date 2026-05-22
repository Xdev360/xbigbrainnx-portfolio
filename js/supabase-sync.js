/**
 * Supabase sync layer for portfolio CMS.
 * Loads before cms.js. Requires @supabase/supabase-js CDN + js/config/supabase-config.js
 */
(function () {
  'use strict';

  const cfg = window.SUPABASE_CONFIG;
  let readClient = null;
  let writeClient = null;
  let enabled = false;

  function normalizeUrl(url) {
    return String(url || '')
      .trim()
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/+$/, '');
  }

  function isConfigured() {
    return !!(
      cfg &&
      cfg.url &&
      cfg.anonKey &&
      !cfg.url.includes('YOUR_PROJECT') &&
      !cfg.anonKey.includes('YOUR_ANON')
    );
  }

  function initClients() {
    if (!isConfigured() || !window.supabase) return false;
    const url = normalizeUrl(cfg.url);
    readClient = window.supabase.createClient(url, cfg.anonKey);
    if (cfg.adminWriteKey && !String(cfg.adminWriteKey).includes('YOUR_RANDOM')) {
      writeClient = window.supabase.createClient(url, cfg.anonKey, {
        global: { headers: { 'x-admin-key': cfg.adminWriteKey } }
      });
    } else {
      writeClient = readClient;
    }
    enabled = true;
    return true;
  }

  function adminKey() {
    return (cfg && cfg.adminWriteKey) ? cfg.adminWriteKey : '';
  }

  function bucket() {
    return (cfg && cfg.storageBucket) || 'portfolio-media';
  }

  function extFromMime(mime) {
    if (!mime) return 'bin';
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('gif')) return 'gif';
    if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
    if (mime.includes('wav')) return 'wav';
    return 'bin';
  }

  function storagePath(fieldId, mime) {
    const safe = String(fieldId).replace(/^\//, '').replace(/\.\./g, '');
    if (/\.[a-z0-9]+$/i.test(safe)) return safe;
    return `${safe}.${extFromMime(mime)}`;
  }

  async function uploadDataUrl(fieldId, dataUrl) {
    if (!enabled || !writeClient) return dataUrl;
    if (window.LocalImages && window.LocalImages.isStorageKey(fieldId)) return dataUrl;
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return dataUrl;
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) return dataUrl;

    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return dataUrl;

    const mime = match[1];
    const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    const path = storagePath(fieldId, mime);

    try {
      const { error } = await writeClient.storage.from(bucket()).upload(path, bytes, {
        upsert: true,
        contentType: mime,
        cacheControl: '31536000'
      });

      if (error) throw error;

      const { data } = writeClient.storage.from(bucket()).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload failed, saving inline', fieldId, err.message || err);
      return dataUrl;
    }
  }

  async function loadAll() {
    if (!enabled || !readClient) return {};

    const out = {};

    const [{ data: rows, error: cErr }, { data: lists, error: lErr }] = await Promise.all([
      readClient.from('cms_content').select('id, value'),
      readClient.from('cms_lists').select('list_key, item_ids')
    ]);

    if (cErr) {
      console.error('cms_content load failed', cErr.message);
      throw cErr;
    }
    if (lErr) {
      console.error('cms_lists load failed', lErr.message);
      throw lErr;
    }

    (rows || []).forEach(row => {
      out[row.id] = row.value;
    });

    (lists || []).forEach(row => {
      out[row.list_key] = row.item_ids;
    });

    return out;
  }

  function isImageField(id, value) {
    if (window.LocalImages && window.LocalImages.isStorageKey(id)) return true;
    if (window.LocalImages && window.LocalImages.isImageValue(value)) return true;
    return false;
  }

  async function upsertField(id, value) {
    if (!enabled || !writeClient) return;
    if (isImageField(id, value)) return value;

    if (value === '' || value === null || value === undefined) {
      const { error } = await writeClient.rpc('cms_delete_content', {
        p_admin_key: adminKey(),
        p_id: id
      });
      if (error) throw error;
      return;
    }

    const finalValue = typeof value === 'string' && value.startsWith('data:')
      ? await uploadDataUrl(id, value)
      : value;

    const { error } = await writeClient.rpc('cms_upsert_content', {
      p_admin_key: adminKey(),
      p_id: id,
      p_value: finalValue
    });

    if (error) throw error;
    return finalValue;
  }

  async function upsertList(listKey, ids) {
    if (!enabled || !writeClient) return;

    const { error } = await writeClient.rpc('cms_upsert_list', {
      p_admin_key: adminKey(),
      p_list_key: listKey,
      p_item_ids: ids || []
    });

    if (error) throw error;
  }

  async function deleteFields(ids) {
    if (!enabled || !writeClient || !ids.length) return;
    const { error } = await writeClient.rpc('cms_delete_content_ids', {
      p_admin_key: adminKey(),
      p_ids: ids
    });
    if (error) throw error;
  }

  async function deleteByPrefix(prefix) {
    if (!enabled || !writeClient || !prefix) return;
    const { error } = await writeClient.rpc('cms_delete_content_prefix', {
      p_admin_key: adminKey(),
      p_prefix: prefix
    });
    if (error) throw error;
  }

  async function migrateLocalStore(localData) {
    if (!enabled || !writeClient) return { ok: false, reason: 'not configured' };

    const entries = Object.entries(localData || {});
    let content = 0;
    let lists = 0;

    for (const [id, value] of entries) {
      if (id.startsWith('__list.')) {
        await upsertList(id, value);
        lists += 1;
      } else {
        await upsertField(id, value);
        content += 1;
      }
    }

    return { ok: true, content, lists };
  }

  function ensureInit() {
    if (enabled) return true;
    return initClients();
  }

  initClients();

  let loadPromise = null;

  function prefetch() {
    if (!ensureInit()) return Promise.resolve({});
    if (!loadPromise) {
      loadPromise = loadAll().catch(function (err) {
        loadPromise = null;
        throw err;
      });
    }
    return loadPromise;
  }

  prefetch();

  window.SupabaseCMS = {
    enabled,
    ensureInit,
    isConfigured,
    loadAll,
    prefetch,
    upsertField,
    upsertList,
    deleteFields,
    deleteByPrefix,
    uploadDataUrl,
    migrateLocalStore
  };
})();
