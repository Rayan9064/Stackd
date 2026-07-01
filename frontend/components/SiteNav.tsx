'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/news', label: 'News' },
  { href: '/funding', label: 'Funding' },
  { href: '/launches', label: 'Launches' },
  { href: '/cohorts', label: 'Cohorts' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/investors', label: 'Investors' },
  { href: '/startups', label: 'Startups' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SiteNavProps {
  mobile?: boolean;
}

export default function SiteNav({ mobile = false }: SiteNavProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <div className="md:hidden border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
        <nav className="flex h-11 items-center gap-1 overflow-x-auto px-3 text-xs whitespace-nowrap">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'rounded-md px-3 py-1.5 font-medium transition-colors',
                  active
                    ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={[
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
            ].join(' ')}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
