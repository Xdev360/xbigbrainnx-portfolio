// Case studies as stories, in Oladele's words.
// Only facts he has stated. Real screens and Mylo's layers drop into the `src` fields when they arrive.

export type Media =
  | { kind: 'compare'; before: string; after: string; beforeSrc?: string; afterSrc?: string; caption?: string; ratio?: string }
  | { kind: 'cover'; label: string; src?: string; caption?: string; ratio?: string }
  | { kind: 'pair'; items: { label: string; src?: string }[]; caption?: string }
  | { kind: 'phones'; items: { label: string; src: string }[]; caption?: string }
  // Scroll-zoom: one screen, the camera moves to each focus point while the note changes
  | { kind: 'zoom'; label: string; src?: string; stops: { x: number; y: number; scale: number; title: string; text: string }[] }
  // Step flow, e.g. the payment flow
  | { kind: 'flow'; steps: { t: string; d: string; src?: string; demo?: 'bag' | 'map' | 'delivery' | 'pay' }[]; caption?: string }
  // Mylo's build-up: sketch, then each gem adds a layer
  | { kind: 'build'; stages: { gem: string; t: string; d: string; src?: string }[] }
  // What we tried, in order, and what each attempt taught us
  | { kind: 'tries'; items: { t: string; why: string; then: string; did?: string; src?: string }[] };

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

export type Results = {
  head: string;
  lede?: string;
  compare?: { label: string; before: number; after: number; beforeLabel: string; afterLabel: string };
  stats: { n: string; count?: number; suffix?: string; label: string; note?: string }[];
};

export type Story = {
  slug: string;
  label: string;
  title: string;
  subtitle: string;
  facts: [string, string][];
  arc: { v: string; t: string }[];
  chapters: Chapter[];
  results: Results;
  related?: { slug: string; line: string };
};

