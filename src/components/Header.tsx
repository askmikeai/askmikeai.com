"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "What I Build", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-pink-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3 group">
              {/* Logo Mark */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 via-coral-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-pink-500/40 transition-shadow">
                <span className="text-white font-display text-xl tracking-tight">M</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
              </div>
              {/* Logo Text */}
              <div className="flex flex-col leading-none">
                <span className="text-xs font-semibold text-gray-500 tracking-widest">ASK</span>
                <span className="text-xl font-display tracking-wide bg-gradient-to-r from-pink-600 to-coral-600 bg-clip-text text-transparent">
                  MIKE<span className="text-teal-600">AI</span>
                </span>
              </div>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
          <div className="hidden lg:flex lg:items-center lg:gap-x-9">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                    active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-2 left-0 h-0.5 w-full origin-left rounded-full bg-gradient-to-r from-pink-600 to-coral-600 transition-transform duration-300 ease-out ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              href="/pledge"
              className="rounded-full bg-gradient-to-r from-pink-600 to-coral-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 hover:scale-105 transition-all"
            >
              Back the Build
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-pink-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/pledge"
                className="block rounded-full bg-gradient-to-r from-pink-600 to-coral-600 px-3 py-2 text-base font-medium text-white text-center mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Back the Build
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
