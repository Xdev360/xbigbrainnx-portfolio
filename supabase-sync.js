/**
 * Supabase sync layer for portfolio CMS.
 * Loads before cms.js. Requires @supabase/supabase-js CDN + supabase-config.js
 */
(function () {
  'use strict';

  const cfg = window.SUPABASE_CONFIG;
  let readClient = null;
  let writeClient = null;
  let enabled = false;

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
    readClient = window.supabase.createClient(cfg.url, cfg.anonKey);
    if (cfg.adminWriteKey && !String(cfg.adminWriteKey).includes('YOUR_RANDOM')) {
      writeClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
        global: { headers: { 'x-admin-key': cfg.adminWriteKey } }
      });
    } else {
      writeClient = readClient;
    }
    enabled = true;
    return true;
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
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return dataUrl;

    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return dataUrl;

    const mime = match[1];
    const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    const path = storagePath(fieldId, mime);

    const { error } = await writeClient.storage.from(bucket()).upload(path, bytes, {
      upsert: true,
      contentType: mime,
      cacheControl: '3600'
    });

    if (error) {
      console.error('Supabase upload failed', fieldId, error.message);
      throw error;
    }

    const { data } = writeClient.storage.from(bucket()).getPublicUrl(path);
    return data.publicUrl;
  }

  async function loadAll() {
    if (!enabled || !readClient) return {};

    const out = {};

    const [{ data: rows, error: cErr }, { data: lists, error: lErr }] = await Promise.all([
      readClient.from('cms_content').select('id, value'),
      readClient.from('cms_lists').select('list_key, item_ids')
    ]);

    if (cErr) console.error('cms_content load failed', cErr.message);
    if (lErr) console.error('cms_lists load failed', lErr.message);

    (rows || []).forEach(row => {
      out[row.id] = row.value;
    });

    (lists || []).forEach(row => {
      out[row.list_key] = row.item_ids;
    });

    return out;
  }

  async function upsertField(id, value) {
    if (!enabled || !writeClient) return;

    if (value === '' || value === null || value === undefined) {
      await writeClient.from('cms_content').delete().eq('id', id);
      return;
    }

    const finalValue = typeof value === 'string' && value.startsWith('data:')
      ? await uploadDataUrl(id, value)
      : value;

    const { error } = await writeClient.from('cms_content').upsert({
      id,
      value: finalValue,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
    return finalValue;
  }

  async function upsertList(listKey, ids) {
    if (!enabled || !writeClient) return;

    const { error } = await writeClient.from('cms_lists').upsert({
      list_key: listKey,
      item_ids: ids,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
  }

  async function deleteFields(ids) {
    if (!enabled || !writeClient || !ids.length) return;
    const { error } = await writeClient.from('cms_content').delete().in('id', ids);
    if (error) throw error;
  }

  async function deleteByPrefix(prefix) {
    if (!enabled || !readClient || !writeClient || !prefix) return;

    const { data, error } = await readClient
      .from('cms_content')
      .select('id')
      .like('id', `${prefix}%`);

    if (error) throw error;
    const ids = (data || []).map(r => r.id);
    if (ids.length) await deleteFields(ids);
  }

  async function migrateLocalStore(localData) {
    if (!enabled || !writeClient) return { ok: false, reason: 'not configured' };

    const entries = Object.entries(localData || {});
    const contentRows = [];
    const listRows = [];

    entries.forEach(([id, value]) => {
      if (id.startsWith('__list.')) {
        listRows.push({ list_key: id, item_ids: value, updated_at: new Date().toISOString() });
      } else {
        contentRows.push({ id, value, updated_at: new Date().toISOString() });
      }
    });

    if (contentRows.length) {
      const { error } = await writeClient.from('cms_content').upsert(contentRows);
      if (error) throw error;
    }

    if (listRows.length) {
      const { error } = await writeClient.from('cms_lists').upsert(listRows);
      if (error) throw error;
    }

    return { ok: true, content: contentRows.length, lists: listRows.length };
  }

  initClients();

  window.SupabaseCMS = {
    enabled,
    isConfigured,
    loadAll,
    upsertField,
    upsertList,
    deleteFields,
    deleteByPrefix,
    uploadDataUrl,
    migrateLocalStore
  };
})();
