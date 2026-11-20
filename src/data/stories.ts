// Case studies as stories, in Oladele's words.
// Only facts he has stated. Real screens and Mylo's layers drop into the `src` fields when they arrive.

export type Media =
  | { kind: 'compare'; before: string; after: string; beforeSrc?: string; afterSrc?: string; caption?: string }
  | { kind: 'cover'; label: string; src?: string; caption?: string; ratio?: string }
  | { kind: 'pair'; items: { label: string; src?: string }[]; caption?: string }
  // Scroll-zoom: one screen, the camera moves to each focus point while the note changes
  | { kind: 'zoom'; label: string; src?: string; stops: { x: number; y: number; scale: number; title: string; text: string }[] }
  // Step flow, e.g. the payment flow
  | { kind: 'flow'; steps: { t: string; d: string; src?: string; demo?: 'bag' | 'map' | 'delivery' | 'pay' }[]; caption?: string }
  // Mylo's build-up: sketch, then each gem adds a layer
  | { kind: 'build'; stages: { gem: string; t: string; d: string; src?: string }[] }
  // What we tried, in order, and what each attempt taught us
  | { kind: 'tries'; items: { t: string; why: string; then: string; src?: string }[] };

export type Chapter = {
  id: string;
  step: string;
  kicker: string;
  title: string;
  body: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  note?: string;
  media?: Media;
  more?: { title: string; body: string[] };   // "Read how we solved it" drawer
  todo?: string;
};

export type Story = {
  slug: string;
  label: string;
  title: string;
  subtitle: string;
  facts: [string, string][];
  arc: { v: string; t: string }[];
  chapters: Chapter[];
  results: { n: string; count?: number; suffix?: string; label: string }[];
  related?: { slug: string; line: string };
};

