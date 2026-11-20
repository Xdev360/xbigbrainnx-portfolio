// One entry per project. Drop media into /public/work/<slug>/ and set the paths.
// Until a path is set, the site shows a clean placeholder slot of the right size.

export type Project = {
  slug: string;
  name: string;
  short: string;          // one line, used on cards and the hero
  role: string;
  useCase: string;
  kind: 'client' | 'own';
  tags: ('product' | 'team-tools' | 'brand' | 'mascots' | 'own')[];
  color: string;          // CSS var name
  year?: string;
  live?: string;
  cover?: string;         // 16:10, /work/<slug>/cover.webp
  reel?: string;          // hero video, /work/<slug>/reel.mp4 (muted, 6 to 8s loop)
  published: boolean;     // has a full case study page
};

export const projects: Project[] = [
  {
    slug: 'virelle',
    name: 'Virelle Wellness Hub',
    short: 'A wellness store in Lagos and Abuja with an AI product finder, and the CRM its staff run it on.',
    role: 'Design + build',
    useCase: 'Store + CRM',
    kind: 'client',
    tags: ['product', 'team-tools', 'brand'],
    color: '--project-virelle',
    year: '2026',
    published: true,
  },
  {
    slug: 'mylo',
    name: 'Mylo',
    short: 'A goal app for people who do better together. Day-10 retention 30% to 70% after the mascot.',
    role: 'Product + mascot',
    useCase: 'Mobile app',
    kind: 'own',
    tags: ['product', 'mascots', 'own'],
    color: '--project-mylo',
    published: true,
  },
  {
    slug: 'goalden',
    name: 'Goalden',
    short: 'A goal app that breaks the year into today. Version 2 is built around coach characters.',
    role: 'Brand, web, app',
    useCase: 'Goal planning',
    kind: 'own',
    tags: ['product', 'mascots', 'brand', 'own'],
    color: '--project-mylo',
    published: true,
  },
  {
    slug: 'wintech-templates',
    name: 'Wintech Templates',
    short: 'Business sites owners launch in an afternoon, and the editor to change them.',
    role: 'Design + build',
    useCase: 'Sites + editor',
    kind: 'own',
    tags: ['product', 'team-tools', 'own'],
    color: '--project-wintech',
    live: 'https://wintechstudio.com',
    published: false,
  },
  {
    slug: 'virelle-brand',
    name: 'Virelle brand and launch',
    short: 'Identity, packaging and the launch campaign for the same product.',
    role: 'Brand',
    useCase: 'Identity + launch',
    kind: 'client',
    tags: ['brand'],
    color: '--project-virelle',
    published: false,
  },
];

export const caseHref = (p: Project) => p.published ? `/work/${p.slug}` : '/work';
export const heroReel = projects.filter(p => ['virelle', 'mylo', 'wintech-templates'].includes(p.slug));
