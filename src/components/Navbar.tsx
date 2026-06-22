"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#team", label: "Our Team" },
  { href: "/#programs", label: "Programs" },
  { href: "/#requirements", label: "What to Bring" },
  { href: "/#fees", label: "Fees" },
  { href: "/#policy", label: "Policy" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--cream)]/95 backdrop-blur-sm border-b-2 border-[var(--ink)]/10">
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-lg sm:text-xl font-semibold tracking-tight">
          <span className="text-[var(--orange-dark)]">Effective Learning</span>{" "}
          <span className="text-[var(--ink)]">Preschool</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-6 text-sm font-bold">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-[var(--orange-dark)] transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/register"
          className="hidden lg:inline-flex items-center justify-center bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors crayon-shadow"
        >
          Register Now
        </Link>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--ink)]/5"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t-2 border-[var(--ink)]/10 px-5 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-bold py-1.5"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="mt-2 inline-flex items-center justify-center bg-[var(--orange)] text-white font-bold text-sm px-5 py-3 rounded-full"
            onClick={() => setOpen(false)}
          >
            Register Now
          </Link>
        </div>
      )}
    </header>
  );
}