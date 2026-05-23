(function () {
  'use strict';

  let workspaceEl;
  let navEl;
  let statusEl;
  let logoutBtn;
  let shellEl;
  let sidebarEl;
  let sidebarNavEl;
  let sidebarHeadingEl;
  let sidebarToggleEl;
  let sidebarToggleLabelEl;
  let sidebarBackdropEl;
  let schema;
  let activePanel = 'projects';
  let activeSubsection = {};
  let saveTimer = null;
  let dashboardReady = false;

  function getContent() {
    return window.CMS ? CMS.getContent() : {};
  }

  function saveErrorMessage(err) {
    if (!err) return 'Save failed';
    if (typeof err === 'string') return 'Save failed: ' + err;
    return 'Save failed: ' + (err.message || String(err));
  }

  function saveField(id, value) {
    if (!window.CMS) return;
    setStatus('Saving…');
    clearTimeout(saveTimer);
    Promise.resolve(CMS.setField(id, value))
      .then(() => setStatus(CMS.isUsingRemote() ? 'Saved to cloud' : 'Saved', true))
      .catch((err) => {
        console.error('Admin save failed', id, err);
        setStatus(saveErrorMessage(err));
      });
  }

  function setStatus(msg, saved) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-saved', !!saved);
  }

  function parseCategories(val) {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  }

  function getCategories() {
    if (window.CMS && CMS.getCategories) return CMS.getCategories();
    return schema && schema.categories ? schema.categories.slice() : [];
  }

  function getDynamicCards(dynamicDef, content) {
    if (!window.CMS || !dynamicDef || !dynamicDef.makeCard) return [];
    content = content || getContent();
    const ids = CMS.getItemList(dynamicDef.listKey, dynamicDef.defaultIds || []);
    return ids.map(itemId => {
      const card = dynamicDef.makeCard(itemId, content);
      card.deletable = true;
      card.itemId = itemId;
      card.dynamic = dynamicDef;
      return card;
    });
  }

  function collectFieldIds(cardDef) {
    const ids = (cardDef.fields || [])
      .filter(f => f.type !== 'localImage')
      .map(f => f.id);
    if (cardDef.nested) {
      if (cardDef.nested.fields) {
        cardDef.nested.fields
          .filter(f => f.type !== 'localImage')
          .forEach(f => ids.push(f.id));
      }
      if (cardDef.nested.screens && window.CMS) {
        const screenDef = cardDef.nested.screens;
        const screenIds = CMS.getItemList(screenDef.listKey, screenDef.defaultIds || []);
        screenIds.forEach(screenId => {
          screenDef.makeFields(screenId)
            .filter(f => f.type !== 'localImage')
            .forEach(f => ids.push(f.id));
        });
      }
    }
    return ids;
  }

  function addDynamicItem(dynamicDef, onDone) {
    if (!window.CMS) return;
    const ids = CMS.getItemList(dynamicDef.listKey, dynamicDef.defaultIds || []);
    const newId = CMS.nextItemId(ids);
    Promise.resolve(CMS.setItemList(dynamicDef.listKey, [...ids, newId]))
      .then(() => {
        setStatus(CMS.isUsingRemote() ? 'Added to cloud' : 'Added', true);
        if (onDone) onDone(newId);
      })
      .catch(() => setStatus('Add failed'));
  }

  function deleteDynamicItem(dynamicDef, itemId, onDone) {
    if (!window.CMS) return;
    const ids = CMS.getItemList(dynamicDef.listKey, dynamicDef.defaultIds || []).filter(id => id !== itemId);
    const card = dynamicDef.makeCard(itemId);
    const tasks = [
      CMS.setItemList(dynamicDef.listKey, ids),
      CMS.deleteCardFields(collectFieldIds(card))
    ];
    if (card.fieldPrefix) {
      tasks.push(CMS.deleteFieldsByPrefix(card.fieldPrefix));
    }
    if (card.nested && card.nested.screens) {
      const screenDef = card.nested.screens;
      const screenIds = CMS.getItemList(screenDef.listKey, screenDef.defaultIds || []);
      const screenFieldIds = screenIds.flatMap(screenId => screenDef.makeFields(screenId).map(f => f.id));
      tasks.push(CMS.deleteCardFields(screenFieldIds));
      tasks.push(CMS.setItemList(screenDef.listKey, []));
    }
    Promise.all(tasks)
      .then(() => {
        setStatus('Deleted', true);
        if (onDone) onDone();
      })
      .catch(() => setStatus('Delete failed'));
  }

  function reorderDynamicItem(dynamicDef, itemId, direction, onDone) {
    if (!window.CMS) return;
    CMS.reorderItemList(dynamicDef.listKey, itemId, direction, dynamicDef.defaultIds || [])
      .then(moved => {
        if (!moved) return;
        setStatus(CMS.isUsingRemote() ? 'Order saved to cloud' : 'Order saved', true);
        if (onDone) onDone();
      })
      .catch(() => setStatus('Reorder failed'));
  }

  function subsectionStorageKey(panelId) {
    return `xbb-admin-sub-${panelId}`;
  }

  function readStoredSubsection(panelId) {
    try {
      return sessionStorage.getItem(subsectionStorageKey(panelId));
    } catch {
      return null;
    }
  }

  function storeSubsection(panelId, subsectionId) {
    activeSubsection[panelId] = subsectionId;
    try {
      sessionStorage.setItem(subsectionStorageKey(panelId), subsectionId);
    } catch (e) {}
  }

  function getSubsections(panelId) {
    const panel = schema && schema.panels ? schema.panels[panelId] : null;
    if (!panel) return [];

    if (panel.groups) {
      return panel.groups.map(group => ({
        id: group.id,
        label: group.label,
        group
      }));
    }

    if (panel.sections) {
      return panel.sections.map(section => ({
        id: section.id,
        label: section.label,
        section
      }));
    }

    return [];
  }

  function resolveSubsectionId(panelId) {
    const subsections = getSubsections(panelId);
    if (!subsections.length) return null;

    const stored = readStoredSubsection(panelId) || activeSubsection[panelId];
    if (stored && subsections.some(s => s.id === stored)) return stored;

    return subsections[0].id;
  }

  function getPanelLabel(panelId) {
    return schema.nav.find(n => n.id === panelId)?.label || panelId;
  }

  function getSubsectionMeta(panelId, subsectionId) {
    return getSubsections(panelId).find(s => s.id === subsectionId) || null;
  }

  function isMobileSidebar() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function setSidebarOpen(open) {
    if (!shellEl) return;
    shellEl.classList.toggle('sidebar-open', open);
    if (sidebarToggleEl) sidebarToggleEl.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (sidebarBackdropEl) {
      if (open) sidebarBackdropEl.removeAttribute('hidden');
      else sidebarBackdropEl.setAttribute('hidden', '');
    }
  }

  function closeMobileSidebar() {
    if (isMobileSidebar()) setSidebarOpen(false);
  }

  function renderField(field, value, onUpdate) {
    const block = document.createElement('div');
    block.className = 'admin-field-block';

    const label = document.createElement('label');
    label.className = 'admin-field-label';
    label.textContent = field.label;
    block.appendChild(label);

    if (field.size) {
      const hint = document.createElement('span');
      hint.className = 'admin-field-hint';
      hint.textContent = field.size;
      block.appendChild(hint);
    }

    function bindTextSave(el, trim) {
      const commit = () => {
        const next = trim ? el.value.trim() : el.value;
        onUpdate(next);
      };
      el.addEventListener('change', commit);
      el.addEventListener('blur', commit);
    }

    if (field.type === 'localImage') {
      block.appendChild(renderLocalImageHint(field));
    } else if (field.type === 'image') {
      block.appendChild(renderLocalImageHint(field));
    } else if (field.type === 'audio') {
      block.appendChild(renderAudioInput(field, value, onUpdate));
    } else if (field.type === 'categories') {
      block.appendChild(renderCategoriesInput(field, value, onUpdate));
    } else if (field.type === 'textarea') {
      const ta = document.createElement('textarea');
      ta.className = 'admin-textarea';
      ta.value = value || '';
      bindTextSave(ta, false);
      block.appendChild(ta);
    } else if (field.type === 'toggle') {
      block.appendChild(renderToggleInput(field, value, onUpdate));
    } else if (field.type === 'date') {
      block.appendChild(renderDateInput(field, value, onUpdate));
    } else if (field.type === 'color') {
      block.appendChild(renderColorInput(field, value, onUpdate));
    } else if (field.type === 'password') {
      const input = document.createElement('input');
      input.type = 'password';
      input.className = 'admin-input';
      input.value = value || (CMS.defaults[field.id] || '');
      input.autocomplete = 'new-password';
      input.addEventListener('change', () => {
        const v = input.value.trim();
        if (v) onUpdate(v);
      });
      block.appendChild(input);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'admin-input';
      input.value = value || '';
      if (field.placeholder) input.placeholder = field.placeholder;
      bindTextSave(input, true);
      block.appendChild(input);
    }

    return block;
  }

  function renderLocalImageHint(field) {
    const wrap = document.createElement('div');
    wrap.className = 'admin-local-image';

    const path = window.LocalImages
      ? window.LocalImages.repoPath(field.id)
      : 'images/' + field.id;

    const pathEl = document.createElement('code');
    pathEl.className = 'admin-local-image-path';
    pathEl.textContent = path;
    wrap.appendChild(pathEl);

    const note = document.createElement('p');
    note.className = 'admin-local-image-note';
    note.textContent = 'Drop this file in your repo, commit, and push. Images are not uploaded via admin.';
    wrap.appendChild(note);

    if (window.LocalImages) {
      const preview = document.createElement('div');
      preview.className = 'admin-field-preview';
      const img = document.createElement('img');
      img.alt = field.label;
      img.src = window.LocalImages.resolve(field.id);
      img.addEventListener('error', () => {
        preview.classList.add('is-missing');
        img.remove();
        const missing = document.createElement('span');
        missing.className = 'admin-local-image-missing';
        missing.textContent = 'File not found yet — add it locally';
        preview.appendChild(missing);
      });
      preview.appendChild(img);
      wrap.appendChild(preview);
    }

    return wrap;
  }

  function renderImageInput(field, value, onUpdate) {
    const wrap = document.createElement('div');
    if (value) {
      const preview = document.createElement('div');
      preview.className = 'admin-field-preview';
      const img = document.createElement('img');
      img.src = value;
      img.alt = field.label;
      preview.appendChild(img);
      wrap.appendChild(preview);
    }
    const row = document.createElement('div');
    row.className = 'admin-field-row';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      if (!f || !window.CMS) return;
      try {
        onUpdate(await CMS.readFileAsDataURL(f));
      } catch {
        setStatus('Upload failed');
      }
    });
    row.appendChild(file);
    if (value) {
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'admin-btn admin-btn-ghost';
      clear.textContent = 'Remove';
      clear.addEventListener('click', () => onUpdate(''));
      row.appendChild(clear);
    }
    wrap.appendChild(row);
    return wrap;
  }

  function renderAudioInput(field, value, onUpdate) {
    const wrap = document.createElement('div');
    if (value) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = value;
      audio.style.width = '100%';
      audio.style.marginBottom = '10px';
      wrap.appendChild(audio);
    }
    const row = document.createElement('div');
    row.className = 'admin-field-row';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'audio/*';
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      if (!f || !window.CMS) return;
      try {
        onUpdate(await CMS.readFileAsDataURL(f));
      } catch {
        setStatus('Upload failed');
      }
    });
    row.appendChild(file);
    wrap.appendChild(row);
    return wrap;
  }

  function toDateInputValue(val) {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(val))) return String(val);
    const parsed = new Date(val);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  }

  function renderDateInput(field, value, onUpdate) {
    const row = document.createElement('div');
    row.className = 'admin-field-row';
    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'admin-input admin-input-date';
    input.value = toDateInputValue(value);
    input.addEventListener('change', () => onUpdate(input.value));
    row.appendChild(input);
    const hint = document.createElement('span');
    hint.className = 'admin-field-hint';
    hint.textContent = 'Click to open the calendar — no typing needed.';
    row.appendChild(hint);
    return row;
  }

  function renderColorInput(field, value, onUpdate) {
    const wrap = document.createElement('div');
    wrap.className = 'admin-color-row';

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'admin-color-picker';
    picker.value = /^#[0-9A-Fa-f]{6}$/.test(value || '') ? value : '#3859E6';

    const hex = document.createElement('input');
    hex.type = 'text';
    hex.className = 'admin-input admin-color-hex';
    hex.placeholder = '#3859E6';
    hex.value = value || picker.value.toUpperCase();

    const soft = document.createElement('span');
    soft.className = 'admin-color-soft';
    soft.textContent = 'Soft tint auto-applies on case study page';

    function commit(next) {
      const normalized = String(next || '').trim().toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(normalized)) return;
      picker.value = normalized;
      hex.value = normalized;
      if (window.CMS && CMS.accentSoft) {
        soft.textContent = `Page tint: ${CMS.accentSoft(normalized)}`;
      }
      onUpdate(normalized);
    }

    picker.addEventListener('input', () => commit(picker.value.toUpperCase()));
    hex.addEventListener('change', () => commit(hex.value.trim().toUpperCase()));
    if (window.CMS && CMS.accentSoft && hex.value) {
      soft.textContent = `Page tint: ${CMS.accentSoft(hex.value)}`;
    }

    wrap.appendChild(picker);
    wrap.appendChild(hex);
    wrap.appendChild(soft);
    return wrap;
  }

  function renderCategoriesInput(field, value, onUpdate) {
    const wrap = document.createElement('div');
    let selected = parseCategories(value);
    const max = field.max || 2;

    const grid = document.createElement('div');
    grid.className = 'admin-cat-grid';

    const note = document.createElement('p');
    note.className = 'admin-cat-note';

    function sync() {
      note.textContent = `${selected.length} / ${max} selected · tap chips to assign`;
      grid.querySelectorAll('.admin-cat-chip').forEach(btn => {
        btn.classList.toggle('is-on', selected.includes(btn.textContent));
      });
    }

    function paintChips() {
      grid.innerHTML = '';
      getCategories().forEach(cat => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'admin-cat-chip';
        chip.textContent = cat;
        chip.addEventListener('click', () => {
          if (selected.includes(cat)) {
            selected = selected.filter(c => c !== cat);
          } else if (selected.length < max) {
            selected = [...selected, cat];
          } else {
            selected = [...selected.slice(1), cat];
          }
          onUpdate(selected);
          sync();
        });
        grid.appendChild(chip);
      });
      sync();
    }

    const addRow = document.createElement('div');
    addRow.className = 'admin-cat-inline-add';
    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.className = 'admin-input';
    addInput.placeholder = 'New category name';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'admin-btn admin-btn-ghost';
    addBtn.textContent = 'Create category';
    addBtn.addEventListener('click', () => {
      const label = addInput.value.trim();
      if (!label || !window.CMS) return;
      const current = getCategories();
      if (current.some(c => c.toLowerCase() === label.toLowerCase())) {
        setStatus('Category already exists');
        return;
      }
      CMS.setCategories([...current, label]);
      schema.categories = CMS.getCategories();
      addInput.value = '';
      paintChips();
      setStatus('Category created', true);
    });
    addInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addBtn.click();
      }
    });
    addRow.appendChild(addInput);
    addRow.appendChild(addBtn);

    paintChips();
    wrap.appendChild(grid);
    wrap.appendChild(note);
    wrap.appendChild(addRow);
    return wrap;
  }

  function renderToggleInput(field, value, onUpdate) {
    const label = document.createElement('label');
    label.className = 'admin-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value !== undefined ? !!value : !!(CMS.defaults[field.id]);
    const span = document.createElement('span');
    span.textContent = input.checked ? 'On' : 'Off';
    input.addEventListener('change', () => {
      span.textContent = input.checked ? 'On' : 'Off';
      onUpdate(input.checked);
    });
    label.appendChild(input);
    label.appendChild(span);
    return label;
  }

  function renderNestedScreensBlock(screenDef, content) {
    const wrap = document.createElement('div');
    wrap.className = 'admin-nested-block admin-nested-screens';

    const toolbar = document.createElement('div');
    toolbar.className = 'admin-group-toolbar';

    const label = document.createElement('div');
    label.className = 'admin-nested-label';
    label.textContent = screenDef.label || 'Key screens';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'admin-btn admin-btn-ghost admin-btn-add';
    addBtn.textContent = '+ Add screen';
    addBtn.addEventListener('click', () => {
      const ids = CMS.getItemList(screenDef.listKey, screenDef.defaultIds || []);
      const newId = CMS.nextItemId(ids);
      CMS.setItemList(screenDef.listKey, [...ids, newId])
        .then(() => {
          setStatus(CMS.isUsingRemote() ? 'Screen added to cloud' : 'Screen added', true);
          paintScreens();
        })
        .catch(() => setStatus('Add screen failed'));
    });

    toolbar.appendChild(label);
    toolbar.appendChild(addBtn);
    wrap.appendChild(toolbar);

    const list = document.createElement('div');
    list.className = 'admin-nested-screen-list';
    wrap.appendChild(list);

    function paintScreens() {
      const c = getContent();
      list.innerHTML = '';
      const screenIds = CMS.getItemList(screenDef.listKey, screenDef.defaultIds || []);
      if (!screenIds.length) {
        const empty = document.createElement('p');
        empty.className = 'admin-empty-inline';
        empty.textContent = 'No screens yet. Tap Add screen.';
        list.appendChild(empty);
        return;
      }

      screenIds.forEach((screenId, index) => {
        const panel = document.createElement('div');
        panel.className = 'admin-nested-screen-item';

        const panelHead = document.createElement('div');
        panelHead.className = 'admin-nested-screen-head';
        panelHead.textContent = `Screen ${String(index + 1).padStart(2, '0')}`;

        const panelActions = document.createElement('div');
        panelActions.className = 'admin-card-actions';

        if (index > 0) {
          const upBtn = document.createElement('button');
          upBtn.type = 'button';
          upBtn.className = 'admin-btn admin-btn-ghost admin-btn-reorder';
          upBtn.textContent = '↑';
          upBtn.addEventListener('click', () => {
            CMS.reorderItemList(screenDef.listKey, screenId, -1, screenDef.defaultIds || [])
              .then(() => paintScreens());
          });
          panelActions.appendChild(upBtn);
        }

        if (index < screenIds.length - 1) {
          const downBtn = document.createElement('button');
          downBtn.type = 'button';
          downBtn.className = 'admin-btn admin-btn-ghost admin-btn-reorder';
          downBtn.textContent = '↓';
          downBtn.addEventListener('click', () => {
            CMS.reorderItemList(screenDef.listKey, screenId, 1, screenDef.defaultIds || [])
              .then(() => paintScreens());
          });
          panelActions.appendChild(downBtn);
        }

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'admin-btn admin-btn-danger';
        delBtn.textContent = 'Remove';
        delBtn.addEventListener('click', () => {
          if (!window.confirm(`Remove screen ${String(index + 1).padStart(2, '0')}?`)) return;
          const nextIds = screenIds.filter(id => id !== screenId);
          const fieldIds = screenDef.makeFields(screenId).map(f => f.id);
          Promise.all([
            CMS.setItemList(screenDef.listKey, nextIds),
            CMS.deleteCardFields(fieldIds)
          ])
            .then(() => {
              setStatus('Screen removed', true);
              paintScreens();
            })
            .catch(() => setStatus('Remove failed'));
        });
        panelActions.appendChild(delBtn);

        panelHead.appendChild(panelActions);
        panel.appendChild(panelHead);

        screenDef.makeFields(screenId).forEach(field => {
          panel.appendChild(renderField(field, c[field.id], newVal => {
            saveField(field.id, newVal);
            c[field.id] = newVal;
          }));
        });

        list.appendChild(panel);
      });
    }

    paintScreens();
    return wrap;
  }

  function appendSectionLabel(container, text) {
    const label = document.createElement('div');
    label.className = 'admin-card-section-label';
    label.textContent = text;
    container.appendChild(label);
  }

  function createEditCard(cardDef, content, options) {
    const opts = options || {};
    const card = document.createElement('div');
    card.className = 'admin-edit-card';
    if (cardDef.nested) card.classList.add('admin-edit-card--case-study');
    card.dataset.cardId = cardDef.id;

    const previewVal = cardDef.previewImage && window.LocalImages
      ? window.LocalImages.resolve(cardDef.previewImage)
      : '';
    const titleField = cardDef.fields.find(f => f.id.includes('.name') || f.id.includes('.title'));
    const nameVal = titleField ? (content[titleField.id] || cardDef.title) : cardDef.title;

    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'admin-edit-card-head';

    const thumb = document.createElement('div');
    thumb.className = 'admin-edit-card-thumb';
    if (cardDef.previewImage) {
      const img = document.createElement('img');
      img.src = previewVal || '';
      img.alt = '';
      thumb.appendChild(img);
    } else {
      thumb.classList.add('is-empty');
    }

    const meta = document.createElement('div');
    meta.className = 'admin-edit-card-meta';
    const titleEl = document.createElement('div');
    titleEl.className = 'admin-edit-card-title';
    titleEl.textContent = nameVal || cardDef.title;
    const sub = document.createElement('div');
    sub.className = 'admin-edit-card-sub';
    sub.textContent = cardDef.nested
      ? 'Homepage card + full case study page (problem, outcome, screens…)'
      : 'Tap to expand and edit fields';
    meta.appendChild(titleEl);
    meta.appendChild(sub);

    const chevron = document.createElement('span');
    chevron.className = 'admin-edit-card-chevron';
    chevron.textContent = '→';

    head.appendChild(thumb);
    head.appendChild(meta);
    head.appendChild(chevron);

    const body = document.createElement('div');
    body.className = 'admin-edit-card-body';

    function refreshCardHeader() {
      const c = getContent();
      if (titleField) titleEl.textContent = c[titleField.id] || cardDef.title;
      if (cardDef.previewImage && window.LocalImages) {
        const imgEl = thumb.querySelector('img');
        if (imgEl) imgEl.src = window.LocalImages.resolve(cardDef.previewImage);
      }
    }

    function appendFields(fields, container) {
      fields.forEach(field => {
        container.appendChild(renderField(field, content[field.id], newVal => {
          saveField(field.id, newVal);
          content[field.id] = newVal;
          refreshCardHeader();
          if (field.id.endsWith('.studyFolder') && opts.onRefresh) {
            opts.onRefresh();
          }
        }));
      });
    }

    if (cardDef.nested) {
      const homeSection = document.createElement('div');
      homeSection.className = 'admin-card-section';
      appendSectionLabel(homeSection, 'Homepage & projects list');
      appendFields(cardDef.fields, homeSection);
      body.appendChild(homeSection);

      const nested = document.createElement('div');
      nested.className = 'admin-nested-block admin-nested-block--page';
      const nestedLabel = document.createElement('div');
      nestedLabel.className = 'admin-nested-label';
      nestedLabel.textContent = cardDef.nested.label;
      nested.appendChild(nestedLabel);
      if (cardDef.nested.hint) {
        const nestedHint = document.createElement('p');
        nestedHint.className = 'admin-nested-hint';
        nestedHint.textContent = cardDef.nested.hint;
        nested.appendChild(nestedHint);
      }
      appendFields(cardDef.nested.fields, nested);

      if (cardDef.nested.screens) {
        nested.appendChild(renderNestedScreensBlock(cardDef.nested.screens, content));
      }

      body.appendChild(nested);
    } else {
      appendFields(cardDef.fields, body);
    }

    if (cardDef.dynamic && opts.onReorder) {
      const reorderRow = document.createElement('div');
      reorderRow.className = 'admin-card-reorder';
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'admin-btn admin-btn-ghost admin-btn-reorder';
      upBtn.textContent = '↑ Move up';
      upBtn.addEventListener('click', e => {
        e.stopPropagation();
        opts.onReorder(cardDef.itemId, -1);
      });
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'admin-btn admin-btn-ghost admin-btn-reorder';
      downBtn.textContent = '↓ Move down';
      downBtn.addEventListener('click', e => {
        e.stopPropagation();
        opts.onReorder(cardDef.itemId, 1);
      });
      reorderRow.appendChild(upBtn);
      reorderRow.appendChild(downBtn);
      body.insertBefore(reorderRow, body.firstChild);
    }

    if (cardDef.deletable && opts.onDelete) {
      const actions = document.createElement('div');
      actions.className = 'admin-card-actions';
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'admin-btn admin-btn-danger';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        const label = titleEl.textContent || cardDef.title;
        if (window.confirm(`Delete "${label}"? This cannot be undone.`)) {
          opts.onDelete(cardDef);
        }
      });
      actions.appendChild(delBtn);
      body.appendChild(actions);
    }

    head.addEventListener('click', () => {
      if (cardDef.nested) {
        card.classList.toggle('is-open');
        return;
      }
      const wasOpen = card.classList.contains('is-open');
      card.closest('.admin-card-grid').querySelectorAll('.admin-edit-card').forEach(c => {
        c.classList.remove('is-open');
      });
      if (!wasOpen) card.classList.add('is-open');
    });

    if (cardDef.nested) {
      card.classList.add('is-open');
    }

    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  function lifeSectionToGroup(section) {
    return {
      label: section.label,
      cards: section.items.map(item => ({
        id: item.id,
        title: item.title,
        previewImage: item.fields.find(f => f.type === 'localImage' || f.type === 'image')?.id,
        fields: item.fields
      }))
    };
  }

  function renderGroup(group, content, options) {
    const opts = options || {};
    if (group.dynamic) {
      return renderDynamicGroup(group, content, opts);
    }

    const section = document.createElement('section');
    section.className = 'admin-group';

    if (!opts.hideLabel) {
      const label = document.createElement('h2');
      label.className = 'admin-group-label';
      label.textContent = group.label;
      section.appendChild(label);
    }

    const grid = document.createElement('div');
    grid.className = 'admin-card-grid';
    group.cards.forEach(cardDef => {
      grid.appendChild(createEditCard(cardDef, content));
    });
    section.appendChild(grid);
    return section;
  }

  function renderDynamicGroup(group, content, options) {
    const opts = options || {};
    const section = document.createElement('section');
    section.className = 'admin-group';

    const toolbar = document.createElement('div');
    toolbar.className = 'admin-group-toolbar';

    const hint = document.createElement('p');
    hint.className = 'admin-group-hint';
    hint.textContent = `${getDynamicCards(group.dynamic, content).length} item${getDynamicCards(group.dynamic, content).length === 1 ? '' : 's'}`;

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'admin-btn admin-btn-primary admin-btn-add';
    addBtn.textContent = '+ Add';
    addBtn.addEventListener('click', () => {
      addDynamicItem(group.dynamic, () => {
        if (opts.onRefresh) opts.onRefresh();
      });
    });

    toolbar.appendChild(hint);
    toolbar.appendChild(addBtn);
    section.appendChild(toolbar);

    const grid = document.createElement('div');
    grid.className = 'admin-card-grid';

    function fillGrid() {
      grid.innerHTML = '';
      const cards = getDynamicCards(group.dynamic, getContent());
      if (!cards.length) {
        const empty = document.createElement('p');
        empty.className = 'admin-empty admin-empty-inline';
        empty.textContent = 'No items yet. Tap Add to create one.';
        grid.appendChild(empty);
        return;
      }

      cards.forEach(cardDef => {
        grid.appendChild(createEditCard(cardDef, content, {
          onDelete: () => {
            deleteDynamicItem(group.dynamic, cardDef.itemId, () => {
              if (opts.onRefresh) opts.onRefresh();
            });
          },
          onReorder: (itemId, direction) => {
            reorderDynamicItem(group.dynamic, itemId, direction, () => {
              if (opts.onRefresh) opts.onRefresh();
            });
          }
        }));
      });
    }

    fillGrid();
    section.appendChild(grid);
    section._refreshDynamic = fillGrid;
    return section;
  }

  function renderCategoriesManager() {
    const section = document.createElement('section');
    section.className = 'admin-group';

    const intro = document.createElement('p');
    intro.className = 'admin-group-hint';
    intro.textContent = 'These categories appear when tagging design and case study projects. Add or remove as needed.';
    section.appendChild(intro);

    const list = document.createElement('div');
    list.className = 'admin-cat-manage-list';

    const addRow = document.createElement('div');
    addRow.className = 'admin-cat-add-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'admin-input';
    input.placeholder = 'New category name';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'admin-btn admin-btn-primary';
    addBtn.textContent = 'Add category';
    addRow.appendChild(input);
    addRow.appendChild(addBtn);
    section.appendChild(addRow);

    function paint() {
      list.innerHTML = '';
      getCategories().forEach(cat => {
        const row = document.createElement('div');
        row.className = 'admin-cat-manage-item';

        const name = document.createElement('span');
        name.className = 'admin-cat-manage-name';
        name.textContent = cat;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'admin-btn admin-btn-ghost admin-btn-remove';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          const next = getCategories().filter(c => c !== cat);
          CMS.setCategories(next);
          schema.categories = next.slice();
          setStatus('Category removed', true);
          paint();
        });

        row.appendChild(name);
        row.appendChild(removeBtn);
        list.appendChild(row);
      });
    }

    addBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value) return;
      const current = getCategories();
      if (current.includes(value)) {
        setStatus('Category already exists');
        return;
      }
      CMS.setCategories([...current, value]);
      schema.categories = CMS.getCategories();
      input.value = '';
      setStatus('Category added', true);
      paint();
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addBtn.click();
      }
    });

    paint();
    section.appendChild(list);
    return section;
  }

  function renderLifeSection(section, content, refreshFn) {
    if (section.dynamic) {
      return renderDynamicGroup({ label: section.label, dynamic: section.dynamic }, content, {
        hideLabel: true,
        onRefresh: refreshFn
      });
    }

    return renderGroup(lifeSectionToGroup(section), content, { hideLabel: true });
  }

  function renderHomeGroup(group, content, refreshFn) {
    if (group.manageCategories) {
      return renderCategoriesManager();
    }
    if (group.dynamic) {
      return renderDynamicGroup(group, content, { hideLabel: true, onRefresh: refreshFn });
    }
    return renderGroup(group, content, { hideLabel: true });
  }

  function renderSidebar(panelId, subsectionId) {
    if (!sidebarNavEl) return;

    const subsections = getSubsections(panelId);
    const panelLabel = getPanelLabel(panelId);

    if (sidebarHeadingEl) sidebarHeadingEl.textContent = panelLabel;
    sidebarNavEl.innerHTML = '';

    subsections.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'admin-sidebar-link';
      btn.textContent = item.label;
      btn.dataset.subsection = item.id;
      if (item.id === subsectionId) btn.classList.add('active');
      btn.addEventListener('click', () => {
        storeSubsection(panelId, item.id);
        renderSidebar(panelId, item.id);
        renderWorkspace(panelId, item.id);
        updateSidebarToggleLabel(item.label);
        closeMobileSidebar();
      });
      sidebarNavEl.appendChild(btn);
    });

    const activeMeta = getSubsectionMeta(panelId, subsectionId);
    updateSidebarToggleLabel(activeMeta ? activeMeta.label : 'Sections');
  }

  function updateSidebarToggleLabel(label) {
    if (sidebarToggleLabelEl) sidebarToggleLabelEl.textContent = label || 'Sections';
  }

  function renderWorkspace(panelId, subsectionId) {
    if (!workspaceEl || !schema) return;

    const content = getContent();
    const meta = getSubsectionMeta(panelId, subsectionId);
    workspaceEl.innerHTML = '';

    if (!meta) {
      workspaceEl.innerHTML = '<p class="admin-empty">Nothing to edit here yet.</p>';
      return;
    }

    const breadcrumb = document.createElement('p');
    breadcrumb.className = 'admin-panel-breadcrumb';
    breadcrumb.textContent = getPanelLabel(panelId);

    const title = document.createElement('h1');
    title.className = 'admin-panel-title';
    title.textContent = meta.label;

    workspaceEl.appendChild(breadcrumb);
    workspaceEl.appendChild(title);

    function refreshWorkspace() {
      renderWorkspace(panelId, subsectionId);
    }

    if (meta.group) {
      workspaceEl.appendChild(renderHomeGroup(meta.group, content, refreshWorkspace));
    } else if (meta.section) {
      workspaceEl.appendChild(renderLifeSection(meta.section, content, refreshWorkspace));
    }
  }

  function renderPanel(panelId) {
    if (!workspaceEl || !schema) return;

    activePanel = panelId;
    setSidebarOpen(false);

    navEl.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === panelId);
    });

    const panel = schema.panels[panelId];
    if (!panel) {
      if (sidebarNavEl) sidebarNavEl.innerHTML = '';
      workspaceEl.innerHTML = '<p class="admin-empty">Nothing to edit here yet.</p>';
      return;
    }

    const subsectionId = resolveSubsectionId(panelId);
    storeSubsection(panelId, subsectionId);
    renderSidebar(panelId, subsectionId);
    renderWorkspace(panelId, subsectionId);
  }

  function buildNav() {
    if (!navEl || !schema) return;
    navEl.innerHTML = '';
    schema.nav.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'admin-nav-btn';
      btn.textContent = item.label;
      btn.dataset.panel = item.id;
      if (item.id === activePanel) btn.classList.add('active');
      btn.addEventListener('click', () => renderPanel(item.id));
      navEl.appendChild(btn);
    });
  }

  function bindSidebarControls() {
    if (sidebarToggleEl) {
      sidebarToggleEl.addEventListener('click', () => {
        setSidebarOpen(!shellEl.classList.contains('sidebar-open'));
      });
    }

    if (sidebarBackdropEl) {
      sidebarBackdropEl.addEventListener('click', () => setSidebarOpen(false));
    }

    window.addEventListener('resize', () => {
      if (!isMobileSidebar()) setSidebarOpen(false);
    });
  }

  function boot() {
    workspaceEl = document.getElementById('admin-workspace');
    navEl = document.getElementById('admin-nav');
    statusEl = document.getElementById('admin-status');
    logoutBtn = document.getElementById('admin-logout');
    shellEl = document.getElementById('admin-shell');
    sidebarEl = document.getElementById('admin-sidebar');
    sidebarNavEl = document.getElementById('admin-sidebar-nav');
    sidebarHeadingEl = document.getElementById('admin-sidebar-heading');
    sidebarToggleEl = document.getElementById('admin-sidebar-toggle');
    sidebarToggleLabelEl = document.getElementById('admin-sidebar-toggle-label');
    sidebarBackdropEl = document.getElementById('admin-sidebar-backdrop');
    schema = window.CMS_SCHEMA;
    if (window.CMS && CMS.getCategories) {
      schema.categories = CMS.getCategories();
    }

    bindSidebarControls();

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (window.CMS) CMS.setAdminSession(false);
        try { sessionStorage.removeItem('xbb-admin-session'); } catch (e) {}
        dashboardReady = false;
        document.getElementById('admin-login').removeAttribute('hidden');
        document.getElementById('admin-login').classList.remove('is-hidden');
        document.getElementById('admin-app').setAttribute('hidden', '');
        document.getElementById('admin-app').classList.add('is-hidden');
        const input = document.getElementById('admin-login-input');
        if (input) input.value = '';
      });
    }
  }

  window.initAdminDashboard = function () {
    if (dashboardReady) return;
    dashboardReady = true;

    if (!window.CMS || !schema) {
      if (workspaceEl) workspaceEl.innerHTML = '<p class="admin-empty">Editor could not load. Refresh the page.</p>';
      return;
    }

    return CMS.ready.then(() => {
      buildNav();
      if (window.CMS && CMS.getCategories) {
        schema.categories = CMS.getCategories();
      }
      if (CMS.isUsingRemote() && statusEl) {
        statusEl.textContent = 'Cloud connected';
        statusEl.classList.add('is-saved');
      } else if (window.SupabaseCMS && SupabaseCMS.isConfigured && SupabaseCMS.isConfigured() && statusEl) {
        statusEl.textContent = 'Cloud error — check .env / Vercel env vars';
      }
      renderPanel('projects');
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
