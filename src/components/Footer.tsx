import Link from "next/link";
import { HeartDoodle } from "./Doodles";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[var(--ink)] text-[var(--cream)] mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-xl font-semibold text-[var(--orange)]">
            Effective Learning
          </p>
          <p className="font-display text-lg -mt-1">Preschool & Aftercare Institute</p>
          <p className="text-sm opacity-75 mt-3 leading-relaxed">
            A warm, safe place where little learners build big confidence — every single day.
          </p>
        </div>

        <div>
          <p className="font-bold text-sm uppercase tracking-wide text-[var(--sky)] mb-3">
            Visit or Call
          </p>
          <ul className="text-sm space-y-2 opacity-90">
            <li>123 Learning Lane, Your Town</li>
            <li>effectivelearningabaco@gmail.com</li>
            <li>Mon–Fri · 7:30 AM – 5:00 PM</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-sm uppercase tracking-wide text-[var(--sky)] mb-3">
            Quick Links
          </p>
          <ul className="text-sm space-y-2 opacity-90">
            <li><Link href="/#programs" className="hover:text-[var(--orange)]">Programs</Link></li>
            <li><Link href="/#requirements" className="hover:text-[var(--orange)]">What to Bring</Link></li>
            <li><Link href="/#fees" className="hover:text-[var(--orange)]">Fees & Payment</Link></li>
            <li><Link href="/register" className="hover:text-[var(--orange)]">Register Your Child</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 px-5 text-center text-xs opacity-60 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1.5">
        <span className="flex items-center gap-1.5">
          Made with <HeartDoodle className="w-4 h-4 inline" color="#F4A8C6" /> for our little learners
        </span>
        <span className="hidden sm:inline opacity-40">·</span>
        <Link href="/admin" className="hover:text-[var(--orange)] underline underline-offset-2">
          Staff Login
        </Link>
      </div>
    </footer>
  );
}