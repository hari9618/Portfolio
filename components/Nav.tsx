"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, profile } from "@/lib/content";
import { useIntro } from "@/lib/intro";
import { GithubIcon, Logo } from "./BrandIcons";

export function Nav() {
  const { entered } = useIntro();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0, filter: "blur(10px)" }}
      animate={entered ? { y: 0, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } } : { y: -28, opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-3 z-50 px-3 sm:top-5"
    >
      <nav
        className={`mx-auto flex max-w-[1020px] items-center justify-between rounded-full border px-3 py-2 pl-4 transition-all duration-500 ${
          scrolled ? "border-white/[0.12] bg-black/60 backdrop-blur-xl" : "border-white/[0.09] bg-black/25 backdrop-blur-md"
        }`}
        style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)" }}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">Hari Krishna</span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex xl:gap-7">
          {nav.map((n) => (
            <li key={n.href}>
              <a href={n.href} className="text-[13.5px] font-medium text-white/65 transition-colors hover:text-white">
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-white sm:grid"
          >
            <GithubIcon />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/5 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-2 max-w-[1020px] rounded-3xl border border-white/10 bg-black/80 p-3 backdrop-blur-xl lg:hidden"
          >
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
