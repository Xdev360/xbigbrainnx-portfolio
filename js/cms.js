/**
 * Client-side CMS — stores overrides in localStorage and applies them
 * to the public site via data-admin-* and data-cms-id attributes.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'xbb-portfolio-cms-v1';
  const ADMIN_SESSION = 'xbb-admin-session';

  const defaults = {
    'settings.adminPassword': 'xbigx244340',
    'settings.lifePassword': '244340',
    'settings.lifeLockEnabled': true
  };

  const DEFAULT_CATEGORIES = [
    'AI', 'Fintech', 'Web3', 'Gaming', 'SaaS',
    'Retail', 'Brand', 'Agency', 'Editorial', 'Creator Tools'
  ];

  const MEDIUM_DEFAULTS = {
    '01': {
      title: 'Designs speak to the brain: a raw concept of design psychology',
      about: 'On power, perception, and the people who learn to shape both',
      url: '#'
    },
    '02': {
      title: 'Social pills — the illusions we swallow',
      about: 'On the patterns the feed teaches us, and how to spit them out',
      url: '#'
    },
    '03': {
      title: 'Day-one energy — and why most builders quit right before the breakthrough',
      about: 'On starting again, on the messy middle, and on staying in the room',
      url: '#'
    }
  };

  const WRITING_DEFAULTS = {
    '01': {
      title: 'The bookmark trap',
      about: "On why we keep saving articles we'll never read — and the cheap trick that finally fixed it for me.",
      url: '#',
      image: 'life/writing/01.jpg'
    },
    '02': {
      title: 'Quiet hands',
      about: "A short essay on why discreet design — the kind that doesn't announce itself — wins the long game.",
      url: '#',
      image: 'life/writing/02.jpg'
    }
  };

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  let memoryStore = { ...readStore() };
  let remoteReady = false;
  let usingRemote = false;

  function writeStore(data) {
    memoryStore = { ...data };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* Storage blocked or full — site still works, login uses built-in password */
    }
  }

  function mergeRemote(data, markConnected) {
    if (data && Object.keys(data).length) {
      memoryStore = { ...memoryStore, ...data };
      writeStore(memoryStore);
    }
    if (markConnected || (data && Object.keys(data).length)) {
      remoteReady = true;
      usingRemote = true;
    }
  }

  async function initRemote() {
    const sb = window.SupabaseCMS;
    if (!sb || !sb.isConfigured || !sb.isConfigured()) return;
    if (sb.ensureInit) sb.ensureInit();
    if (!sb.enabled) {
      console.warn('Supabase config found but client did not initialize (is @supabase/supabase-js loaded?)');
      return;
    }
    try {
      const remote = sb.prefetch ? await sb.prefetch() : await sb.loadAll();
      mergeRemote(remote, true);
      applyContent();

      const localOnly = readStore();
      const listSyncTasks = [];

      Object.entries(localOnly).forEach(([key, value]) => {
        if (!key.startsWith('__list.')) return;
        const normalized = normalizeList(value);
        if (!normalized || !normalized.length) return;
        const remoteList = normalizeList(remote[key]);
        if (!remoteList || JSON.stringify(remoteList) !== JSON.stringify(normalized)) {
          listSyncTasks.push(
            sb.upsertList(key, normalized).then(() => sb.upsertField(key, normalized))
          );
        }
      });

      if (listSyncTasks.length) {
        Promise.all(listSyncTasks)
          .then(() => sb.loadAll())
          .then(fresh => {
            mergeRemote(fresh, true);
            applyContent();
          })
          .catch(err => console.warn('Background list sync failed', err));
      }

      const hasLocal = Object.keys(localOnly).length > 0;
      const hasRemote = Object.keys(remote).length > 0;
      if (hasLocal && !hasRemote && sb.migrateLocalStore) {
        sb.migrateLocalStore(localOnly)
          .then(() => sb.loadAll())
          .then(fresh => {
            mergeRemote(fresh);
            applyContent();
          })
          .catch(err => console.warn('Local migrate failed', err));
      }
    } catch (err) {
      console.error('Supabase load failed — using local cache', err);
      applyContent();
    }
  }

  async function persistField(id, value) {
    const data = { ...memoryStore };
    if (value === '' || value === null || value === undefined) {
      delete data[id];
    } else {
      data[id] = value;
    }
    writeStore(data);

    const sb = window.SupabaseCMS;
    if (!sb || !sb.isConfigured || !sb.isConfigured()) return value;
    if (sb.ensureInit) sb.ensureInit();
    if (!sb.enabled) return value;

    try {
      if (id.startsWith('__list.')) {
        const listIds = value === '' || value === null || value === undefined ? [] : value;
        await sb.upsertList(id, listIds);
        await sb.upsertField(id, listIds);
        return data[id];
      }

      if (value === '' || value === null || value === undefined) {
        await sb.deleteFields([id]);
      } else {
        const saved = await sb.upsertField(id, value);
        if (saved !== undefined && saved !== value) {
          data[id] = saved;
          writeStore(data);
        }
      }
    } catch (err) {
      console.error('Supabase save failed', id, err);
      throw err;
    }
    return data[id];
  }

  async function persistDeleteFields(fieldIds) {
    const data = { ...memoryStore };
    fieldIds.forEach(id => { delete data[id]; });
    writeStore(data);

    const sb = window.SupabaseCMS;
    if (sb && sb.enabled && fieldIds.length) {
      await sb.deleteFields(fieldIds);
    }
  }

  async function persistDeleteByPrefix(prefix) {
    const data = { ...memoryStore };
    Object.keys(data).forEach(key => {
      if (key.startsWith(prefix)) delete data[key];
    });
    writeStore(data);

    const sb = window.SupabaseCMS;
    if (sb && sb.enabled) await sb.deleteByPrefix(prefix);
  }

  function migrateStore() {
    const data = { ...memoryStore };
    const admin = data['settings.adminPassword'];
    const lifePw = defaults['settings.lifePassword'];
    const adminPw = defaults['settings.adminPassword'];

    /* Clear stale admin passwords — especially when life password was saved by mistake */
    if (
      admin === '244340' ||
      admin === lifePw ||
      admin === '' ||
      admin === null
    ) {
      delete data['settings.adminPassword'];
      writeStore(data);
    }
  }

  migrateStore();

  function getContent() {
    return { ...defaults, ...memoryStore };
  }

  function getField(id) {
    const data = getContent();
    return data[id] !== undefined ? data[id] : defaults[id];
  }

  function setField(id, value) {
    return persistField(id, value);
  }

  function setFields(partial) {
    const tasks = Object.entries(partial).map(([id, value]) => persistField(id, value));
    return Promise.all(tasks);
  }

  function getCategories() {
    const val = getField('__cms.categories');
    if (Array.isArray(val) && val.length) return val.slice();
    return DEFAULT_CATEGORIES.slice();
  }

  function setCategories(categories) {
    const cleaned = categories.map(c => String(c).trim()).filter(Boolean);
    setField('__cms.categories', cleaned);
  }

  function normalizeList(val) {
    if (Array.isArray(val)) return val.slice();
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  function getItemList(listKey, defaultIds) {
    const val = getField(listKey);
    const normalized = normalizeList(val);
    if (normalized && normalized.length) return normalized;
    return (defaultIds || []).slice();
  }

  function setItemList(listKey, ids) {
    setField(listKey, ids);
  }

  function nextItemId(existingIds) {
    let n = 1;
    while (true) {
      const id = n < 10 ? `0${n}` : String(n);
      if (!existingIds.includes(id)) return id;
      n += 1;
    }
  }

  function reorderItemList(listKey, itemId, direction, defaultIds) {
    const ids = getItemList(listKey, defaultIds).slice();
    const idx = ids.indexOf(itemId);
    if (idx < 0) return Promise.resolve(false);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= ids.length) return Promise.resolve(false);
    const next = ids.slice();
    const tmp = next[idx];
    next[idx] = next[newIdx];
    next[newIdx] = tmp;
    return Promise.resolve(setItemList(listKey, next)).then(() => true);
  }

  function deleteCardFields(fieldIds) {
    return persistDeleteFields(fieldIds);
  }

  function deleteFieldsByPrefix(prefix) {
    return persistDeleteByPrefix(prefix);
  }

  function syncDesignRegistry(content) {
    content = content || getContent();
    const ids = getItemList('__list.projects.design', ['01', '02', '03']);
    const base = { ...(window.CMS_DESIGN || {}) };
    ids.forEach(id => {
      const known = base[id];
      base[id] = {
        name: fieldValue(content, `projects.design.${id}.name`, known ? known.name : `Design project ${id}`),
        image: known && known.image ? known.image : `design/project-${id}.jpg`
      };
    });
    window.CMS_DESIGN = base;
    return base;
  }

  function syncCaseRegistry(content) {
    content = content || getContent();
    const ids = getItemList('__list.projects.case', ['01', '02', '03', '04', '05']);
    const base = { ...(window.CMS_CASES || {}) };
    ids.forEach(id => {
      const known = base[id];
      base[id] = {
        name: fieldValue(content, `projects.case.${id}.name`, known ? known.name : `Case study ${id}`),
        study: known ? known.study : `cases/study-${id}`,
        theme: fieldValue(content, `projects.case.${id}.theme`, known ? known.theme : '#3859E6')
      };
    });
    window.CMS_CASES = base;
    return base;
  }

  function formatCategoryText(content, key, fallback) {
    const val = content[key];
    if (!val) return fallback || '';
    const cats = Array.isArray(val) ? val : [];
    if (!cats.length) return fallback || '';
    return cats.join(' · ').toUpperCase();
  }

  function caseCoverPath(id) {
    const meta = (window.CMS_CASES || {})[id];
    if (meta && meta.study) {
      return `case-studies/${meta.study.replace('cases/', '')}.jpg`;
    }
    return `case-studies/study-${id}.jpg`;
  }

  function heroCaseCardCoverPath(id) {
    return `hero-cards/case-${id}.jpg`;
  }

  function heroDesignCardCoverPath(id) {
    return `hero-cards/design-${id}.jpg`;
  }

  function designCardCoverPath(id) {
    const registry = window.CMS_DESIGN || {};
    const known = registry[id];
    if (known && known.image) return known.image;
    return `design/project-${id}.jpg`;
  }

  function projectCoverPath(id) {
    return caseCoverPath(id);
  }

  function resolveAdminImageValue(content, key, options) {
    const opts = options || {};
    if (!key) return '';

    if (window.LocalImages) {
      return window.LocalImages.resolve(key);
    }

    if (opts.fallbacks) {
      for (let i = 0; i < opts.fallbacks.length; i++) {
        const fb = opts.fallbacks[i];
        if (window.LocalImages) {
          return window.LocalImages.resolve(fb);
        }
      }
    }

    if (opts.slug && /\/hero\.(png|jpg|jpeg|webp)$/i.test(key) && window.LocalImages) {
      return window.LocalImages.resolve(caseCoverPath(opts.slug));
    }

    return '';
  }

  function imageFallbacksForKey(key) {
    const caseMatch = key && key.match(/^hero-cards\/case-(\d+)\.jpg$/);
    if (caseMatch) {
      return [caseCoverPath(caseMatch[1])];
    }
    const designMatch = key && key.match(/^hero-cards\/design-(\d+)\.jpg$/);
    if (designMatch) {
      return [designCardCoverPath(designMatch[1])];
    }
    return [];
  }

  function isRealImageUrl(val) {
    if (typeof val !== 'string' || !val) return false;
    return (
      val.startsWith('http') ||
      val.startsWith('data:') ||
      val.startsWith('images/') ||
      (window.SITE_BASE && val.startsWith(window.SITE_BASE))
    );
  }

  function imageSrcAttr(content, key, options) {
    const val = resolveAdminImageValue(content, key, options || {});
    if (!isRealImageUrl(val)) return '';
    return ` src="${escapeHtml(val)}"`;
  }

  function markImageSlotFilled(img) {
    if (!img) return;
    const slot = img.parentElement;
    if (slot && slot.classList.contains('image-slot')) {
      slot.classList.add('filled');
    }
  }

  function applyImageToElement(el, content, caseSlug) {
    const key = el.dataset.adminImage;
    if (!key) return;
    const fallbacks = imageFallbacksForKey(key);
    const val = resolveAdminImageValue(content, key, { slug: caseSlug, fallbacks });
    if (isRealImageUrl(val)) {
      if (el.getAttribute('src') !== val) {
        el.src = val;
      }
      el.removeAttribute('srcset');
      if (el.complete && el.naturalWidth > 0) {
        markImageSlotFilled(el);
      }
    }
  }

  const CASE_CARD_DEFAULTS = {
    '01': { name: 'Zalary <em>Privacy Payroll</em>', about: 'A privacy-first payroll system built on Zcash in 24 hours. No wallet connections — viewing keys only.', tags: 'FINTECH · WEB3', role: 'Brand & UX Lead', year: '2025' },
    '02': { name: 'Credigo <em>Website &amp; Dashboard</em>', about: 'CrediGo enables individuals and businesses to access secure flexible loans across Nigeria.', tags: 'FINTECH · WEB 2', role: 'Graphics & UI/UX Designer', year: '2025' },
    '03': { name: 'Lumèa Essence <em>Brand System</em>', about: 'A self-care retail brand. Full identity, packaging, web presence and a TikTok-first content system.', tags: 'RETAIL · BRAND', role: 'Brand Strategist & Designer', year: '2024' },
    '04': { name: 'Wintech Studio <em>Agency Site</em>', about: 'A boutique design and engineering studio out of Lagos — identity, narrative and a site that punches above its weight.', tags: 'AGENCY · SAAS', role: 'Founder & Design Lead', year: '2024' },
    '05': { name: 'Untitled <em>AI Tool</em>', about: 'An AI-assisted writing companion for builders. Quiet UI, opinionated defaults, ships in under a second.', tags: 'AI · CREATOR TOOLS', role: 'Product Designer & Engineer', year: '2026' }
  };

  const DESIGN_CARD_DEFAULTS = {
    '01': { name: 'Lumèa Essence', about: 'A self-care retail brand. Identity, packaging, web presence and a TikTok-first content system.', label: 'BRAND DESIGN', image: 'design/lumea-essence.jpg' },
    '02': { name: 'The Brain Room', about: 'A visual system for the essay series — covers, illustrations and a shared grammar that runs across Substack, Medium and print.', label: 'EDITORIAL DESIGN', image: 'design/brain-room.jpg' },
    '03': { name: 'Wintech Studio', about: 'A boutique design and engineering studio out of Lagos — identity, narrative and a site that punches above its weight.', label: 'AGENCY IDENTITY', image: 'design/wintech.jpg' }
  };

  function fieldValue(content, key, fallback) {
    const val = content[key];
    if (val !== undefined && val !== null && val !== '') return val;
    return fallback;
  }

  function accentSoft(hex) {
    const raw = String(hex || '').replace('#', '');
    if (raw.length !== 6) return '#E6ECFB';
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const mix = c => Math.round(c * 0.14 + 255 * 0.86);
    const toHex = n => n.toString(16).padStart(2, '0');
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`.toUpperCase();
  }

  function getCaseSlug() {
    try {
      return new URLSearchParams(window.location.search).get('case') || '02';
    } catch {
      return '02';
    }
  }

  function getCaseMeta(slug) {
    const registry = window.CMS_CASES || {};
    return registry[slug] || registry['02'] || null;
  }

  function getCaseStudyLink(slug, content) {
    content = content || getContent();
    const custom = content[`projects.case.${slug}.link`];
    if (custom) return custom;
    return `case-study.html?case=${slug}`;
  }

  function applyCaseStudyLinks(root, content) {
    syncCaseRegistry(content);
    const ids = getItemList('__list.projects.case', ['01', '02', '03', '04', '05']);
    ids.forEach(slug => {
      const href = getCaseStudyLink(slug, content);
      root.querySelectorAll(`[data-admin-link="projects.case.${slug}.link"]`).forEach(el => {
        el.href = href;
      });
    });
  }

  function prepareCaseStudyPage(root) {
    const main = root.querySelector('.case-study');
    if (!main) return;

    const content = getContent();
    syncCaseRegistry(content);

    const slug = getCaseSlug();
    const meta = getCaseMeta(slug);
    if (!meta) return;

    const templateSlug = main.dataset.caseTemplate || '02';
    const templateStudy = main.dataset.caseStudy || 'cases/credigo';
    const accent = fieldValue(content, `projects.case.${slug}.theme`, meta.theme);
    const soft = fieldValue(content, `projects.case.${slug}.themeSoft`, accentSoft(accent));

    main.style.setProperty('--case-accent', accent);
    main.style.setProperty('--case-accent-soft', soft);

    root.querySelectorAll('[data-cms-id]').forEach(el => {
      const key = el.dataset.cmsId;
      if (key && key.includes(`projects.case.${templateSlug}`)) {
        el.dataset.cmsId = key.replace(`projects.case.${templateSlug}`, `projects.case.${slug}`);
      }
    });

    root.querySelectorAll('[data-admin-image]').forEach(el => {
      const key = el.dataset.adminImage;
      if (key && key.startsWith(`${templateStudy}/`)) {
        el.dataset.adminImage = key.replace(templateStudy, meta.study);
      }
    });

    root.querySelectorAll('[data-admin-link]').forEach(el => {
      const key = el.dataset.adminLink;
      if (key && key.includes(`projects.case.${templateSlug}`)) {
        el.dataset.adminLink = key.replace(`projects.case.${templateSlug}`, `projects.case.${slug}`);
      }
    });

    const titleEl = root.querySelector('[data-case-page-title]');
    const titleVal = fieldValue(content, `projects.case.${slug}.study.title`, fieldValue(content, `projects.case.${slug}.name`, meta.name));
    if (titleEl) titleEl.textContent = titleVal;

    document.title = `${titleVal} — Case Study · xbigbrainnx`;
  }

  function renderMediumList(root, content) {
    const container = root.querySelector('#medium-list');
    if (!container) return;

    const ids = getItemList('__list.home.medium', ['01', '02', '03']);
    container.innerHTML = ids.map((id, index) => {
      const fallback = MEDIUM_DEFAULTS[id] || { title: 'Untitled article', about: '', url: '#' };
      const title = fieldValue(content, `home.medium.${id}.title`, fallback.title);
      const about = fieldValue(content, `home.medium.${id}.about`, fallback.about);
      const url = fieldValue(content, `home.medium.${id}.url`, fallback.url);
      const primary = index === 0 ? ' primary' : '';

      return `
        <a href="${escapeHtml(url)}" class="medium-row${primary}" data-admin-link="home.medium.${id}.url">
          <div class="medium-row-text">
            <h4 data-cms-id="home.medium.${id}.title">${escapeHtml(title)}</h4>
            <p data-cms-id="home.medium.${id}.about">${escapeHtml(about)}</p>
          </div>
          <span class="medium-row-cta"><span>READ ARTICLE</span><span>→</span></span>
        </a>
      `;
    }).join('');
  }

  function renderSubstackCard(id, content, options) {
    const opts = options || {};
    const fallback = WRITING_DEFAULTS[id] || { title: 'Untitled', about: '', url: '#', image: `life/writing/${id}.jpg` };
    const title = fieldValue(content, `life.writing.${id}.title`, fallback.title);
    const about = fieldValue(content, `life.writing.${id}.about`, fallback.about);
    const url = fieldValue(content, `life.writing.${id}.url`, fallback.url);
    const imageKey = `life/writing/${id}.jpg`;
    const imageSrc = imageSrcAttr(content, imageKey);
    const linkBlock = opts.includeLink === false ? '' : `
      <a href="${escapeHtml(url)}" class="life-substack-link" data-cms-id="life.writing.${id}.url" target="_blank" rel="noopener">
        <span>Read on Substack</span>
        <span class="arrow">↗</span>
      </a>
    `;

    return `
      <article class="life-substack-card">
        <div class="life-substack-banner image-slot life-media" data-label="SUBSTACK BANNER ${id}">
          <img alt="" loading="lazy" data-admin-image="${imageKey}"${imageSrc}>
        </div>
        <div class="life-substack-body">
          <h3 class="life-substack-title" data-cms-id="life.writing.${id}.title">${escapeHtml(title)}</h3>
          <p class="life-substack-about" data-cms-id="life.writing.${id}.about">${escapeHtml(about)}</p>
          ${linkBlock}
        </div>
      </article>
    `;
  }

  function renderLifeWritingGrids(root, content) {
    const ids = getItemList('__list.life.writing', ['01', '02']);
    const mainGrid = root.querySelector('#life-writing-grid');
    const previewGrid = root.querySelector('#life-writing-preview');

    if (mainGrid) {
      mainGrid.innerHTML = ids.map(id => renderSubstackCard(id, content, { includeLink: true })).join('');
    }

    if (previewGrid) {
      const previewIds = ids.slice(0, 1);
      previewGrid.innerHTML = previewIds.map(id => renderSubstackCard(id, content, { includeLink: false })).join('');
    }
  }

  function renderHeroCaseCard(id, index, total, content) {
    const d = CASE_CARD_DEFAULTS[id] || { name: `Case study ${id}`, about: '', tags: '', role: 'Designer', year: '2026' };
    const name = fieldValue(content, `projects.case.${id}.name`, d.name);
    const about = fieldValue(content, `projects.case.${id}.about`, d.about);
    const tags = formatCategoryText(content, `projects.case.${id}.categories`, d.tags);
    const link = getCaseStudyLink(id, content);
    const cover = heroCaseCardCoverPath(id);
    const coverSrc = imageSrcAttr(content, cover, { fallbacks: imageFallbacksForKey(cover) });
    const num = String(index + 1).padStart(2, '0');
    const totalStr = String(total).padStart(2, '0');

    return `
      <article class="case-card" data-i="${index}">
        <div class="case-corner">${num}</div>
        <div class="case-preview image-slot" data-label="DASHBOARD PREVIEW">
          <img alt="" loading="eager" decoding="async" fetchpriority="high" data-admin-image="${cover}"${coverSrc}>
        </div>
        <div class="case-text">
          <div class="case-count">${num} / ${totalStr}</div>
          <h3 class="case-title"><span data-cms-id="projects.case.${id}.name" data-cms-html="true">${name}</span></h3>
          <div class="case-tags" data-cms-categories="projects.case.${id}.categories" data-cms-categories-format="text">${escapeHtml(tags)}</div>
          <p class="case-desc" data-cms-id="projects.case.${id}.about">${escapeHtml(about)}</p>
          <div class="case-meta">
            <div class="case-meta-row"><span class="case-meta-label">ROLE</span><span class="case-meta-value">${escapeHtml(d.role)}</span></div>
            <div class="case-meta-row"><span class="case-meta-label">YEAR</span><span class="case-meta-value">${escapeHtml(d.year)}</span></div>
          </div>
          <a href="${escapeHtml(link)}" class="case-cta" data-admin-link="projects.case.${id}.link"><span>Read case study</span><span>↗</span></a>
        </div>
      </article>
    `;
  }

  function renderProjectStackCard(id, index, total, content) {
    const d = CASE_CARD_DEFAULTS[id] || { name: `Case study ${id}`, about: '', tags: '', role: 'Designer', year: '2026' };
    const name = fieldValue(content, `projects.case.${id}.name`, d.name);
    const about = fieldValue(content, `projects.case.${id}.about`, d.about);
    const tags = formatCategoryText(content, `projects.case.${id}.categories`, d.tags);
    const link = getCaseStudyLink(id, content);
    const cover = projectCoverPath(id);
    const coverSrc = imageSrcAttr(content, cover, { fallbacks: imageFallbacksForKey(cover) });
    const num = String(index + 1).padStart(2, '0');
    const totalStr = String(total).padStart(2, '0');

    return `
      <article class="project-card" data-pos="${index}" data-index="${index}">
        <div class="project-corner">${num}</div>
        <div class="project-text">
          <div class="project-count">${num} / ${totalStr}</div>
          <h3 class="project-title" data-cms-id="projects.case.${id}.name" data-cms-html="true">${name}</h3>
          <div class="project-tags">${escapeHtml(tags)}</div>
          <p class="project-desc" data-cms-id="projects.case.${id}.about">${escapeHtml(about)}</p>
          <div class="project-meta">
            <div class="project-meta-row"><span class="project-meta-label">ROLE</span><span class="project-meta-value">${escapeHtml(d.role)}</span></div>
            <div class="project-meta-row"><span class="project-meta-label">YEAR</span><span class="project-meta-value">${escapeHtml(d.year)}</span></div>
          </div>
          <a href="${escapeHtml(link)}" class="project-cta" data-admin-link="projects.case.${id}.link"><span>Read case study</span><span>↗</span></a>
        </div>
        <div class="project-preview image-slot" data-label="PROJECT PREVIEW">
          <img alt="" loading="eager" decoding="async" data-admin-image="${cover}"${coverSrc}>
        </div>
      </article>
    `;
  }

  function renderHeroDesignCard(id, index, content) {
    const registry = window.CMS_DESIGN || {};
    const d = DESIGN_CARD_DEFAULTS[id] || {
      name: `Design project ${id}`,
      about: '',
      label: 'DESIGN',
      image: registry[id] ? registry[id].image : `design/project-${id}.jpg`
    };
    const meta = registry[id] || d;
    const name = fieldValue(content, `projects.design.${id}.name`, meta.name || d.name);
    const about = fieldValue(content, `projects.design.${id}.about`, d.about);
    const label = fieldValue(content, `projects.design.${id}.label`, d.label || 'DESIGN');
    const imageKey = heroDesignCardCoverPath(id);
    const imageSrc = imageSrcAttr(content, imageKey, { fallbacks: imageFallbacksForKey(imageKey) });

    return `
      <article class="design-card" data-i="${index}">
        <div class="design-card-hero image-slot" data-label="PROJECT COVER">
          <img alt="" loading="eager" decoding="async" fetchpriority="high" data-admin-image="${escapeHtml(imageKey)}"${imageSrc}>
        </div>
        <div class="design-card-body">
          <div class="design-card-label" data-cms-id="projects.design.${id}.label">${escapeHtml(label)}</div>
          <h3 class="design-card-title"><span data-cms-id="projects.design.${id}.name">${escapeHtml(name)}</span></h3>
          <p class="design-card-desc" data-cms-id="projects.design.${id}.about">${escapeHtml(about)}</p>
          <div class="design-card-tags" data-cms-categories="projects.design.${id}.categories"></div>
          <div class="design-card-footer">
            <div class="author">
              <div class="author-avatar profile-avatar">
                <img alt="" loading="lazy" data-admin-image="about/headshot.jpg">
              </div>
              <div class="author-info">
                <span class="author-name">Prof ✦</span>
                <span class="author-meta">SOLO PROJECT</span>
              </div>
            </div>
            <a href="#" class="view-pill" target="_blank" rel="noopener"><span>VIEW PROJECT</span><span>→</span></a>
          </div>
        </div>
      </article>
    `;
  }

  function markDeckActiveCards(deck) {
    if (!deck || !deck.children.length) return;
    Array.from(deck.children).forEach((card, i) => {
      card.dataset.active = i === 0 ? 'true' : 'false';
    });
  }

  function renderProjectDecks(root, content) {
    syncCaseRegistry(content);
    syncDesignRegistry(content);
    const caseIds = getItemList('__list.projects.case', ['01', '02', '03', '04', '05']);
    const designIds = getItemList('__list.projects.design', ['01', '02', '03']);
    const caseKey = caseIds.join(',');
    const designKey = designIds.join(',');

    const heroCaseDeck = root.querySelector('#hero-case-deck');
    if (heroCaseDeck && heroCaseDeck.dataset.renderKey !== caseKey) {
      heroCaseDeck.dataset.renderKey = caseKey;
      heroCaseDeck.innerHTML = caseIds.map((id, i) => renderHeroCaseCard(id, i, caseIds.length, content)).join('');
      markDeckActiveCards(heroCaseDeck);
    }

    const heroDesignDeck = root.querySelector('#hero-design-deck');
    if (heroDesignDeck && heroDesignDeck.dataset.renderKey !== designKey) {
      heroDesignDeck.dataset.renderKey = designKey;
      heroDesignDeck.innerHTML = designIds.map((id, i) => renderHeroDesignCard(id, i, content)).join('');
      markDeckActiveCards(heroDesignDeck);
    }

    const projectStack = root.querySelector('#project-stack');
    if (projectStack && projectStack.dataset.renderKey !== caseKey) {
      projectStack.dataset.renderKey = caseKey;
      projectStack.innerHTML = caseIds.map((id, i) => renderProjectStackCard(id, i, caseIds.length, content)).join('');
    }
  }

  function caseScreenListKey(slug) {
    return `__list.projects.case.${slug}.screens`;
  }

  function renderCaseStudyScreens(root, content, slug) {
    const stack = root.querySelector('[data-cms-render="case-screens"]');
    if (!stack || !slug) return;

    syncCaseRegistry(content);
    const meta = getCaseMeta(slug);
    if (!meta) return;

    const screenIds = getItemList(caseScreenListKey(slug), ['01', '02', '03', '04', '05']);
    const renderKey = `${slug}:${screenIds.join(',')}`;
    if (stack.dataset.renderKey === renderKey) return;

    stack.dataset.renderKey = renderKey;
    const studyFolder = meta.study;
    const rendered = screenIds.map((screenId, index) => {
      const num = String(index + 1).padStart(2, '0');
      const imageKey = `${studyFolder}/screen-${screenId}.png`;
      const titleKey = `projects.case.${slug}.study.screen.${screenId}.title`;
      const descKey = `projects.case.${slug}.study.screen.${screenId}.desc`;
      const title = fieldValue(content, titleKey, '');
      const desc = fieldValue(content, descKey, '');
      if (!title) return '';

      const totalStr = String(screenIds.length).padStart(2, '0');
      const screenSrc = imageSrcAttr(content, imageKey, { slug });

      return `
        <article class="case-screen-card">
          <div class="case-screen-preview image-slot is-desktop" data-label="">
            <img alt="" loading="eager" decoding="async" data-admin-image="${escapeHtml(imageKey)}"${screenSrc}>
          </div>
          <div class="case-screen-meta">
            <span class="case-screen-step">${num} / ${totalStr}</span>
            <h4 class="case-screen-title" data-cms-id="${titleKey}">${escapeHtml(title)}</h4>
            <p class="case-screen-desc" data-cms-id="${descKey}">${escapeHtml(desc)}</p>
          </div>
        </article>
      `;
    }).filter(Boolean);

    stack.innerHTML = rendered.join('');
  }

  function renderFoodItems(ids, content) {
    return ids.map(id => {
      const name = fieldValue(content, `life.food.${id}.name`, `Dish ${id}`);
      return `
        <article class="life-food-card">
          <div class="life-food-image image-slot life-media" data-label="DISH ${id}">
            <img alt="" loading="lazy" data-admin-image="life/food/${id}.jpg">
          </div>
          <h3 class="life-food-name" data-cms-id="life.food.${id}.name">${escapeHtml(name)}</h3>
        </article>
      `;
    }).join('');
  }

  function renderGymItems(ids) {
    return ids.map(id => `
      <div class="life-gym-tile image-slot life-media" data-label="GYM ${id}">
        <img alt="" loading="lazy" data-admin-image="life/gym/${id}.jpg">
      </div>
    `).join('');
  }

  function renderAppItems(ids, content) {
    return ids.map(id => {
      const name = fieldValue(content, `life.apps.${id}.name`, `App ${id}`);
      const desc = fieldValue(content, `life.apps.${id}.desc`, '');
      const url = fieldValue(content, `life.apps.${id}.url`, '#');
      return `
        <a href="${escapeHtml(url)}" class="life-app-row" data-admin-link="life.apps.${id}.url" target="_blank" rel="noopener">
          <div class="life-app-row-icon image-slot life-media" data-label="APP ${id}">
            <img alt="" loading="lazy" data-admin-image="life/apps/${id}.jpg">
          </div>
          <div class="life-app-row-copy">
            <span class="life-app-row-name" data-cms-id="life.apps.${id}.name">${escapeHtml(name)}</span>
            <span class="life-app-row-desc" data-cms-id="life.apps.${id}.desc">${escapeHtml(desc)}</span>
          </div>
          <span class="life-app-row-action">Open ↗</span>
        </a>
      `;
    }).join('');
  }

  function renderArtItems(ids) {
    return ids.map(id => `
      <div class="life-art-tile image-slot life-media" data-label="ART ${id}">
        <img alt="" loading="lazy" data-admin-image="life/arts/${id}.jpg">
      </div>
    `).join('');
  }

  function renderWallpaperItems(ids, content) {
    return ids.map(id => {
      const name = fieldValue(content, `products.wallpapers.bundle-${id}.name`, `Wallpaper bundle ${id}`);
      const detail = fieldValue(content, `products.wallpapers.bundle-${id}.detail`, '');
      const url = fieldValue(content, `products/wallpapers/bundle-${id}-url`, '#');
      return `
        <a href="${escapeHtml(url)}" class="products-bundle" target="_blank" rel="noopener" data-admin-link="products/wallpapers/bundle-${id}-url">
          <div class="products-bundle-cover image-slot life-media" data-label="BUNDLE ${id}">
            <img alt="" loading="lazy" data-admin-image="products/wallpapers/bundle-${id}.jpg">
          </div>
          <div class="products-bundle-meta">
            <span class="products-bundle-tag">Bundle</span>
            <h4 class="products-bundle-name" data-cms-id="products.wallpapers.bundle-${id}.name">${escapeHtml(name)}</h4>
            <p class="products-bundle-detail" data-cms-id="products.wallpapers.bundle-${id}.detail">${escapeHtml(detail)}</p>
            <span class="products-bundle-action">Shop bundle ↗</span>
          </div>
        </a>
      `;
    }).join('');
  }

  function renderComicItems(ids, content) {
    return ids.map(id => {
      const title = fieldValue(content, `products.comics.${id}.title`, `Comic ${id}`);
      const about = fieldValue(content, `products.comics.${id}.about`, '');
      const url = fieldValue(content, `products/comics/${id}-url`, '#');
      return `
        <article class="products-comic">
          <div class="products-comic-cover image-slot life-media" data-label="COMIC ${id}">
            <img alt="" loading="lazy" data-admin-image="products/comics/${id}.jpg">
          </div>
          <div class="products-comic-info">
            <h4 class="products-comic-title" data-cms-id="products.comics.${id}.title">${escapeHtml(title)}</h4>
            <p class="products-comic-about" data-cms-id="products.comics.${id}.about">${escapeHtml(about)}</p>
            <a href="${escapeHtml(url)}" class="products-comic-link" target="_blank" rel="noopener" data-admin-link="products/comics/${id}-url">
              <span>Read or buy</span><span class="arrow">↗</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderClothingItems(ids, content) {
    return ids.map(id => {
      const tee = id === '01' ? 'products/clothing/01.jpg' : `products/clothing/${id}-tee.jpg`;
      const hoodie = id === '01' ? 'products/clothing/02.jpg' : `products/clothing/${id}-hoodie.jpg`;
      const cap = id === '01' ? 'products/clothing/03.jpg' : `products/clothing/${id}-cap.jpg`;
      const brandKey = id === '01' ? 'products.clothing.brandName' : `products.clothing.${id}.brandName`;
      const aboutKey = id === '01' ? 'products.clothing.about' : `products.clothing.${id}.about`;
      const storeKey = id === '01' ? 'products/clothing/store-url' : `products/clothing/${id}.store-url`;
      const brand = fieldValue(content, brandKey, 'Clothing brand');
      const about = fieldValue(content, aboutKey, '');
      const url = fieldValue(content, storeKey, '#');

      return `
        <article class="products-brand products-brand--full">
          <div class="products-brand-preview products-brand-preview--wide">
            <div class="products-brand-image image-slot life-media" data-label="TEE ${id}">
              <img alt="" loading="lazy" data-admin-image="${tee}">
            </div>
            <div class="products-brand-image image-slot life-media" data-label="HOODIE ${id}">
              <img alt="" loading="lazy" data-admin-image="${hoodie}">
            </div>
            <div class="products-brand-image image-slot life-media" data-label="CAP ${id}">
              <img alt="" loading="lazy" data-admin-image="${cap}">
            </div>
          </div>
          <div class="products-brand-info">
            <h4 class="products-brand-name" data-cms-id="${brandKey}">${escapeHtml(brand)}</h4>
            <p class="products-brand-about" data-cms-id="${aboutKey}">${escapeHtml(about)}</p>
            <a href="${escapeHtml(url)}" class="products-brand-store" target="_blank" rel="noopener" data-admin-link="${storeKey}">
              <span>Visit store</span><span class="arrow">↗</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderArtSaleItems(ids, content) {
    return ids.map(id => {
      const name = fieldValue(content, `products.art.${id}.name`, `Artwork ${id}`);
      const price = fieldValue(content, `products.art.${id}.price`, '');
      const url = fieldValue(content, `products/art/${id}-url`, '#');
      return `
        <article class="products-card">
          <div class="products-card-image image-slot life-media" data-label="ART ${id}">
            <img alt="" loading="lazy" data-admin-image="products/art/${id}.jpg">
          </div>
          <div class="products-card-meta">
            <h4 class="products-card-name" data-cms-id="products.art.${id}.name">${escapeHtml(name)}</h4>
            <span class="products-card-price" data-cms-id="products.art.${id}.price">${escapeHtml(price)}</span>
          </div>
          <a href="${escapeHtml(url)}" class="products-card-cta" data-admin-link="products/art/${id}-url" target="_blank" rel="noopener">
            <span>Enquire</span><span class="arrow">↗</span>
          </a>
        </article>
      `;
    }).join('');
  }

  function renderEbookItems(ids, content) {
    return ids.map(id => {
      const name = fieldValue(content, `products.ebooks.${id}.name`, `E-book ${id}`);
      const price = fieldValue(content, `products.ebooks.${id}.price`, '');
      const tagline = fieldValue(content, `products.ebooks.${id}.tagline`, '');
      const url = fieldValue(content, `products/ebooks/${id}-url`, '#');
      return `
        <article class="products-card products-card--ebook">
          <div class="products-card-image image-slot life-media products-card-image--ebook" data-label="EBOOK ${id}">
            <img alt="" loading="lazy" data-admin-image="products/ebooks/${id}.jpg">
          </div>
          <div class="products-card-meta">
            <h4 class="products-card-name" data-cms-id="products.ebooks.${id}.name">${escapeHtml(name)}</h4>
            <span class="products-card-price" data-cms-id="products.ebooks.${id}.price">${escapeHtml(price)}</span>
          </div>
          <p class="products-card-tagline" data-cms-id="products.ebooks.${id}.tagline">${escapeHtml(tagline)}</p>
          <a href="${escapeHtml(url)}" class="products-card-cta" data-admin-link="products/ebooks/${id}-url" target="_blank" rel="noopener">
            <span>Buy PDF</span><span class="arrow">↗</span>
          </a>
        </article>
      `;
    }).join('');
  }

  function renderFamilyCharacters(ids, content) {
    return ids.map(id => {
      const name = fieldValue(content, `life.family.${id}.name`, `Character ${id}`);
      const about = fieldValue(content, `life.family.${id}.about`, '');
      return `
        <article class="family-card">
          <div class="family-card-image image-slot life-media" data-label="CHARACTER ${id}">
            <img alt="" loading="lazy" data-admin-image="life/family/${id}.jpg">
          </div>
          <h3 class="family-card-name" data-cms-id="life.family.${id}.name">${escapeHtml(name)}</h3>
          <p class="family-card-about" data-cms-id="life.family.${id}.about">${escapeHtml(about)}</p>
        </article>
      `;
    }).join('');
  }

  function renderLifeLists(root, content) {
    const renderMap = {
      food: () => renderFoodItems(getItemList('__list.life.food', ['01', '02', '03', '04', '05', '06']), content),
      gym: () => renderGymItems(getItemList('__list.life.gym', ['01', '02', '03', '04', '05', '06'])),
      apps: () => renderAppItems(getItemList('__list.life.apps', ['01', '02', '03']), content),
      arts: () => renderArtItems(getItemList('__list.life.arts', ['01', '02', '03', '04', '05', '06'])),
      wallpapers: () => renderWallpaperItems(getItemList('__list.life.wallpapers', ['01', '02', '03', '04', '05']), content),
      comics: () => renderComicItems(getItemList('__list.life.comics', ['01', '02']), content),
      clothing: () => renderClothingItems(getItemList('__list.life.clothing', ['01']), content),
      'art-sale': () => renderArtSaleItems(getItemList('__list.life.art-sale', ['01', '02', '03']), content),
      ebooks: () => renderEbookItems(getItemList('__list.life.ebooks', ['01', '02']), content),
      family: () => renderFamilyCharacters(getItemList('__list.life.family', ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']), content)
    };

    Object.entries(renderMap).forEach(([key, fn]) => {
      root.querySelectorAll(`[data-cms-render="${key}"]`).forEach(el => {
        el.innerHTML = fn();
      });
    });
  }

  function renderDynamicLists(root, content) {
    renderMediumList(root, content);
    renderLifeWritingGrids(root, content);
    renderProjectDecks(root, content);
    renderLifeLists(root, content);
  }

  function isBlogDateKey(key) {
    return key === 'life.blog.date' || /^life\.blog\.\d+\.date$/.test(key);
  }

  function formatBlogDateDisplay(val) {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(val))) {
      const parts = String(val).split('-').map(Number);
      const parsed = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
    return String(val);
  }

  function applyBlogDates(root, content) {
    root.querySelectorAll('.life-blog-date[data-cms-id]').forEach(el => {
      const key = el.dataset.cmsId;
      if (!isBlogDateKey(key)) return;
      const val = content[key];
      if (!val) {
        el.hidden = true;
        el.style.display = 'none';
        el.removeAttribute('datetime');
        return;
      }
      el.hidden = false;
      el.style.display = '';
      el.textContent = formatBlogDateDisplay(val);
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(val))) {
        el.setAttribute('datetime', String(val));
      } else {
        el.removeAttribute('datetime');
      }
    });
  }

  function applyContent(root) {
    root = root || document;
    const content = getContent();

    if (root.querySelector('.case-study')) {
      prepareCaseStudyPage(root);
    }

    renderDynamicLists(root, content);
    applyCaseStudyLinks(root, content);

    const caseSlug = root.querySelector('.case-study') ? getCaseSlug() : null;
    if (caseSlug) {
      renderCaseStudyScreens(root, content, caseSlug);
    }

    root.querySelectorAll('[data-admin-image]').forEach(el => {
      applyImageToElement(el, content, caseSlug);
    });

    root.querySelectorAll('[data-admin-link]').forEach(el => {
      const key = el.dataset.adminLink;
      const val = content[key];
      if (val) el.href = val;
    });

    root.querySelectorAll('[data-admin-audio]').forEach(el => {
      const key = el.dataset.adminAudio;
      const val = content[key];
      if (val) el.src = val;
    });

    root.querySelectorAll('[data-cms-categories]').forEach(el => {
      const key = el.dataset.cmsCategories;
      const val = content[key];
      if (!val) return;
      const cats = Array.isArray(val) ? val : (() => {
        try { return JSON.parse(val); } catch { return String(val).split(',').map(s => s.trim()).filter(Boolean); }
      })();
      if (!cats.length) return;
      if (el.dataset.cmsCategoriesFormat === 'text') {
        el.textContent = cats.join(' · ').toUpperCase();
      } else {
        el.innerHTML = cats.map(c => `<span class="tag-outline">${escapeHtml(c)}</span>`).join('');
      }
    });

    root.querySelectorAll('[data-cms-id]').forEach(el => {
      const key = el.dataset.cmsId;
      const val = content[key];
      if (val === undefined || val === null || val === '') return;

      if (el.dataset.cmsHtml === 'true') {
        el.innerHTML = val;
        return;
      }

      if (el.tagName === 'A') {
        el.href = val;
        return;
      }

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = val;
        return;
      }

      if (key === 'life.blog.body' && el.classList.contains('life-blog-body')) {
        el.innerHTML = String(val).split('\n').filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join('');
        return;
      }

      if (isBlogDateKey(key) && el.classList.contains('life-blog-date')) {
        return;
      }

      el.textContent = val;
    });

    applyBlogDates(root, content);

    const lifeRoot = root.querySelector('.life');
    if (lifeRoot) {
      const enabled = getField('settings.lifeLockEnabled');
      lifeRoot.dataset.lifeLockEnabled = enabled ? 'true' : 'false';
    }

    if (document.body) {
      document.body.classList.add('cms-ready');
    }
    if (window.__CMS_HYDRATE_IMAGES__) {
      window.__CMS_HYDRATE_IMAGES__(content);
    }

    document.dispatchEvent(new CustomEvent('cms:applied', { detail: { root } }));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isAdminSession() {
    return sessionStorage.getItem(ADMIN_SESSION) === 'true';
  }

  function setAdminSession(active) {
    try {
      if (active) sessionStorage.setItem(ADMIN_SESSION, 'true');
      else sessionStorage.removeItem(ADMIN_SESSION);
    } catch {
      /* ignore */
    }
  }

  function verifyAdminPassword(input) {
    const trimmed = String(input).trim();
    if (!trimmed) return false;

    const adminDefault = defaults['settings.adminPassword'];
    const lifeDefault = defaults['settings.lifePassword'];

    /* Life password must never unlock the admin portal */
    if (trimmed === lifeDefault && trimmed !== adminDefault) {
      return false;
    }

    /* Canonical admin password always works (even if localStorage is stale) */
    if (trimmed === adminDefault) {
      return true;
    }

    const stored = memoryStore['settings.adminPassword'];
    if (stored && trimmed === String(stored).trim()) {
      return true;
    }

    return false;
  }

  function verifyLifePassword(input) {
    const trimmed = String(input).trim();
    if (!trimmed) return false;

    const lifeDefault = defaults['settings.lifePassword'];
    const adminDefault = defaults['settings.adminPassword'];

    /* Admin password must never unlock Life sections */
    if (trimmed === adminDefault && trimmed !== lifeDefault) {
      return false;
    }

    if (trimmed === lifeDefault) {
      return true;
    }

    const stored = memoryStore['settings.lifePassword'];
    if (stored && trimmed === String(stored).trim()) {
      return true;
    }

    return false;
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.CMS = {
    STORAGE_KEY,
    ADMIN_SESSION,
    defaults,
    DEFAULT_CATEGORIES,
    ready: initRemote(),
    isRemoteEnabled: () => !!(window.SupabaseCMS && window.SupabaseCMS.enabled),
    isUsingRemote: () => usingRemote,
    getContent,
    getField,
    setField,
    setFields,
    getCategories,
    setCategories,
    getItemList,
    setItemList,
    nextItemId,
    reorderItemList,
    caseScreenListKey,
    deleteCardFields,
    deleteFieldsByPrefix,
    syncCaseRegistry,
    getCaseSlug,
    getCaseMeta,
    getCaseStudyLink,
    accentSoft,
    applyContent,
    isAdminSession,
    setAdminSession,
    verifyAdminPassword,
    verifyLifePassword,
    readFileAsDataURL,
    refreshFromRemote: initRemote
  };

  function boot() {
    applyContent();
    CMS.ready.catch(function () {
      applyContent();
    });
  }

  boot();
})();
