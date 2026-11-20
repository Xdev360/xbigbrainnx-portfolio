// Case studies as stories: the problem, version 1, what we learned, the redesign, the result.
// Only facts Oladele has stated. Anything still to come is marked `todo` and shows as a quiet note.

export type Media =
  | { kind: 'compare'; before: string; after: string; beforeSrc?: string; afterSrc?: string; caption?: string }
  | { kind: 'cover'; label: string; src?: string; caption?: string; ratio?: string }
  | { kind: 'pair'; items: { label: string; src?: string }[]; caption?: string };

export type Chapter = {
  id: string;
  step: string;            // shown in the side progress list
  kicker: string;          // small label above the heading
  title: string;
  body: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  note?: string;           // spectrum note box
  media?: Media;
  todo?: string;
};

export type Story = {
  slug: string;
  label: string;
  title: string;           // use \n for the two lines
  subtitle: string;
  facts: [string, string][];
  arc: { v: string; t: string }[];   // the 4-step arc shown under the header
  chapters: Chapter[];
  results: { n: string; count?: number; suffix?: string; label: string }[];
  resultsNote?: string;
};

export const stories: Story[] = [
  {
    slug: 'virelle',
    label: 'Case study · Client',
    title: 'A store people trust,\nand the CRM behind it',
    subtitle: 'Virelle Wellness Hub sells supplements, skincare, fragrance and whole foods in Lagos and Abuja. I took it from a fast first version to a store and back office the team can actually run.',
    facts: [['Role', 'Design + build'], ['Surfaces', 'Store, CRM, brand'], ['Team', 'Founder + 2 staff'], ['Launched', 'November 2026']],
    arc: [{ v: 'V1', t: 'Built fast to test' }, { v: 'Learn', t: 'What broke' }, { v: 'V2', t: 'Designed properly' }, { v: 'Ship', t: 'Live and measured' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'Buying wellness products in Lagos is a gamble',
        body: ['People here buy supplements and skincare from Instagram vendors. The founder heard the same five complaints over and over, and Virelle had to fix every one of them.'],
        list: ['Fake products, which is a real health risk', 'Expired stock nobody warns you about', 'Delivery dates that are a guess', 'Delivery costs that stack when you buy from several vendors', 'Nobody replies at night when you have a question'],
        note: 'Build one store people can trust with their health, and one place for three staff to run it.',
      },
      {
        id: 'v1', step: 'Version 1', kicker: '02 · Version 1', title: 'Ship first, then design it properly',
        body: ['We needed real customers before we spent weeks in Figma. So the first version was built fast, straight in code, to test the store, the checkout and the delivery promise with real orders.',
               'It worked as a test. It did not work as a product people would come back to.'],
        media: { kind: 'cover', label: 'Version 1 · the first live store', caption: 'The first version, built fast to learn from real orders.' },
      },
      {
        id: 'learn', step: 'What broke', kicker: '03 · What we learned', title: 'Fast got us live. It also showed every crack',
        body: ['Once real people used it, the problems were easy to see. The founder and the team sent notes, and they all pointed the same way.'],
        list: ['Margins and spacing were off from page to page', 'Product images were cropped in odd ways, so the cards looked messy', 'Too much white and green. Every category looked the same', 'Staff ran orders from chats and notes, with no single place to see everything'],
      },
      {
        id: 'redesign', step: 'The redesign', kicker: '04 · The redesign', title: 'Rebuild it in Figma, then fix it on purpose',
        body: ['I recreated the live store and the CRM in Figma exactly as they were, then corrected them screen by screen. Light and dark, desktop and mobile, customer side and team side in one file.',
               'The biggest change was colour. Health purchases make people anxious, so the store moved to calm, cool shades, with one colour per category so people can scan the shelf the way they would in a real shop. Green stays as the brand colour because it reads as health and trust. The team picked this palette, called Clear Water, from two options.'],
        list: ['An expiry date on every product, so nobody buys expired stock', 'One clear delivery promise: 5 to 7 working days, stated before checkout', 'Vira, an AI product finder that answers any time, even at night, and adds products to the bag', 'Member discounts shown in the bag only, so product cards stay clean'],
        media: { kind: 'compare', before: 'Version 1', after: 'Version 2', caption: 'Drag to compare the first version with the redesign.' },
      },
      {
        id: 'team', step: 'The team side', kicker: '05 · The team side', title: 'One CRM for three people with three jobs',
        body: ['Behind the store is a CRM, in light and dark, built for exactly three logins. Each person sees what their job needs and nothing else.'],
        table: { head: ['Role', 'What they can do'], rows: [['Founder', 'Everything, and the only one who can change bank details'], ['Developer', 'Sends invites, sees activity logs, limited access'], ['Orders', 'Orders only']] },
        list: ['Lagos and Abuja run as separate delivery queues', 'Staff can add walk-in orders by hand and book a courier for them', 'The courier wallet balance is visible to everyone', 'Bookkeeping in one place: profits, deliveries and fees'],
        media: { kind: 'pair', items: [{ label: 'CRM · Today' }, { label: 'CRM · Mobile' }] },
      },
      {
        id: 'result', step: 'The result', kicker: '06 · The result', title: 'Live, and measured from day one',
        body: ['Virelle Wellness Hub launched in November 2026. I am tracking two numbers: how often customers come back, and how long each task takes the team.'],
        todo: 'Add the first real numbers here once they are in.',
      },
    ],
    results: [{ n: 'Nov 2026', label: 'Launched' }, { n: '3', count: 3, label: 'Staff roles, one CRM' }, { n: '2', count: 2, label: 'Cities, separate delivery queues' }],
  },
  {
    slug: 'mylo',
    label: 'Case study · Own product',
    title: 'From a goal app people left\nto one they come back to',
    subtitle: 'Mylo is a goal app for people who do better together. The first version lost people fast. A mascot changed that.',
    facts: [['Role', 'Product, mascot, build'], ['Surfaces', 'Mobile app, web'], ['Type', 'Own product'], ['Result', 'Day-10 retention 30% to 70%']],
    arc: [{ v: 'V1', t: 'Features, no feeling' }, { v: 'Learn', t: 'People left' }, { v: 'V2', t: 'Mylo arrives' }, { v: 'Ship', t: '30% to 70%' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'Goals are easier when someone is watching',
        body: ['Most people quit their goals quietly. Mylo is built on a simple idea: you stick with things longer when your friends can see you trying.'],
      },
      {
        id: 'v1', step: 'Version 1', kicker: '02 · Version 1', title: 'Everything worked. Nobody stayed',
        body: ['The first version had the features: goals, check-ins, groups. Retention was low. By day 10, only 30% of people were still coming back.'],
        media: { kind: 'cover', label: 'Mylo · version 1', caption: 'Version 1. It did the job, but it gave people no reason to return.' },
      },
      {
        id: 'redesign', step: 'The mascot', kicker: '03 · The change', title: 'Give the app someone to care about',
        body: ['I designed Mylo, a mascot that lives in the app and reacts to what you and your group do. It cheers when you check in, nudges when you go quiet and celebrates streaks with the group.',
               'I animated the reactions in Rive, so they respond in real time instead of playing a fixed loop.'],
        media: { kind: 'compare', before: 'Before Mylo', after: 'With Mylo', caption: 'Drag to compare the app before and after the mascot.' },
      },
      {
        id: 'result', step: 'The result', kicker: '04 · The result', title: 'Day-10 retention went from 30% to 70%',
        body: ['After Mylo arrived, more than twice as many people were still using the app on day 10.'],
      },
    ],
    results: [{ n: '30%', count: 30, suffix: '%', label: 'Day 10, before' }, { n: '70%', count: 70, suffix: '%', label: 'Day 10, after' }],
  },
  {
    slug: 'goalden',
    label: 'Case study · Own product',
    title: 'Most testers drifted.\nVersion 2 gives them coaches',
    subtitle: 'Goalden breaks a year into quarters, months, weeks and days. I did the brand, the website and the app, and rebuilt it after the first test.',
    facts: [['Role', 'Brand, web, app'], ['Stage', 'Testing V2'], ['Stack', 'Next.js, Supabase'], ['Testers', 'About 100 on V1']],
    arc: [{ v: 'V1', t: 'Goal cascade' }, { v: 'Learn', t: 'Testers drifted' }, { v: 'V2', t: 'Coach characters' }, { v: 'Ship', t: 'Testing now' }],
    chapters: [
      {
        id: 'problem', step: 'The problem', kicker: '01 · The problem', title: 'Big goals die between January and February',
        body: ['People set a goal for the year and lose it within weeks. Goalden cascades it down: yearly, quarterly, monthly, weekly, then today.'],
      },
      {
        id: 'v1', step: 'Version 1', kicker: '02 · Version 1', title: 'A clean planner that people forgot about',
        body: ['Version 1 went to about 100 testers. Most of them did not stick with it. When I looked at why, it came back to the design: it planned well, but it never pulled people back in.'],
        media: { kind: 'cover', label: 'Goalden · version 1', caption: 'Version 1, tested with about 100 people.' },
      },
      {
        id: 'redesign', step: 'Version 2', kicker: '03 · Version 2', title: 'Coaches that check in, each with a personality',
        body: ['Version 2 is built around coach characters: career, fitness, finance, relationship, reflection, productivity, mindfulness and spirituality. Each has its own personality and body type, and they check in and give advice.',
               'Duolingo is the inspiration here. Their characters are a big part of why people keep coming back.'],
        media: { kind: 'compare', before: 'Version 1', after: 'Version 2', caption: 'Drag to compare version 1 with the coach-led version 2.' },
      },
      {
        id: 'result', step: 'Where it is now', kicker: '04 · Where it is now', title: 'In testing',
        body: ['Version 2 is in testing now. I will share what changed once the numbers are in.'],
        todo: 'Add V2 test results when ready.',
      },
    ],
    results: [{ n: '100', count: 100, label: 'Testers on V1' }, { n: '8', count: 8, label: 'Coach characters in V2' }],
  },
];

export const storyBySlug = (s: string) => stories.find(x => x.slug === s);
