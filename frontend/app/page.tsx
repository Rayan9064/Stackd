import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  Code2,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  Mail,
  Network,
  Newspaper,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import DigestSignup from '@/components/DigestSignup';

const productLinks = [
  { href: '/news', label: 'News' },
  { href: '/funding', label: 'Funding' },
  { href: '/launches', label: 'Launches' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/cohorts', label: 'Cohorts' },
  { href: '/investors', label: 'Investors' },
  { href: '/startups', label: 'Startups' },
];

const scatteredSources = [
  'Crunchbase',
  'Inc42',
  'YourStory',
  'TechCrunch',
  'YC',
  'Surge',
  'Antler',
  'Wellfound',
  'LinkedIn',
  'Hacker News',
  'Product Hunt',
  'Reddit',
  'GitHub',
  'Newsletters',
  'VC websites',
];

const liveFeatures = [
  {
    icon: Newspaper,
    title: 'Startup News Feed',
    description: 'Inc42, YourStory, TechCrunch, Economic Times, HN, and global startup publications in one feed.',
    href: '/news',
  },
  {
    icon: TrendingUp,
    title: 'Funding Rounds Tracker',
    description: 'Recent raises, stages, sectors, and investor signals with every item linked to the source.',
    href: '/funding',
  },
  {
    icon: Rocket,
    title: 'Product Launches',
    description: 'Product Hunt, Hacker News Show HN, and launch signals surfaced in one clean view.',
    href: '/launches',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Startup Jobs Board',
    description: 'Jobs from YC companies, funded startups, and ecosystem companies, filterable by role and region.',
    href: '/jobs',
  },
  {
    icon: Building2,
    title: 'Accelerator Directory',
    description: 'Active cohorts, deadlines, investment details, and direct application links.',
    href: '/cohorts',
  },
  {
    icon: Users,
    title: 'Investor Directory',
    description: 'VCs and angels with thesis, cheque size, sectors, geography, and portfolio links.',
    href: '/investors',
  },
  {
    icon: Database,
    title: 'Startup Directory',
    description: 'Browsable startup profiles with sector, stage, location, funding, and source attribution.',
    href: '/startups',
  },
  {
    icon: GitBranch,
    title: 'GitHub Trending',
    description: 'Open-source repos and tools relevant to startup builders and developer ecosystems.',
    href: '/news',
  },
  {
    icon: Search,
    title: 'Global Search',
    description: 'Search news, jobs, startups, investors, cohorts, and launches from one query surface.',
    href: '/news',
  },
  {
    icon: Mail,
    title: 'Weekly Digest',
    description: 'Top ecosystem updates delivered to your inbox. Free subscription, original links included.',
    href: '#digest',
  },
];

const phaseTwo = [
  'Social momentum score',
  'Hiring velocity signal',
  'Trending topics and themes',
  'Viral founder posts',
  'Reddit thread surfacing',
  'Investor activity feed',
  'Thesis matcher',
  'Grant and fellowship database',
  'Public API',
];

const phaseThree = [
  'Queryable ecosystem intelligence',
  'Entity-resolved company profiles',
  'Estimated ARR and MRR ranges',
  'Tech stack detection',
  'Policy and market-entry intelligence',
  'Fund activity heatmaps',
  'Co-founder matching',
  'Embeddable startup cards',
];

const personas = [
  {
    icon: Rocket,
    title: 'Founders',
    description: 'Find accelerators, track competitors, discover investors, and see what is trending in your category.',
  },
  {
    icon: TrendingUp,
    title: 'Investors',
    description: 'Discover startups before they raise by tracking momentum, hiring, launches, and ecosystem buzz.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Job Seekers',
    description: 'Find startup jobs across the ecosystem in one search, filtered by stage, role, location, and remote.',
  },
  {
    icon: Globe2,
    title: 'Ecosystem Operators',
    description: 'Accelerators, incubators, and public agencies can understand their ecosystem in real time.',
  },
  {
    icon: Code2,
    title: 'Developers',
    description: 'Use open data, public APIs, and MIT-licensed code to build new ecosystem tools on top of Stackd.',
  },
];

const comparisons = [
  ['Startup database', 'Crunchbase', '$49/mo to enterprise', 'Free, open source'],
  ['Pre-raise signal detection', 'Harmonic', '$10K to $30K/yr', 'Free social signals'],
  ['Institutional deal flow', 'PitchBook', '$25K to $70K/yr', '$99 to $499/mo coming'],
  ['India ecosystem depth', 'Tracxn', '$999/yr, often stale', 'Free, real-time'],
  ['Accelerator discovery', '20 separate websites', 'Your time', 'One directory'],
  ['Startup jobs', 'AngelList, LinkedIn, career pages', 'Your time', 'One search'],
];

const heroSignals = [
  { tag: 'Funding signal', title: 'AI infrastructure startup raises seed round', region: 'EU', icon: TrendingUp },
  { tag: 'Hiring velocity', title: 'Remote engineering roles opened this week', region: 'Global', icon: BriefcaseBusiness },
  { tag: 'Launch momentum', title: 'Show HN product crosses 1,400 upvotes', region: 'HN', icon: Rocket },
  { tag: 'Investor thesis', title: 'Deeptech seed funds active in India', region: 'India', icon: Users },
];

const visionCards = [
  { icon: Globe2, title: 'Global coverage', copy: 'Track major startup hubs without switching tabs.' },
  { icon: Zap, title: 'India-deep signals', copy: 'Make pre-seed Indian startups discoverable from day one.' },
  { icon: ShieldCheck, title: 'Source-attributed', copy: 'Every data point links back to where it came from.' },
];

const roadmapSections = [
  { phase: 'Phase 2', title: 'Intelligence Layer', items: phaseTwo, icon: Activity },
  { phase: 'Phase 3', title: 'Ecosystem Intelligence Engine', items: phaseThree, icon: Layers3 },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-300 shadow-sm">
      <Sparkles size={13} className="text-cyan-300" />
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="-mx-4 -my-8 overflow-hidden bg-zinc-950 text-zinc-50 sm:-mx-6 lg:-mx-8">
      <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <SectionLabel>Open-source startup ecosystem intelligence</SectionLabel>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
                One intelligent layer over the startup world.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                Stackd is a free, open-source intelligence platform for founders, investors, job seekers, and ecosystem operators. It brings startup news, funding rounds, jobs, accelerators, investors, launches, and GitHub signals into one sourced, queryable picture.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/news"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
              >
                Explore the ecosystem
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://github.com/Rayan9064/Stackd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/70 px-5 text-sm font-bold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
              >
                Star on GitHub
                <GitBranch size={16} />
              </a>
            </div>
            <div className="grid max-w-2xl grid-cols-3 gap-3 pt-2">
              {[
                ['181+', 'news items seeded'],
                ['30+', 'launches indexed'],
                ['MIT', 'open source'],
              ].map(([metric, label]) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="text-xl font-black text-white">{metric}</div>
                  <div className="mt-1 text-xs text-zinc-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 shadow-2xl shadow-cyan-950/30">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-zinc-500">stackd intelligence graph</span>
                </div>
                <div className="grid gap-3 p-4">
                  {heroSignals.map(({ tag, title, region, icon: Icon }) => (
                    <div key={title} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                          <Icon size={14} />
                          {tag}
                        </div>
                        <span className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">{region}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full w-2/3 rounded-full bg-cyan-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-zinc-950 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <Network size={16} />
            Fragmented across 50+ platforms
          </div>
          <div className="flex flex-wrap gap-2">
            {scatteredSources.map((source) => (
              <span key={source} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                {source}
              </span>
            ))}
            <span className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-3 py-2 text-sm font-bold text-cyan-200">
              Stackd brings them together
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" id="features">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4">
            <SectionLabel>Available now</SectionLabel>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">A working product, not a waitlist.</h2>
            <p className="text-zinc-400">
              Stackd already aggregates startup ecosystem signals across product routes, with original source links preserved on every card.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {liveFeatures.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-zinc-900"
              >
                <Icon size={22} className="text-cyan-300" />
                <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-400">{description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-zinc-300 group-hover:text-cyan-200">
                  Open
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-900/40 px-4 py-16 sm:px-6 lg:px-8" id="vision">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <SectionLabel>The vision</SectionLabel>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Global-first. India-deep. Open from day one.</h2>
            <p className="leading-7 text-zinc-400">
              We are building what intelligence platforms did for governments, but for the startup ecosystem: a single sourced layer where startups, investors, accelerators, jobs, funding, policy signals, GitHub activity, and market momentum resolve into one picture.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {visionCards.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                <Icon size={24} className="text-emerald-300" />
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" id="roadmap">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4">
            <SectionLabel>What is next</SectionLabel>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">From aggregator to intelligence engine.</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {roadmapSections.map(({ phase, title, items, icon: Icon }) => (
              <div key={phase} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">{phase}</div>
                    <h3 className="font-bold text-white">{title}</h3>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {items.map((item) => (
                    <div key={item} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-900/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4">
            <SectionLabel>Who it is for</SectionLabel>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Built for the whole ecosystem.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {personas.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                <Icon size={22} className="text-cyan-300" />
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4">
            <SectionLabel>Why Stackd</SectionLabel>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Startup intelligence should not live behind a $70K paywall.</h2>
          </div>
          <div className="mt-10 overflow-hidden rounded-xl border border-zinc-800">
            <div className="grid grid-cols-4 bg-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">
              <div>What you need</div>
              <div>Current options</div>
              <div>Cost</div>
              <div className="text-cyan-200">Stackd</div>
            </div>
            {comparisons.map(([need, options, cost, stackd]) => (
              <div key={need} className="grid grid-cols-1 gap-2 border-t border-zinc-800 px-4 py-4 text-sm text-zinc-300 sm:grid-cols-4">
                <div className="font-semibold text-white">{need}</div>
                <div>{options}</div>
                <div>{cost}</div>
                <div className="font-semibold text-cyan-200">{stackd}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" id="digest">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8">
            <SectionLabel>Open source</SectionLabel>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white">MIT licensed. Built in public.</h2>
            <p className="mt-4 leading-7 text-zinc-400">
              Stackd is a public-good data layer for the startup ecosystem. Contribute data, improve fetchers, build on the API, or fork the project.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://github.com/Rayan9064/Stackd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
              >
                View GitHub repo
                <GitBranch size={15} />
              </a>
              <Link
                href="/news"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 text-sm font-bold text-zinc-100 transition hover:border-zinc-500"
              >
                Explore live data
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-200">
              <Bell size={16} />
              Weekly ecosystem digest
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Get the top 10 ecosystem updates from Stackd in your inbox. Free, source-linked, and focused on signal.
            </p>
            <div className="mt-6">
              <DigestSignup />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900 px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black text-white sm:text-3xl">Stop stitching together 15 tabs every morning.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Open Stackd and see the startup ecosystem as one living intelligence layer.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/news" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-black text-zinc-950 transition hover:bg-cyan-200">
            Start exploring
            <ArrowRight size={16} />
          </Link>
          <a href="https://github.com/Rayan9064/Stackd" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-5 text-sm font-bold text-zinc-100 transition hover:border-zinc-500">
            Contribute on GitHub
            <Code2 size={16} />
          </a>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {productLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