export const stories: Story[] = [
  /* ============================ VIRELLE ============================ */
  {
    slug: 'virelle',
    label: 'Case study · Client',
    title: 'A store people trust,\nand the CRM behind it',
    subtitle: 'Virelle Wellness Hub sells supplements, skincare, fragrance and whole foods in Lagos and Abuja. Selling is half the job. Getting paid without friction and getting every order out on time is the other half.',
    facts: [['Role', 'Design + build'], ['Surfaces', 'Store, checkout, CRM'], ['Team', 'Founder + 2 staff'], ['Launched', 'November 2026']],
    arc: [{ v: 'V1', t: 'Vibe coded to go live' }, { v: 'System', t: 'Components and colour' }, { v: 'Checkout', t: 'Pay without stress' }, { v: 'CRM', t: 'Orders out, nothing lost' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'Buying wellness products here is a gamble',
        body: ['People buy supplements and skincare from Instagram vendors and hope for the best. The founder kept hearing the same complaints, so the store had to answer every one of them.'],
        list: ['Fake products, which is a real health risk', 'Expired stock nobody warns you about', 'Delivery dates that are a guess', 'Nobody replies when you have a question at night'],
        note: 'Build one store people can trust with their health, and one place for the team to run it.',
      },
      {
        id: 'v1', step: 'Version 1', kicker: '02 · Version 1', title: 'We vibe coded it first',
        body: ['The first version was vibe coded. We needed the store live and taking real orders before spending weeks on design, so we built it fast and put it in front of customers.',
               'It did its job. But the spacing was off from page to page, product images were cropped badly and every category looked the same. It worked, it just wasn\'t a place you\'d enjoy shopping.'],
        media: { kind: 'compare', before: 'Old design', after: 'New design', caption: 'Drag to compare the vibe coded version with the redesign.' },
      },
      {
        id: 'system', step: 'The design system', kicker: '03 · The redesign', title: 'Take what we had and finish it properly',
        body: ['We didn\'t throw the first version away. We took the vibe coded design, rebuilt it in Figma and turned it into components and a design system, so every page uses the same parts and the same spacing.',
               'Then the colour. Health shopping makes people anxious, so I made the colours easy on the eye: calm shades, a clear green for trust and one colour per category so you can find skincare or supplements at a glance. Less noise, less to read, easier to decide. Easier to decide means more people get to checkout.'],
        media: { kind: 'zoom', label: 'Virelle · new store', stops: [
          { x: 50, y: 50, scale: 1, title: 'The whole store', text: 'Minimal, calm and easy to scan.' },
          { x: 30, y: 35, scale: 2.2, title: 'Colour per category', text: 'Each category has its own calm shade, so you know where you are without reading.' },
          { x: 70, y: 60, scale: 2.4, title: 'Product cards', text: 'Clean images, the price, the expiry date. Nothing you don\'t need to decide.' },
          { x: 80, y: 20, scale: 2.6, title: 'Ask Vira', text: 'The AI product finder answers at any time and adds products to the bag.' },
        ] },
      },
      {
        id: 'checkout', step: 'The checkout', kicker: '04 · The checkout', title: 'Paying should be as easy as browsing',
        body: ['The payment section is the core of any store. If finding a product is easy but paying is hard, you lose the sale at the last step. So the checkout had to be smooth, with no friction and not too much information thrown at people.',
               'The biggest one was the address. Typing a full Lagos address takes time and people give up. So I added a map: you use your GPS and drop a pin, and your address fills in. Less typing, less fatigue, more finished orders.'],
        media: { kind: 'flow', caption: 'Four steps from bag to paid.', steps: [
          { t: 'Bag', d: 'Review your items. Member discounts show here, not on the cards.', demo: 'bag' },
          { t: 'Address', d: 'Use your GPS and drop a pin. No long address to type.', demo: 'map' },
          { t: 'Delivery', d: 'The two cheapest delivery options, live from the riders.', demo: 'delivery' },
          { t: 'Pay', d: 'Pay with Paystack and get your receipt by email.', demo: 'pay' },
        ] },
      },
      {
        id: 'crm', step: 'The CRM', kicker: '05 · The CRM', title: 'Fulfilling the order matters as much as the sale',
        body: ['Selling and getting paid is one part. The other part is getting every order to the customer and taking care of them after, without losing any information on the way.',
               'So I studied how Virelle actually works: who receives the orders, who packs them and who sends them out. The CRM is built around that, so the team can sort orders quickly and the details stay correct from the moment someone pays to the moment it arrives.',
               'For delivery, I connected Terminal Africa, an API that connects riders. Delivery options show up right at checkout, and the store offers the two cheapest ones, so customers don\'t overpay and the team doesn\'t have to call around for a rider.'],
        table: { head: ['Who', 'What they see'], rows: [['Founder', 'Everything, and the only one who can change bank details'], ['Developer', 'Invites, activity logs, limited access'], ['Orders', 'Orders only']] },
        list: ['Lagos and Abuja run as separate delivery queues', 'Walk-in orders can be added by hand and booked with a rider', 'The courier wallet balance is visible to everyone', 'Bookkeeping in one place: profits, deliveries and fees'],
        media: { kind: 'pair', items: [{ label: 'CRM · Orders' }, { label: 'CRM · Mobile' }] },
        more: { title: 'How an order moves through the CRM', body: ['Customer pays on the store, the order lands in the right city queue, the packer marks it packed, the rider is booked through Terminal Africa and the customer gets updates by email. Every step is logged with who did it.'] },
      },
      {
        id: 'result', step: 'The result', kicker: '06 · The result', title: 'Live, and measured',
        body: ['Virelle Wellness Hub launched in November 2026. First vibe coded, then a design system, then a checkout and CRM built around how the team really works. Now I\'m watching how often customers come back and how long each task takes the team.'],
        todo: 'Add the first real numbers here once they are in.',
      },
    ],
    results: [{ n: 'Nov 2026', label: 'Launched' }, { n: '2', count: 2, label: 'Cheapest delivery options at checkout' }, { n: '3', count: 3, label: 'Staff roles, one CRM' }],
  },

  /* ============================ MYLO ============================ */
  {
    slug: 'mylo',
    label: 'Case study · Own product',
    title: 'We couldn\'t stick with our\nown app. So we fixed it',
    subtitle: 'Mylo is a goal app for two or more people who keep each other accountable. Before anyone outside used it, my partners and I had to want to open it every day. At first, we didn\'t.',
    facts: [['Role', 'Founder, product, mascot'], ['Platform', 'Mobile app'], ['Type', 'Own product'], ['Result', 'Day-10 retention 30% to 70%']],
    arc: [{ v: 'V1', t: 'Too plain' }, { v: 'Tries', t: 'Game, streaks, freeze' }, { v: 'V2', t: 'Story, levels, friends' }, { v: 'Mylo', t: 'A character to come back to' }],
    chapters: [
      {
        id: 'why', step: 'Why Mylo', kicker: '01 · Why Mylo exists', title: 'Goalden was solo. Solo is easy to cheat',
        body: ['Mylo came from what Goalden taught me. Goalden is a good product, but it\'s a solo app, and when you\'re alone it\'s easy to cheat yourself. Nobody sees you skip.',
               'Mylo is for two or more people. Your friends can see your goals, and you can see theirs. Someone is holding you to it.'],
      },
      {
        id: 'v1', step: 'Version 1', kicker: '02 · Version 1', title: 'Our rule: it has to work for us first',
        body: ['Before we let anyone outside try a product, it has to work for us. The first Mylo didn\'t. It was too plain. We called it Mylo and gave it one face, the base face, and that was it. My partners and I kept forgetting to open it.'],
        media: { kind: 'cover', label: 'Mylo · version 1', caption: 'The first version. One face, no personality.' },
      },
      {
        id: 'tries', step: 'What we tried', kicker: '03 · What we tried', title: 'One fix at a time, until it stuck',
        body: ['We didn\'t redesign everything at once. We added one thing, used the app ourselves and watched what happened.'],
        media: { kind: 'tries', items: [
          { t: 'A game', why: 'We thought a game would give us a reason to come back.', then: 'It worked for a while, then the game got old.' },
          { t: 'Streaks', why: 'A streak made us want to show up every day.', then: 'But miss one day and you lose the count, and the motivation with it.' },
          { t: 'Streak freeze', why: 'A freeze lets you save your streak and pick up where you stopped.', then: 'People could recover instead of quitting. But the app still didn\'t look good enough to come back to.' },
          { t: 'A full UI redesign', why: 'A normal user needs the app to feel good, not just work.', then: 'The new UI showed the next problem: onboarding felt gated. You couldn\'t get into the app.' },
          { t: 'New onboarding', why: 'We had to make people comfortable before asking anything of them.', then: 'People got in, and we started thinking about what keeps them for months, not days.' },
        ] },
        more: { title: 'Read how we solved each one', body: ['Each change went to the founding team first. We used the app every day for a stretch, noted where we dropped off and only then moved to the next fix. That loop is what got us from a plain app to something we open without thinking.'] },
      },
      {
        id: 'habits', step: 'Atomic Habits', kicker: '04 · The psychology', title: 'Always something to look forward to',
        body: ['We moved from looking at productivity apps to reading books about habits, starting with Atomic Habits. It talks about how many days it takes before showing up stops feeling like effort.',
               'So we built Mylo like a story. XP, levels and new features that unlock as you go, so across those first months there\'s always something new waiting for you. You keep opening the app because you want to see what\'s next.'],
        media: { kind: 'cover', label: 'Mylo · levels and XP', caption: 'Levels that unlock new features over the first months.' },
      },
      {
        id: 'mylo', step: 'Meet Mylo', kicker: '05 · Meet Mylo', title: 'How Mylo became Mylo',
        body: ['The base face wasn\'t enough. Mylo needed a personality you\'d miss. It started as a sketch, then got colour, emotions, outfits and accessories. Scroll to watch it happen.'],
        media: { kind: 'build', stages: [
          { gem: 'Sketch', t: 'A plain sketch', d: 'Where every character starts. Shape first, nothing else.' },
          { gem: 'Colour', t: 'Colour', d: 'The colour gem gives Mylo its palette, warm and friendly.' },
          { gem: 'Emotion', t: 'Emotions', d: 'Mylo reacts. Happy when you check in, worried when you go quiet.' },
          { gem: 'Outfit', t: 'Outfits', d: 'Outfits you unlock as you level up.' },
          { gem: 'Accessories', t: 'Accessories', d: 'The small extras that make your Mylo yours.' },
        ] },
      },
      {
        id: 'friends', step: 'Friends and proof', kicker: '06 · Friends and proof', title: 'Do the goal first. Then chat. Then play',
        body: ['We added reactions and chat so you can talk to your friends. An app you use alone is hard to come back to.',
               'Then a new problem: what if people just chat instead of doing their goals? So you complete your goal before you can chat, and before you can play the games.',
               'And how do you know someone really did the goal, and didn\'t just tick the box? Now you check in with a photo, the way you\'d share a streak on Snapchat. Your friends see it. Real accountability, real transparency.'],
        list: ['Complete your goal to unlock chat and games', 'Check in with a photo, so friends can see it\'s real', 'See your friends\' goals and react to them'],
        media: { kind: 'compare', before: 'Old Mylo', after: 'New Mylo', caption: 'Drag to compare the first Mylo with the one we use today.' },
      },
      {
        id: 'result', step: 'The result', kicker: '07 · The result', title: 'Day-10 retention went from 30% to 70%',
        body: ['With Mylo the character, the levels and the friend loop in place, more than twice as many people were still using the app on day 10.'],
      },
    ],
    results: [{ n: '30%', count: 30, suffix: '%', label: 'Day 10, before' }, { n: '70%', count: 70, suffix: '%', label: 'Day 10, after' }],
    related: { slug: 'goalden', line: 'Mylo started with what Goalden taught me. Read Goalden' },
  },

  /* ============================ GOALDEN ============================ */
  {
    slug: 'goalden',
    label: 'Case study · Own product',
    title: 'The UI was good.\nPeople still left',
    subtitle: 'Goalden is a productivity app where every daily task connects to one big goal for the year. It worked. The structure was just too rigid to come back to.',
    facts: [['Role', 'Brand, web, app'], ['Type', 'Own product'], ['Testers', '100 on version 1'], ['Stage', 'Testing version 2']],
    arc: [{ v: 'Idea', t: 'One big goal' }, { v: 'V1', t: 'Good UI, rigid' }, { v: 'Learn', t: 'People dropped' }, { v: 'V2', t: 'Coaches with personality' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'Most apps let you set goals that go nowhere',
        body: ['Most productivity apps say set your goals, set your habits, and stop there. There\'s nothing tying what you do today to what you actually want this year.',
               'Goalden starts with one big goal and breaks it down: quarter, month, week, day. Everything you do has to line up with it. Say you want to be a strong UI/UX designer by 2027. Your monthly goal is a course. Your daily goal is the lesson.'],
        list: ['Goals are split into areas: career, financial, relationship and more', 'Every daily task traces back to the big goal for the year'],
      },
      {
        id: 'smart', step: 'Smart Suggest', kicker: '02 · Smart Suggest', title: 'When you miss, it adjusts instead of judging',
        body: ['Smart Suggest is an AI that watches how you show up. If you keep missing something, it helps you change the plan instead of letting you quit.',
               'Miss your morning gym session five days in a row and it says so, then offers to move it to the evening, or cut it from 30 minutes to 10. Smaller steps you\'ll actually do.'],
        media: { kind: 'cover', label: 'Goalden · Smart Suggest', caption: 'Smart Suggest noticing a pattern and offering a smaller step.' },
      },
      {
        id: 'v1', step: 'Version 1', kicker: '03 · Version 1', title: '100 testers, and most of them dropped',
        body: ['Version 1 went to 100 testers. The UI was okay and it did what it was supposed to do. But between day 1 and day 20, people dropped the app.',
               'The structure was rigid. There was nothing with a personality, nothing pulling you back.'],
        media: { kind: 'compare', before: 'Version 1', after: 'Version 2', caption: 'Drag to compare version 1 with the coach-led version 2.' },
      },
      {
        id: 'coaches', step: 'Coaches', kicker: '04 · Version 2', title: 'Give the app characters people come back to',
        body: ['We studied Duolingo. Its characters give the app a personality, and that personality is a big part of why people keep opening it every day.',
               'So version 2 has coaches: career, fitness, finance, relationship, reflection, productivity, mindfulness and spirituality. Each has its own personality and body type. They check in, give advice and make the app feel personal, so following the plan feels less like a chore.',
               'Once the coaches were in, things started going right with testers.'],
        media: { kind: 'pair', items: [{ label: 'Goalden · coaches' }, { label: 'Goalden · check-in' }] },
      },
      {
        id: 'lesson', step: 'What it taught me', kicker: '05 · What it taught me', title: 'Productivity apps are where retention gets tested',
        body: ['Productivity apps are the hardest thing I\'ve designed, because they live or die on retention. If people don\'t come back, nothing else matters.',
               'People call me Big Brain, and that\'s where my head goes: what does the brain find rewarding? I take one or two ideas from neuroscience and Atomic Habits at a time and build them in so they don\'t feel like friction. Goalden taught me that, and I use it on everything now.',
               'It also showed me Goalden\'s gap. It\'s solo, and alone it\'s easy to cheat yourself. That gap is why I built Mylo.'],
        todo: 'Add version 2 tester numbers when ready.',
      },
    ],
    results: [{ n: '100', count: 100, label: 'Testers on version 1' }, { n: '8', count: 8, label: 'Coaches in version 2' }],
    related: { slug: 'mylo', line: 'Goalden\'s gap is why Mylo exists. Read Mylo' },
  },
];

export const storyBySlug = (s: string) => stories.find(x => x.slug === s);
