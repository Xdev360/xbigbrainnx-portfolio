(() => {
  'use strict';

  /* ---------------------------------------------------------
   * Mirror the hero card view into the mobile Projects section.
   *
   * `#hero-cards` is the authoritative copy of the Design / Case
   * Study cards. On mobile we want the same content rendered inside
   * the Projects section (the hero-right is hidden there). Instead
   * of duplicating the HTML, we clone `#hero-cards`'s children into
   * `#projects-mobile` once CMS content is applied.
   * ------------------------------------------------------- */
  function mirrorHeroIntoMobile() {
    const source = document.getElementById('hero-cards');
    const target = document.getElementById('projects-mobile');
    if (!source || !target) return;

    target.replaceChildren();
    Array.from(source.children).forEach(child => {
      target.appendChild(child.cloneNode(true));
    });
  }

  const carouselRenderers = [];

  function initCardCarousels() {
    document.querySelectorAll('.card-stage').forEach(stage => {
      if (stage.dataset.carouselReady === 'true') return;
      stage.dataset.carouselReady = 'true';

      const parent = stage.parentElement;
      if (!parent) return;

      const tabsContainer = parent.querySelector('.tabs');
      const controls = parent.querySelector('.carousel-controls');
      const dotsContainer = controls ? controls.querySelector('.carousel-dots') : null;
      const arrows = controls ? Array.from(controls.querySelectorAll('.carousel-btn')) : [];
      const tabs = tabsContainer ? Array.from(tabsContainer.querySelectorAll('.tab')) : [];
      const views = Array.from(stage.querySelectorAll('.card-view'));
      if (!views.length) return;

      const state = { active: views[0].dataset.view, indices: {} };
      views.forEach(v => { state.indices[v.dataset.view] = 0; });

      function deckCards(view) {
        const deck = view.querySelector('.card-deck');
        return deck ? Array.from(deck.children) : [];
      }

      function activeView() {
        return views.find(v => v.dataset.view === state.active) || views[0];
      }

      function render() {
        tabs.forEach(t => {
          t.classList.toggle('active', t.dataset.target === state.active);
        });
        views.forEach(v => {
          v.classList.toggle('active', v.dataset.view === state.active);
        });

        const view = activeView();
        const cards = deckCards(view);
        if (!cards.length) return;

        const count = cards.length;
        let idx = state.indices[state.active] || 0;
        idx = ((idx % count) + count) % count;
        state.indices[state.active] = idx;

        cards.forEach((card, i) => {
          card.dataset.active = i === idx ? 'true' : 'false';
        });

        if (dotsContainer) {
          dotsContainer.innerHTML = '';
          for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === idx ? ' active' : '');
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to item ${i + 1}`);
            dot.addEventListener('click', () => {
              state.indices[state.active] = i;
              render();
            });
            dotsContainer.appendChild(dot);
          }
        }

        arrows.forEach(btn => {
          btn.style.visibility = count > 1 ? '' : 'hidden';
          btn.disabled = count <= 1;
        });
        if (dotsContainer) {
          dotsContainer.style.visibility = count > 1 ? '' : 'hidden';
        }
      }

      tabs.forEach(t => {
        t.addEventListener('click', () => {
          state.active = t.dataset.target;
          render();
        });
      });

      arrows.forEach(btn => {
        btn.addEventListener('click', () => {
          const dir = btn.dataset.dir === 'prev' ? -1 : 1;
          state.indices[state.active] = (state.indices[state.active] || 0) + dir;
          render();
        });
      });

      carouselRenderers.push(render);
      render();
    });
  }

  function refreshCardCarousels() {
    carouselRenderers.forEach(render => render());
  }

  let projectStackRender = null;

  function initProjectStack() {
    const projectStack = document.getElementById('project-stack');
    const projectControls = document.getElementById('projects-controls');
    if (!projectStack || !projectControls) return;

    const projectCards = Array.from(projectStack.querySelectorAll('.project-card'));
    const projectDots = Array.from(projectControls.querySelectorAll('.dot'));
    const projectArrows = Array.from(projectControls.querySelectorAll('.carousel-btn'));
    const count = projectCards.length;
    if (!count) return;

    let projectActive = 0;

    function renderProjects(active) {
      projectActive = ((active % count) + count) % count;
      projectCards.forEach((card, i) => {
        const pos = (i - projectActive + count) % count;
        card.dataset.pos = String(pos);
        card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
      });
      projectDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === projectActive);
      });
    }

    if (!projectStack.dataset.stackReady) {
      projectStack.dataset.stackReady = 'true';

      projectArrows.forEach(btn => {
        btn.addEventListener('click', () => {
          const dir = btn.dataset.dir === 'prev' ? -1 : 1;
          renderProjects(projectActive + dir);
        });
      });

      projectDots.forEach((dot, i) => {
        dot.addEventListener('click', () => renderProjects(i));
      });

      projectCards.forEach((card, i) => {
        card.addEventListener('click', e => {
          if (Number(card.dataset.pos) === 0) return;
          if (e.target.closest('a, button')) return;
          renderProjects(i);
        });
      });
    }

    projectStackRender = renderProjects;
    renderProjects(0);
  }

  function initImageSlots(root) {
    (root || document).querySelectorAll('.image-slot > img').forEach(img => {
      if (img.dataset.slotReady === 'true') return;
      img.dataset.slotReady = 'true';

      const slot = img.parentElement;
      if (!slot) return;

      const markFilled = () => {
        if (img.complete && img.naturalWidth > 0) {
          slot.classList.add('filled');
        }
      };

      img.addEventListener('load', markFilled);
      img.addEventListener('error', () => slot.classList.remove('filled'));

      const observer = new MutationObserver(markFilled);
      observer.observe(img, { attributes: true, attributeFilter: ['src', 'srcset'] });

      markFilled();
    });
  }

  function initHeroProjects() {
    mirrorHeroIntoMobile();
    initCardCarousels();
    refreshCardCarousels();
    initProjectStack();
    initImageSlots();
  }

  document.addEventListener('cms:applied', initHeroProjects);
  initHeroProjects();

  /* ---------------------------------------------------------
   * Mobile navigation drawer
   *
   * On desktop the nav links sit inline. On mobile (<=768px) the
   * CSS collapses them into an absolutely-positioned card and the
   * MENU button toggles a `.open` class on the parent `<nav>`.
   *
   * This block also injects an SVG icon for each nav link based on
   * its `data-icon` attribute, so the link markup stays terse.
   * ------------------------------------------------------- */
  (function navDrawer() {
    const NAV_ICONS = {
      briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7.5" width="19" height="13" rx="2"/><path d="M8 7.5V6a2.5 2.5 0 0 1 2.5-2.5h3A2.5 2.5 0 0 1 16 6v1.5"/><path d="M2.5 13.5h19"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.6" fill="currentColor"/></svg>',
      layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
      pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
      mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>',
      box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c.41 2.34.74 4.78.43 7.27-.41 3.32-2.1 6.13-4.93 6.81-1.65.39-3.95.39-3.7 2.96z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>'
    };

    document.querySelectorAll('.nav-links a[data-icon]').forEach(a => {
      const name = a.dataset.icon;
      const svg = NAV_ICONS[name];
      if (!svg || a.querySelector('.nav-icon')) return;
      const icon = document.createElement('span');
      icon.className = 'nav-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = svg;
      a.prepend(icon);
    });

    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav-toggle');
    if (!nav || !toggle) return;

    const setOpen = open => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      setOpen(!nav.classList.contains('open'));
    });

    nav.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', e => {
      if (!nav.classList.contains('open')) return;
      if (e.target.closest('.nav')) return;
      setOpen(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    /* If the viewport widens past the mobile breakpoint while the
     * drawer is open, drop the open state so the desktop layout
     * isn't constrained by the absolute positioning. */
    const mql = window.matchMedia('(min-width: 769px)');
    const onDesktop = e => { if (e.matches) setOpen(false); };
    if (mql.addEventListener) mql.addEventListener('change', onDesktop);
    else mql.addListener(onDesktop);
  })();

  /* ---------------------------------------------------------
   * Life page — tab filters + section password lock
   *
   * Admin: set `data-life-lock-enabled="false"` on `.life` to
   * open all sections publicly. When `"true"`, sections marked
   * `data-life-locked="true"` require the password once per session.
   * No lock icons or labels appear on tabs — only the password
   * gate when a private section is opened without access.
   * ------------------------------------------------------- */
  (function lifePage() {
    const root = document.querySelector('.life');
    if (!root) return;

    const lockEnabled = root.dataset.lifeLockEnabled === 'true';
    const tabs = root.querySelectorAll('.life-tab');
    const links = root.querySelectorAll('.life-all-link');
    const gate = document.getElementById('life-lock-gate');
    const form = document.getElementById('life-lock-form');
    const input = document.getElementById('life-lock-input');
    const error = document.getElementById('life-lock-error');
    const backBtn = document.getElementById('life-lock-back');
    const UNLOCK_KEY = 'life-unlocked';

    function checkLifePassword(value) {
      if (window.CMS && typeof CMS.verifyLifePassword === 'function') {
        return CMS.verifyLifePassword(value);
      }
      return String(value).trim() === '244340';
    }

    if (!lockEnabled && gate) {
      gate.hidden = true;
      gate.setAttribute('aria-hidden', 'true');
    }

    function isUnlocked() {
      return !lockEnabled || sessionStorage.getItem(UNLOCK_KEY) === 'true';
    }

    function isLocked(filter) {
      if (!lockEnabled || filter === 'all') return false;
      const section = root.querySelector(`.life-section[data-category="${filter}"]`);
      return section?.dataset.lifeLocked === 'true';
    }

    function updateLockUI(filter) {
      const showLock = isLocked(filter) && !isUnlocked();
      root.classList.toggle('life-show-lock', showLock);
      root.classList.toggle('life-unlocked', isUnlocked());
      if (gate) {
        gate.hidden = !showLock;
        gate.setAttribute('aria-hidden', showLock ? 'false' : 'true');
      }
      if (showLock && input) {
        input.value = '';
        if (error) error.hidden = true;
        setTimeout(() => input.focus(), 50);
      }
    }

    function setFilter(filter) {
      root.setAttribute('data-active-filter', filter);
      tabs.forEach(t => {
        t.classList.toggle('active', (t.dataset.lifeFilter || 'all') === filter);
      });
      updateLockUI(filter);
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setFilter(tab.dataset.lifeFilter || 'all');
      });
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        setFilter(link.dataset.lifeFilter || 'all');
      });
    });

    if (form && input) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (checkLifePassword(input.value)) {
          sessionStorage.setItem(UNLOCK_KEY, 'true');
          if (error) error.hidden = true;
          updateLockUI(root.getAttribute('data-active-filter') || 'all');
        } else if (error) {
          error.hidden = false;
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => setFilter('all'));
    }

    updateLockUI(root.getAttribute('data-active-filter') || 'all');
  })();

  /* ---------------------------------------------------------
   * Blog voice note player — admin uploads audio via
   * `data-admin-audio` on the hidden <audio> element.
   * ------------------------------------------------------- */
  document.querySelectorAll('.life-voice-note').forEach(note => {
    const audio = note.querySelector('.life-voice-audio');
    const playBtn = note.querySelector('.life-voice-play');
    const playLabel = note.querySelector('.life-voice-play-label');
    const track = note.querySelector('.life-voice-track');
    const progress = note.querySelector('.life-voice-progress');
    const currentEl = note.querySelector('.life-voice-time-current');
    const totalEl = note.querySelector('.life-voice-time-total');
    if (!audio || !playBtn) return;

    function setPlaying(playing) {
      playBtn.classList.toggle('is-playing', playing);
      if (playLabel) playLabel.textContent = playing ? 'Pause' : 'Play';
      playBtn.setAttribute('aria-label', playing ? 'Pause voice note' : 'Play voice note');
    }

    function fmt(sec) {
      if (!Number.isFinite(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    function syncProgress() {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (progress) progress.style.width = `${pct}%`;
      if (currentEl) currentEl.textContent = fmt(audio.currentTime);
    }

    audio.addEventListener('loadedmetadata', () => {
      if (totalEl) totalEl.textContent = fmt(audio.duration);
    });

    audio.addEventListener('timeupdate', syncProgress);
    audio.addEventListener('ended', () => setPlaying(false));

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    });

    if (track) {
      track.addEventListener('click', e => {
        if (!audio.duration) return;
        const rect = track.getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        audio.currentTime = ratio * audio.duration;
        syncProgress();
      });
    }
  });

  /* ---------------------------------------------------------
   * Live clock in the nav (local time, updates every minute)
   * ------------------------------------------------------- */
  const clockEl = document.getElementById('clock');
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clockEl.textContent = `${hours}:${minutes} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 60 * 1000);

  /* ---------------------------------------------------------
   * Footer year — keep "2022 — <current year>" current.
   * ------------------------------------------------------- */
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------
   * Scroll-spy: highlight the current section in the nav.
   * ------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionIds = Array.from(navLinks)
    .map(a => a.getAttribute('href'))
    .filter(href => href && href.length > 1)
    .map(href => href.slice(1));
  const sectionEls = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sectionEls.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sectionEls.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
   * Keyboard arrows for the currently visible card view carousel.
   * Skipped while focus is inside an input / contenteditable.
   * ------------------------------------------------------- */
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, [contenteditable]')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const stage = Array.from(document.querySelectorAll('.card-stage'))
      .find(s => s.offsetParent !== null);
    if (!stage) return;
    const controls = stage.parentElement && stage.parentElement.querySelector('.carousel-controls');
    if (!controls) return;
    const btn = controls.querySelector(
      e.key === 'ArrowLeft' ? '[data-dir="prev"]' : '[data-dir="next"]'
    );
    if (btn) btn.click();
  });
})();
