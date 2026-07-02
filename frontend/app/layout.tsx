import type { Metadata } from "next";
import { Space_Grotesk, Inter, Geist_Mono } from "next/font/google";
import Link from 'next/link';

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stackd — Global Startup Ecosystem Aggregator",
  description: "One place for everything happening in the global startup ecosystem. Aggregated funding news, accelerator cohorts, investor directories, startup jobs, and product launches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable} h-full antialiased dark font-sans`}>
      <body className="font-sans min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-55 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Brand Logo */}
              <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 hover:opacity-85 transition-opacity">
                Stackd
              </Link>
              
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/news" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                  News
                </Link>
                <Link href="/funding" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                  Funding
                </Link>
                <Link href="/launches" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                  Launches
                </Link>
                <Link href="/cohorts" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                  Cohorts
                </Link>
                <Link href="/jobs" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                  Jobs
                </Link>
                <Link href="/investors" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                  Investors
                </Link>
                <Link href="/startups" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                  Startups
                </Link>
              </nav>
            </div>
            
            {/* Right side helper info */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Rayan9064/Stackd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 font-semibold transition-colors"
              >
                Submit PR
              </a>
            </div>
          </div>
          
          {/* Mobile Navigation bar */}
          <div className="flex md:hidden items-center justify-around h-10 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs overflow-x-auto whitespace-nowrap">
            <Link href="/news" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1">
              News
            </Link>
            <Link href="/funding" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1">
              Funding
            </Link>
            <Link href="/launches" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1">
              Launches
            </Link>
            <Link href="/cohorts" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1">
              Cohorts
            </Link>
            <Link href="/jobs" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1">
              Jobs
            </Link>
            <Link href="/investors" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1">
              Investors
            </Link>
            <Link href="/startups" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1">
              Startups
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 py-6 text-zinc-500 dark:text-zinc-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p>© {new Date().getFullYear()} Stackd. MIT License.</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                Aggregator only. All content attributes and links back to the original source.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com/Rayan9064/Stackd" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                GitHub Repo
              </a>
              <Link href="/funding" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Funding Rounds
              </Link>
              <Link href="/cohorts" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Accelerator List
              </Link>
              <Link href="/investors" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Investor Directory
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
