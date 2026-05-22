/**
 * CMS schema — card-based admin structure.
 * Fields map to data-admin-image / data-cms-id / data-cms-categories in HTML.
 * Sections with `dynamic` support add/delete in admin.
 */
(function () {
  'use strict';

  const CATEGORIES = [
    'AI', 'Fintech', 'Web3', 'Gaming', 'SaaS',
    'Retail', 'Brand', 'Agency', 'Editorial', 'Creator Tools'
  ];

  const img = (id, label, size) => ({ id, type: 'image', label, size });
  const text = (id, label, placeholder) => ({ id, type: 'text', label, placeholder });
  const textarea = (id, label) => ({ id, type: 'textarea', label });
  const cats = (id, label) => ({ id, type: 'categories', label, max: 2 });
  const audio = (id, label) => ({ id, type: 'audio', label, size: 'MP3 · under 15 MB' });
  const toggle = (id, label) => ({ id, type: 'toggle', label });
  const date = (id, label) => ({ id, type: 'date', label });
  const pass = (id, label) => ({ id, type: 'password', label });
  const color = (id, label) => ({ id, type: 'color', label });

  const CASE_REGISTRY = {
    '01': { name: 'Zalary', study: 'cases/zalary', theme: '#2D6A4F' },
    '02': { name: 'CrediGo', study: 'cases/credigo', theme: '#3859E6' },
    '03': { name: 'Lumèa Essence', study: 'cases/lumea-essence', theme: '#B8860B' },
    '04': { name: 'Wintech Studio', study: 'cases/wintech', theme: '#E63946' },
    '05': { name: 'Untitled AI', study: 'cases/untitled-ai', theme: '#7C3AED' }
  };

  const DESIGN_REGISTRY = {
    '01': { name: 'Lumèa Essence', image: 'design/lumea-essence.jpg' },
    '02': { name: 'The Brain Room', image: 'design/brain-room.jpg' },
    '03': { name: 'Wintech Studio', image: 'design/wintech.jpg' }
  };

  const studyBaseFields = (cardSlug, studyFolder) => [
    img(`${studyFolder}/hero.png`, 'Case study hero banner', '1920 × 900 px'),
    text(`projects.case.${cardSlug}.study.title`, 'Project title'),
    textarea(`projects.case.${cardSlug}.study.tagline`, 'Tagline'),
    textarea(`projects.case.${cardSlug}.study.body`, 'Intro body'),
    textarea(`projects.case.${cardSlug}.study.problem`, 'Problem'),
    textarea(`projects.case.${cardSlug}.study.outcome`, 'Outcome'),
    textarea(`projects.case.${cardSlug}.study.research`, 'Research'),
    img(`${studyFolder}/design-system.png`, 'Design system image', '1920 × 1080 px'),
    textarea(`projects.case.${cardSlug}.study.reflection`, 'Reflection')
  ];

  function makeScreenFields(cardSlug, studyFolder, screenId) {
    return [
      img(`${studyFolder}/screen-${screenId}.png`, 'Screen image', '1440 × 900 px'),
      text(`projects.case.${cardSlug}.study.screen.${screenId}.title`, 'Screen title'),
      textarea(`projects.case.${cardSlug}.study.screen.${screenId}.desc`, 'Screen description')
    ];
  }

  function heroCaseCardCover(itemId) {
    return `hero-cards/case-${itemId}.jpg`;
  }

  function heroDesignCardCover(itemId) {
    return `hero-cards/design-${itemId}.jpg`;
  }

  function caseMeta(itemId) {
    return CASE_REGISTRY[itemId] || {
      name: `Case study ${itemId}`,
      study: `cases/study-${itemId}`,
      theme: '#3859E6'
    };
  }

  function designLabelDefault(itemId) {
    const labels = {
      '01': 'BRAND DESIGN',
      '02': 'EDITORIAL DESIGN',
      '03': 'AGENCY IDENTITY'
    };
    return labels[itemId] || 'DESIGN';
  }

  function designMeta(itemId) {
    return DESIGN_REGISTRY[itemId] || {
      name: `Design project ${itemId}`,
      image: `design/project-${itemId}.jpg`
    };
  }

  function makeDesignCard(itemId) {
    const meta = designMeta(itemId);
    return {
      id: `design-${itemId}`,
      title: meta.name,
      previewImage: meta.image,
      fieldPrefix: `projects.design.${itemId}.`,
      fields: [
        img(meta.image, 'Cover image', '1200 × 900 px (4:3)'),
        text(`projects.design.${itemId}.label`, 'Card tag (top label)', designLabelDefault(itemId)),
        text(`projects.design.${itemId}.name`, 'Project name'),
        textarea(`projects.design.${itemId}.about`, 'About'),
        cats(`projects.design.${itemId}.categories`, 'Categories (pick up to 2)')
      ]
    };
  }

  function makeCaseCard(itemId) {
    const meta = caseMeta(itemId);
    const projectCover = CASE_REGISTRY[itemId]
      ? `case-studies/${meta.study.replace('cases/', '')}.jpg`
      : `case-studies/study-${itemId}.jpg`;
    const heroCover = heroCaseCardCover(itemId);

    return {
      id: `case-${itemId}`,
      title: meta.name,
      previewImage: heroCover,
      fieldPrefix: `projects.case.${itemId}.`,
      fields: [
        img(heroCover, 'Hero carousel cover', '1200 × 900 px — homepage hero tab'),
        img(projectCover, 'Projects section cover', '1200 × 900 px — projects stack'),
        text(`projects.case.${itemId}.name`, 'Project name'),
        textarea(`projects.case.${itemId}.about`, 'About'),
        cats(`projects.case.${itemId}.categories`, 'Categories (pick up to 2)'),
        text(`projects.case.${itemId}.link`, 'Case study link', `case-study.html?case=${itemId}`),
        color(`projects.case.${itemId}.theme`, 'Theme color (applies to case study page)')
      ],
      nested: {
        label: 'Case study page',
        fields: studyBaseFields(itemId, meta.study),
        screens: {
          listKey: `__list.projects.case.${itemId}.screens`,
          defaultIds: ['01', '02', '03', '04', '05', '06'],
          label: 'Key screens',
          makeFields: screenId => makeScreenFields(itemId, meta.study, screenId)
        }
      }
    };
  }

  function wallpaperFields(itemId) {
    const imgKey = `products/wallpapers/bundle-${itemId}.jpg`;
    return {
      id: `wallpaper-${itemId}`,
      title: `Wallpaper bundle ${itemId}`,
      previewImage: imgKey,
      fieldPrefix: `products.wallpapers.bundle-${itemId}.`,
      fields: [
        img(imgKey, 'Cover', '1200 × 750 px'),
        text(`products.wallpapers.bundle-${itemId}.name`, 'Name'),
        text(`products.wallpapers.bundle-${itemId}.detail`, 'Detail line'),
        text(`products/wallpapers/bundle-${itemId}-url`, 'Shop link')
      ]
    };
  }

  function comicFields(itemId) {
    return {
      id: `comic-${itemId}`,
      title: `Comic ${itemId}`,
      previewImage: `products/comics/${itemId}.jpg`,
      fieldPrefix: `products.comics.${itemId}.`,
      fields: [
        img(`products/comics/${itemId}.jpg`, 'Cover', '600 × 900 px'),
        text(`products.comics.${itemId}.title`, 'Title'),
        textarea(`products.comics.${itemId}.about`, 'About'),
        text(`products/comics/${itemId}-url`, 'Link')
      ]
    };
  }

  function clothingFields(itemId) {
    const tee = itemId === '01' ? 'products/clothing/01.jpg' : `products/clothing/${itemId}-tee.jpg`;
    const hoodie = itemId === '01' ? 'products/clothing/02.jpg' : `products/clothing/${itemId}-hoodie.jpg`;
    const cap = itemId === '01' ? 'products/clothing/03.jpg' : `products/clothing/${itemId}-cap.jpg`;
    const brandKey = itemId === '01' ? 'products.clothing.brandName' : `products.clothing.${itemId}.brandName`;
    const aboutKey = itemId === '01' ? 'products.clothing.about' : `products.clothing.${itemId}.about`;
    const storeKey = itemId === '01' ? 'products/clothing/store-url' : `products/clothing.${itemId}.store-url`;

    return {
      id: `clothing-${itemId}`,
      title: `Clothing brand ${itemId}`,
      previewImage: tee,
      fieldPrefix: `products.clothing.${itemId}.`,
      fields: [
        img(tee, 'Tee preview', '800 × 1000 px'),
        img(hoodie, 'Hoodie preview', '800 × 1000 px'),
        img(cap, 'Cap preview', '800 × 1000 px'),
        text(brandKey, 'Brand name'),
        textarea(aboutKey, 'About'),
        text(storeKey, 'Store link')
      ]
    };
  }

  function artSaleFields(itemId) {
    return {
      id: `product-art-${itemId}`,
      title: `Art for sale ${itemId}`,
      previewImage: `products/art/${itemId}.jpg`,
      fieldPrefix: `products.art.${itemId}.`,
      fields: [
        img(`products/art/${itemId}.jpg`, 'Photo', '800 × 1000 px'),
        text(`products.art.${itemId}.name`, 'Name'),
        text(`products.art.${itemId}.price`, 'Price'),
        text(`products/art/${itemId}-url`, 'Enquire link')
      ]
    };
  }

  function ebookFields(itemId) {
    return {
      id: `ebook-${itemId}`,
      title: `E-book ${itemId}`,
      previewImage: `products/ebooks/${itemId}.jpg`,
      fieldPrefix: `products.ebooks.${itemId}.`,
      fields: [
        img(`products/ebooks/${itemId}.jpg`, 'Cover', '600 × 800 px'),
        text(`products.ebooks.${itemId}.name`, 'Title'),
        text(`products.ebooks.${itemId}.price`, 'Price'),
        textarea(`products.ebooks.${itemId}.tagline`, 'Tagline'),
        text(`products/ebooks/${itemId}-url`, 'Buy link')
      ]
    };
  }

  const lifeSections = [
    {
      id: 'hero', label: 'Hero', items: [{
        id: 'life-hero', title: 'Life cover',
        fields: [
          img('life/cover.jpg', 'Cover image', '1200 × 800 px (5:4)'),
          textarea('life.hero.sub', 'Hero subtitle')
        ]
      }]
    },
    {
      id: 'food', label: 'Food',
      dynamic: {
        listKey: '__list.life.food',
        defaultIds: ['01', '02', '03', '04', '05', '06'],
        makeCard(itemId) {
          return {
            id: `food-${itemId}`,
            title: `Dish ${itemId}`,
            previewImage: `life/food/${itemId}.jpg`,
            fieldPrefix: `life.food.${itemId}.`,
            fields: [
              img(`life/food/${itemId}.jpg`, 'Photo', '800 × 1000 px (4:5)'),
              text(`life.food.${itemId}.name`, 'Name')
            ]
          };
        }
      }
    },
    {
      id: 'gym', label: 'Gym',
      dynamic: {
        listKey: '__list.life.gym',
        defaultIds: ['01', '02', '03', '04', '05', '06'],
        makeCard(itemId) {
          return {
            id: `gym-${itemId}`,
            title: `Gym photo ${itemId}`,
            previewImage: `life/gym/${itemId}.jpg`,
            fieldPrefix: `life.gym.${itemId}.`,
            fields: [img(`life/gym/${itemId}.jpg`, 'Photo', '1080 × 1080 px (1:1)')]
          };
        }
      }
    },
    {
      id: 'writing', label: 'Writing (Substack)',
      dynamic: {
        listKey: '__list.life.writing',
        defaultIds: ['01', '02'],
        makeCard(itemId) {
          return {
            id: `writing-${itemId}`,
            title: `Substack ${itemId}`,
            previewImage: `life/writing/${itemId}.jpg`,
            fieldPrefix: `life.writing.${itemId}.`,
            fields: [
              img(`life/writing/${itemId}.jpg`, 'Banner', '1200 × 675 px (16:9)'),
              text(`life.writing.${itemId}.title`, 'Title'),
              textarea(`life.writing.${itemId}.about`, 'About'),
              text(`life.writing.${itemId}.url`, 'Substack link')
            ]
          };
        }
      }
    },
    {
      id: 'blog', label: 'Blog',
      dynamic: {
        listKey: '__list.life.blog',
        defaultIds: ['01'],
        makeCard(itemId) {
          const dateKey = itemId === '01' ? 'life.blog.date' : `life.blog.${itemId}.date`;
          const titleKey = itemId === '01' ? 'life.blog.title' : `life.blog.${itemId}.title`;
          const dekKey = itemId === '01' ? 'life.blog.dek' : `life.blog.${itemId}.dek`;
          const bodyKey = itemId === '01' ? 'life.blog.body' : `life.blog.${itemId}.body`;
          const audioKey = itemId === '01' ? 'life/blog/how-i-began-designing.mp3' : `life/blog/${itemId}.mp3`;
          return {
            id: `blog-${itemId}`,
            title: `Blog post ${itemId}`,
            previewImage: `life/blog/${itemId}.jpg`,
            fieldPrefix: `life.blog.${itemId}.`,
            fields: [
              img(`life/blog/${itemId}.jpg`, 'Hero image', '1680 × 720 px (21:9)'),
              date(dateKey, 'Date'),
              text(titleKey, 'Title'),
              textarea(dekKey, 'Subtitle'),
              textarea(bodyKey, 'Body (one paragraph per line)'),
              audio(audioKey, 'Voice note')
            ]
          };
        }
      }
    },
    {
      id: 'apps', label: 'Apps',
      dynamic: {
        listKey: '__list.life.apps',
        defaultIds: ['01', '02', '03'],
        makeCard(itemId) {
          return {
            id: `app-${itemId}`,
            title: `App ${itemId}`,
            previewImage: `life/apps/${itemId}.jpg`,
            fieldPrefix: `life.apps.${itemId}.`,
            fields: [
              img(`life/apps/${itemId}.jpg`, 'Icon', '512 × 512 px'),
              text(`life.apps.${itemId}.name`, 'Name'),
              text(`life.apps.${itemId}.desc`, 'Description'),
              text(`life.apps.${itemId}.url`, 'Live link')
            ]
          };
        }
      }
    },
    {
      id: 'arts', label: 'Arts',
      dynamic: {
        listKey: '__list.life.arts',
        defaultIds: ['01', '02', '03', '04', '05', '06'],
        makeCard(itemId) {
          return {
            id: `art-${itemId}`,
            title: `Artwork ${itemId}`,
            previewImage: `life/arts/${itemId}.jpg`,
            fieldPrefix: `life.arts.${itemId}.`,
            fields: [img(`life/arts/${itemId}.jpg`, 'Photo', '800 × 1000 px (4:5)')]
          };
        }
      }
    },
    {
      id: 'family-banner', label: 'Family banner',
      dynamic: {
        listKey: '__list.life.family.banner',
        defaultIds: ['main'],
        makeCard() {
          return {
            id: 'family-banner',
            title: 'Family banner',
            previewImage: 'life/family/family-banner.jpg',
            fieldPrefix: 'life.family.banner.',
            fields: [
              img('life/family/family-banner.jpg', 'Banner', '1680 × 720 px'),
              textarea('life.family.memo', 'Intro memo')
            ]
          };
        }
      }
    },
    {
      id: 'family', label: 'Family characters',
      dynamic: {
        listKey: '__list.life.family',
        defaultIds: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'],
        makeCard(itemId) {
          return {
            id: `family-${itemId}`,
            title: `Character ${itemId}`,
            previewImage: `life/family/${itemId}.jpg`,
            fieldPrefix: `life.family.${itemId}.`,
            fields: [
              img(`life/family/${itemId}.jpg`, 'Portrait', '800 × 800 px'),
              text(`life.family.${itemId}.name`, 'Name'),
              textarea(`life.family.${itemId}.about`, 'About')
            ]
          };
        }
      }
    },
    {
      id: 'wallpapers', label: 'Wallpapers',
      dynamic: {
        listKey: '__list.life.wallpapers',
        defaultIds: ['01', '02', '03', '04', '05'],
        makeCard: wallpaperFields
      }
    },
    {
      id: 'comics', label: 'Comics',
      dynamic: {
        listKey: '__list.life.comics',
        defaultIds: ['01', '02'],
        makeCard: comicFields
      }
    },
    {
      id: 'clothing', label: 'Clothing',
      dynamic: {
        listKey: '__list.life.clothing',
        defaultIds: ['01'],
        makeCard: clothingFields
      }
    },
    {
      id: 'art-sale', label: 'Art for sale',
      dynamic: {
        listKey: '__list.life.art-sale',
        defaultIds: ['01', '02', '03'],
        makeCard: artSaleFields
      }
    },
    {
      id: 'ebooks', label: 'E-books',
      dynamic: {
        listKey: '__list.life.ebooks',
        defaultIds: ['01', '02'],
        makeCard: ebookFields
      }
    }
  ];

  window.CMS_CASES = CASE_REGISTRY;
  window.CMS_DESIGN = DESIGN_REGISTRY;

  window.CMS_SCHEMA = {
    categories: CATEGORIES,
    nav: [
      { id: 'home', label: 'Home' },
      { id: 'projects', label: 'Projects' },
      { id: 'life', label: 'Life' },
      { id: 'settings', label: 'Settings' }
    ],
    panels: {
      home: {
        groups: [
          {
            id: 'about',
            label: 'About',
            cards: [{
              id: 'about-headshot', title: 'Headshot',
              fields: [img('about/headshot.jpg', 'Photo', '900 × 1120 px (4:5)')]
            }]
          },
          {
            id: 'medium',
            label: 'Medium',
            dynamic: {
              listKey: '__list.home.medium',
              defaultIds: ['01', '02', '03'],
              makeCard(itemId) {
                return {
                  id: `medium-${itemId}`,
                  title: `Article ${itemId}`,
                  fieldPrefix: `home.medium.${itemId}.`,
                  fields: [
                    text(`home.medium.${itemId}.title`, 'Title'),
                    textarea(`home.medium.${itemId}.about`, 'Subtitle'),
                    text(`home.medium.${itemId}.url`, 'Medium link')
                  ]
                };
              }
            }
          }
        ]
      },
      projects: {
        groups: [
          {
            id: 'design',
            label: 'Design projects',
            dynamic: {
              listKey: '__list.projects.design',
              defaultIds: ['01', '02', '03'],
              makeCard: makeDesignCard
            }
          },
          {
            id: 'case',
            label: 'Case study projects',
            dynamic: {
              listKey: '__list.projects.case',
              defaultIds: ['01', '02', '03', '04', '05'],
              makeCard: makeCaseCard
            }
          }
        ]
      },
      life: { sections: lifeSections },
      settings: {
        groups: [
          {
            id: 'access',
            label: 'Access & locks',
            cards: [{
              id: 'access', title: 'Access & locks',
              fields: [
                pass('settings.adminPassword', 'Admin password'),
                pass('settings.lifePassword', 'Life password'),
                toggle('settings.lifeLockEnabled', 'Lock Life sections')
              ]
            }]
          },
          {
            id: 'categories',
            label: 'Categories',
            manageCategories: true
          }
        ]
      }
    }
  };
})();