export const stories: Story[] = [
  /* ============================ VIRELLE STORE ============================ */
  {
    slug: 'virelle-store',
    label: 'Case study · Client',
    title: 'A wellness store\npeople can trust',
    subtitle: 'Virelle Wellness Hub sells supplements, skincare, fragrance and whole foods in Lagos and Abuja. People buy health products online with a lot of doubt. The store had to answer that doubt, then make paying as easy as browsing.',
    facts: [['Role', 'Design + build'], ['Surfaces', 'Store, checkout, Ask Vira'], ['Client', 'Virelle Wellness Hub'], ['Launched', 'November 2026']],
    arc: [{ v: 'V1', t: 'Vibe coded to go live' }, { v: 'System', t: 'Components and colour' }, { v: 'Checkout', t: 'Pay without stress' }, { v: 'Live', t: 'Launched and measured' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'Buying wellness products here is a gamble',
        body: ['People buy supplements and skincare from Instagram vendors and hope for the best. The founder kept hearing the same complaints, so the store had to answer every one of them.'],
        list: ['Fake products, which is a real health risk', 'Expired stock nobody warns you about', 'Delivery dates that are a guess', 'Nobody replies when you have a question at night'],
        note: 'Build one store people can trust with their health.',
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
        id: 'result', step: 'The result', kicker: '05 · The result', title: 'Live, and measured',
        body: ['Virelle Wellness Hub launched in November 2026. First vibe coded, then a design system, then a checkout that takes the typing out of paying. Now I\'m watching how often customers come back.',
               'Behind the store is the tool the team runs it on. That\'s its own story: [the Virelle CRM](/work/virelle-crm).'],
        todo: 'Add the first real numbers here once they are in.',
      },
    ],
    results: {
      head: 'Live, and taking real orders',
      lede: 'Launched in November 2026. The first real numbers go here as soon as they are in.',
      stats: [
        { n: '4', count: 4, label: 'Steps from bag to paid', note: 'Bag, address, delivery, pay. Nothing thrown at you that you don\'t need.' },
        { n: '1', count: 1, label: 'Pin instead of a typed address', note: 'Use your GPS, drop a pin and the address fills in.' },
        { n: '2', count: 2, label: 'Cheapest delivery options', note: 'Pulled live from the riders, so customers don\'t overpay.' },
      ],
    },
    related: { slug: 'virelle-crm', line: 'Also read the Virelle CRM, the tool the team runs the store on' },
  },

  /* ============================ VIRELLE CRM ============================ */
  {
    slug: 'virelle-crm',
    label: 'Case study · Client',
    title: 'The CRM that gets\nevery order out',
    subtitle: 'Selling and getting paid is one part of running Virelle. The other part is getting every order to the customer and taking care of them after, without losing any information on the way.',
    facts: [['Role', 'Design + build'], ['Users', 'Founder + 2 staff'], ['Cities', 'Lagos and Abuja'], ['Launched', 'November 2026']],
    arc: [{ v: 'Study', t: 'How the team works' }, { v: 'Roles', t: 'See what your job needs' }, { v: 'Queues', t: 'One per city' }, { v: 'Riders', t: 'Booked from the order' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'Fulfilling the order matters as much as the sale',
        body: ['A store can look great and still lose customers after they pay. Orders get missed, details get typed wrong, and nobody knows which rider has what.',
               'The store is [the other half of this story](/work/virelle-store). This is the tool behind it.'],
        note: 'One place for the team to run the store, where the details stay correct from payment to delivery.',
      },
      {
        id: 'study', step: 'How the team works', kicker: '02 · Study it first', title: 'I studied how Virelle actually works',
        body: ['Before designing a single screen, I looked at who receives the orders, who packs them and who sends them out. The CRM is built around that, so the team can sort orders quickly and nothing gets lost between people.'],
        media: { kind: 'flow', caption: 'How an order moves through the CRM. Every step is logged with who did it.', steps: [
          { t: 'Paid', d: 'The customer pays on the store and the order lands in the right city queue.', demo: 'pay' },
          { t: 'Packed', d: 'The packer marks it packed. Everyone can see where it is.', demo: 'bag' },
          { t: 'Rider', d: 'A rider is booked through Terminal Africa, right from the order.', demo: 'delivery' },
          { t: 'Delivered', d: 'The customer gets updates by email until it arrives.', demo: 'map' },
        ] },
      },
      {
        id: 'roles', step: 'Roles', kicker: '03 · Roles', title: 'Everyone sees what their job needs',
        body: ['Three people run Virelle day to day, and each one sees only what their job needs. Fewer things on screen means fewer mistakes, and the sensitive parts stay with the founder.'],
        table: { head: ['Who', 'What they see'], rows: [['Founder', 'Everything, and the only one who can change bank details'], ['Developer', 'Invites, activity logs, limited access'], ['Orders', 'Orders only']] },
        media: { kind: 'pair', items: [{ label: 'CRM · Orders' }, { label: 'CRM · Mobile' }] },
      },
      {
        id: 'delivery', step: 'Delivery', kicker: '04 · Delivery', title: 'No more calling around for a rider',
        body: ['For delivery, I connected Terminal Africa, an API that connects riders. Delivery options show up right at checkout, and the store offers the two cheapest ones, so customers don\'t overpay and the team doesn\'t have to call around for a rider.'],
        list: ['Lagos and Abuja run as separate delivery queues', 'Walk-in orders can be added by hand and booked with a rider', 'The courier wallet balance is visible to everyone', 'Bookkeeping in one place: profits, deliveries and fees'],
      },
      {
        id: 'result', step: 'The result', kicker: '05 · The result', title: 'Live with the store',
        body: ['The CRM went live with the store in November 2026. Now I\'m watching how long each task takes the team, from the moment someone pays to the moment it arrives.'],
        todo: 'Add the first real numbers here once they are in.',
      },
    ],
    results: {
      head: 'One place to run the store',
      lede: 'Built around how the team really works, not around a template. The first timing numbers go here once they are in.',
      stats: [
        { n: '3', count: 3, label: 'Roles, one CRM', note: 'Each person sees only what their job needs.' },
        { n: '2', count: 2, label: 'City queues', note: 'Lagos and Abuja run separately, so orders never mix.' },
        { n: '4', count: 4, label: 'Steps, all logged', note: 'Paid, packed, rider, delivered. Every step shows who did it.' },
      ],
    },
    related: { slug: 'virelle-store', line: 'Also read the Virelle store, the side customers see' },
  },

  /* ============================ MYLO ============================ */
  {
    slug: 'mylo',
    label: 'Case study · Own product',
    title: 'We couldn\'t stick with our\nown app. So we fixed it',
    subtitle: 'Mylo is a productivity app for two or more people who keep each other accountable. Before anyone outside used it, my partners and I had to want to open it every day. At first, we didn\'t.',
    facts: [['Role', 'Founder, product, mascot'], ['Platform', 'Mobile app'], ['Type', 'Own product'], ['Result', 'Day-10 retention 30% to 70%']],
    arc: [{ v: 'V1', t: 'Too plain' }, { v: 'Tries', t: 'Game, streaks, freeze' }, { v: 'V2', t: 'Story, levels, friends' }, { v: 'Mylo', t: 'A character to come back to' }],
    chapters: [
      {
        id: 'idea', step: 'The idea', kicker: '01 · The idea', title: 'Goals stick when someone is holding you to them',
        body: ['Mylo is a productivity app for two or more people. You set your goals, your friends can see them, and you keep each other going.',
               'On your own it\'s easy to skip and nobody notices. When your people can see you, you show up.'],
      },
      {
        id: 'v1', step: 'Version 1', kicker: '02 · Version 1', title: 'Our rule: it has to work for us first',
        body: ['Before we let anyone outside try a product, it has to work for us. The first Mylo didn\'t. It was too plain. We called it Mylo and gave it one face, the base face, and that was it. My partners and I kept forgetting to open it.'],
        media: { kind: 'cover', label: 'Mylo · early faces', src: '/work/mylo/v1-faces.webp', ratio: '16 / 9', caption: 'Early Mylo. A plain white character and a set of simple faces. Cute, but nothing that made us come back.' },
      },
      {
        id: 'tries', step: 'What I tried', kicker: '03 · What I tried', title: 'One fix at a time, until it stuck',
        body: ['I didn\'t redesign everything at once. I added one thing, we used the app ourselves, and I watched what happened. Each fix showed me the next problem.'],
        media: { kind: 'tries', items: [
          { t: 'A game', src: '/work/mylo/game-chess.webp', why: 'I thought a game would give us a reason to open the app every day.', then: 'It worked for a while. Then the game got old, and so did the reason to come back.', did: 'I kept the games but put them behind your goals. You finish your goal first, then you play. And I added streaks.' },
          { t: 'Streaks', src: '/work/mylo/streak.webp', why: 'A streak gives you something to protect, so you show up every day.', then: 'Miss one day and the count goes back to zero. The motivation goes with it.', did: 'I added a streak freeze, so one missed day doesn\'t wipe out weeks of showing up.' },
          { t: 'Streak freeze', src: '/work/mylo/streak-freeze.webp', why: 'I wanted people to recover from a bad day instead of quitting.', then: 'It worked, people came back after a miss. But the app still didn\'t look good enough to want to open.', did: 'I redesigned the whole UI, so a normal user would enjoy being in it, not just use it.' },
          { t: 'A full UI redesign', src: '/work/mylo/new-today.webp', why: 'A normal user needs the app to feel good, not just work.', then: 'The new UI showed the next problem. Onboarding felt gated, and people couldn\'t get into the app.', did: 'I rebuilt onboarding to make people comfortable first and ask for things later.' },
          { t: 'New onboarding', src: '/work/mylo/onboarding.webp', why: 'I had to make people comfortable before asking anything of them.', then: 'People got in. Now the question was what keeps them for months, not days.', did: 'I went to the habit books, starting with Atomic Habits, and turned the app into a story with XP and levels.' },
        ] },
        more: { title: 'How I tested each fix', body: ['Each change went to the founding team first. We used the app every day for a stretch, I noted where we dropped off and only then moved to the next fix. That loop is what got us from a plain app to something we open without thinking.'] },
      },
      {
        id: 'habits', step: 'Atomic Habits', kicker: '04 · The psychology', title: 'Always something to look forward to',
        body: ['We moved from looking at productivity apps to reading books about habits, starting with Atomic Habits. It talks about how many days it takes before showing up stops feeling like effort.',
               'So we built Mylo like a story. XP, levels and new features that unlock as you go, so across those first months there\'s always something new waiting for you. You keep opening the app because you want to see what\'s next.'],
        media: { kind: 'phones', items: [{ label: 'Your level', src: '/work/mylo/levels.webp' }, { label: 'Today', src: '/work/mylo/new-today.webp' }], caption: 'Levels unlock new things over the first months. Flame opens games and challenges.' },
      },
      {
        id: 'mylo', step: 'Meet Mylo', kicker: '05 · Meet Mylo', title: 'How Mylo became Mylo',
        body: ['The base face wasn\'t enough. Mylo needed a personality you\'d miss. It started as a sketch, then got colour, emotions, outfits and accessories. Scroll to watch it happen, then make your own.'],
        media: { kind: 'build', stages: [
          { gem: 'Sketch', t: 'A plain sketch', d: 'Where every character starts. Shape first, nothing else.' },
          { gem: 'Colour', t: 'Colour', d: 'The colour gem fills Mylo in. White by default, and you can pick another colour.' },
          { gem: 'Emotion', t: 'Emotions', d: 'Now Mylo can feel things. 12 faces: happy when you check in, sleepy at night, proud when you finish.' },
          { gem: 'Outfit', t: 'Outfits', d: '16 outfits you unlock as you level up. You pick what your Mylo wears.' },
          { gem: 'Accessories', t: 'Accessories', d: 'Beanies, headphones, party hats. The extras that make your Mylo yours. Try them on the right.' },
        ] },
      },
      {
        id: 'friends', step: 'Friends and proof', kicker: '06 · Friends and proof', title: 'Do the goal first. Then chat. Then play',
        body: ['We added reactions and chat so you can talk to your friends. I\'d already learned this with [Goalden](/work/goalden), my solo goal app: when it\'s just you, it\'s easy to cheat yourself. An app you use alone is hard to come back to.',
               'Then a new problem: what if people just chat instead of doing their goals? So you complete your goal before you can chat, and before you can play the games.',
               'And how do you know someone really did the goal, and didn\'t just tick the box? Now you check in with a photo, the way you\'d share a streak on Snapchat. Your friends see it. Real accountability, real transparency.'],
        list: ['Complete your goal to unlock chat and games', 'Check in with a photo, so friends can see it\'s real', 'See your friends\' goals and react to them'],
        media: { kind: 'phones', items: [{ label: 'Room chat', src: '/work/mylo/room-chat.webp' }], caption: 'A room: chat, voice notes, Mylo stickers and cheers when someone finishes.' },

      },
      {
        id: 'then-now', step: 'Then and now', kicker: '07 · Then and now', title: 'The same screen, a different reason to open it',
        body: ['Here\'s the Today screen from the old redesign next to the one we launch with. Less on screen, your friends\' progress up front, Mylo right there with you, and the next level always in view.'],
        media: { kind: 'compare', before: 'Old redesign', after: 'Launch', beforeSrc: '/work/mylo/old-today.webp', afterSrc: '/work/mylo/new-today.webp', ratio: '393 / 852', caption: 'The Today screen. Drag to compare the old redesign with the one we launch with.' },
      },
      {
        id: 'result', step: 'The result', kicker: '08 · The result', title: 'Day-10 retention went from 30% to 70%',
        body: ['With Mylo the character, the levels and the friend loop in place, more than twice as many people were still using the app on day 10.'],
      },
    ],
    results: {
      head: 'More than twice as many people still open Mylo on day 10',
      lede: 'The character, the levels and the friend loop went in one at a time. Day-10 retention is the number I watched the whole way.',
      compare: { label: 'Day-10 retention', before: 30, after: 70, beforeLabel: 'Before', afterLabel: 'After' },
      stats: [
        { n: '5', count: 5, label: 'Fixes, tested one at a time', note: 'Game, streaks, freeze, redesign, onboarding. Each one showed me the next problem.' },
        { n: '12', count: 12, label: 'Faces for Mylo', note: 'Happy when you check in, sleepy at night, proud when you finish.' },
        { n: '16', count: 16, label: 'Outfits to unlock', note: 'Something new to look forward to as you level up.' },
      ],
    },
    related: { slug: 'goalden', line: 'Also read Goalden, a goal app that breaks your year into today' },
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
               'It also showed me Goalden\'s gap. It\'s solo, and alone it\'s easy to cheat yourself. That gap is why I built [Mylo](/work/mylo).'],
        todo: 'Add version 2 tester numbers when ready.',
      },
    ],
    results: {
      head: '100 testers showed me what version 1 was missing',
      lede: 'The UI did its job. What it lacked was a reason to come back, and that is what version 2 is built around.',
      stats: [
        { n: '100', count: 100, label: 'Testers on version 1', note: 'Most of them dropped between day 1 and day 20. That drop is the whole lesson.' },
        { n: '8', count: 8, label: 'Coaches in version 2', note: 'Each with its own personality and body type. Things started going right once they were in.' },
        { n: '4', count: 4, label: 'Steps from year to today', note: 'Quarter, month, week, day. Every task traces back to the big goal.' },
      ],
    },
    related: { slug: 'mylo', line: 'Also read Mylo, the goal app you do with friends' },
  },

  /* ============================ CHATGROW ============================ */
  {
    slug: 'chatgrow',
    label: 'Case study · Volunteer',
    title: 'Sorting a hotel\'s\ninformation so staff can find it',
    subtitle: 'ChatGrow is a hotel management system: reservations, rooms, the restaurant, payments and the channels that sell the rooms. I volunteered to help the designer with the hard part, the information.',
    facts: [['Role', 'Information architecture, UI'], ['Product', 'Hotel management system'], ['Type', 'Volunteer'], ['Scope', 'Front desk to finance']],
    arc: [{ v: 'Mess', t: 'Too much, in one place' }, { v: 'Map', t: 'How a hotel works' }, { v: 'Group', t: 'Five clear areas' }, { v: 'States', t: 'Every case covered' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'A hotel runs on more data than one screen can hold',
        body: ['A designer I know was building ChatGrow and I offered to help. The screens were there, but a hotel creates a lot of information at once: who\'s arriving, which rooms are clean, what the kitchen is cooking, who still owes money, and what Booking.com just sent over.',
               'My part was to sort it. How that information gets collected, where it lives and how it shows up, so the person at the front desk finds what they need in a few seconds.'],
        media: { kind: 'cover', label: 'ChatGrow · Front desk', src: '/work/chatgrow/front-desk.webp', ratio: '2400 / 1559', caption: 'The front desk: arrivals, departures, today\'s bookings and what needs attention.' },
      },
      {
        id: 'map', step: 'How a hotel works', kicker: '02 · Map it first', title: 'Follow the guest, then follow the money',
        body: ['Before touching layouts I mapped how a hotel actually runs. A guest books, arrives, gets a room, orders food, gets charged and checks out. Every step creates data, and different staff need different parts of it.',
               'So the menu follows that path instead of the database. Reservations and operations first, then sales and outlets, then finance, with rates, channels and settings kept for the people who manage them.'],
        list: ['Reservations and operations: front desk, reservations, guests, rooms, groups, add-ons', 'Rates and distribution: rates and plans, channel manager', 'Sales and outlets: outlet, inventory, menu, orders, fulfilment', 'Finance: overview, transactions, reports', 'Administration: settings, users and roles'],
        media: { kind: 'zoom', label: 'ChatGrow · Channel manager', src: '/work/chatgrow/channels.webp', stops: [
          { x: 50, y: 50, scale: 1, title: 'One system, five areas', text: 'Every screen sits under one of five groups in the side menu.' },
          { x: 7, y: 45, scale: 2.4, title: 'Grouped by job', text: 'The menu is grouped by who does the work, not by how the data is stored.' },
          { x: 50, y: 22, scale: 2.2, title: 'Problems first', text: 'Sync health, inbound bookings and rate parity sit at the top, so issues get seen.' },
          { x: 75, y: 64, scale: 2.4, title: 'A clear next step', text: 'A failed connection says what broke and gives one button to fix it.' },
        ] },
      },
      {
        id: 'connect', step: 'Connected modules', kicker: '03 · Connect it', title: 'One action updates every place that needs it',
        body: ['The brief asked for every module to be connected, so nothing gets typed twice. A booking fills the room calendar. A restaurant order from a QR code lands in the kitchen and gets charged to the guest\'s room bill.',
               'The room calendar shows a whole month, so staff can pick a free room and dates straight from it.'],
        media: { kind: 'cover', label: 'ChatGrow · Room calendar', src: '/work/chatgrow/calendar.webp', ratio: '2400 / 1559', caption: 'Month view. Pick a free room and date range straight from the calendar.' },
      },
      {
        id: 'qr', step: 'QR ordering', kicker: '04 · The guest side', title: 'Order from the table, charge it to the room',
        body: ['Guests scan a QR code at the table, order from their phone and choose to pay by card or charge it to their room. The order goes straight to the kitchen, and the guest can watch it move from received to served.'],
        media: { kind: 'cover', label: 'ChatGrow · QR ordering', src: '/work/chatgrow/qr-ordering.webp', ratio: '2400 / 1559', caption: 'Menu, order and live status, all from the guest\'s phone.' },
      },
      {
        id: 'states', step: 'Every state', kicker: '05 · Every state', title: 'Plan for when things go wrong',
        body: ['Real systems spend a lot of time in odd states. I designed them too: empty, loading, error, saved and no permission. If a front desk worker opens settings they can\'t change, the screen tells them why and how to ask for access, instead of a blank page.',
               'Everything matched the existing UI exactly, same type sizes and the same system, so my screens sit next to the designer\'s without a seam.'],
        media: { kind: 'cover', label: 'ChatGrow · No permission state', src: '/work/chatgrow/no-permission.webp', ratio: '2400 / 1559', caption: 'No permission: what happened, why, and what to do next.' },
      },
      {
        id: 'result', step: 'What I took away', kicker: '06 · What I took away', title: 'Good information design is mostly sorting',
        body: ['Most of the work here didn\'t show up as pretty screens. It was deciding what belongs together, what comes first and what each person actually needs to see. It\'s the same thinking I use on every product, just with a lot more data.'],
      },
    ],
    results: {
      head: 'Five clear areas instead of one long list',
      lede: 'Most of this work doesn\'t show up as pretty screens. It shows up as staff finding what they need in a few seconds.',
      stats: [
        { n: '5', count: 5, label: 'Areas in the menu', note: 'Grouped by who does the work, not by how the data is stored.' },
        { n: '5', count: 5, label: 'States per screen', note: 'Empty, loading, error, saved and no permission. No blank pages.' },
        { n: '1', count: 1, label: 'Place to type each thing', note: 'A booking fills the calendar. A QR order lands in the kitchen and on the room bill.' },
      ],
    },
  },
];

export const storyBySlug = (s: string) => stories.find(x => x.slug === s);
