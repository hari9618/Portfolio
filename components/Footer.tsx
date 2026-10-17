import { nav, profile } from "@/lib/content";
import { GithubIcon, HfIcon, LinkedinIcon, Logo } from "./BrandIcons";
import { IntroControls } from "./SoundToggle";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] pb-10 pt-16">
      <div className="page">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-[15px] font-semibold">{profile.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
              AI Engineer building multi-agent systems, hybrid RAG, automations and LLM-Ops that hold up in production.
              Based in {profile.location}, working with teams anywhere.
            </p>
            <div className="mt-6 flex gap-2">
              {[
                { href: profile.linkedin, I: LinkedinIcon, l: "LinkedIn" },
                { href: profile.github, I: GithubIcon, l: "GitHub" },
                { href: profile.huggingface, I: HfIcon, l: "Hugging Face" },
              ].map(({ href, I, l }) => (
                <a key={l} href={href} target="_blank" rel="noreferrer" aria-label={l} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:text-white">
                  <I />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow-muted mb-4">Explore</p>
            <ul className="space-y-2.5 text-[14px]">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-white/60 transition hover:text-white">{n.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow-muted mb-4">Contact</p>
            <ul className="space-y-2.5 text-[14px] text-white/60">
              <li><a href={`mailto:${profile.email}`} className="transition hover:text-white">{profile.email}</a></li>
              <li><a href={profile.phoneHref} className="transition hover:text-white">{profile.phone}</a></li>
              <li><a href={profile.whatsapp} target="_blank" rel="noreferrer" className="transition hover:text-white">WhatsApp</a></li>
              <li><a href={profile.resume} download className="transition hover:text-white">Résumé (PDF)</a></li>
              <li>{profile.location} · IST</li>
            </ul>
          </div>
        </div>
        <div className="mt-12">
          <IntroControls />
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 font-mono text-[11px] text-white/35 sm:flex-row">
          <span>© {new Date().getFullYear()} {profile.name}. Built with Next.js, Tailwind &amp; Framer Motion.</span>
          <span>Every claim on this page is backed by a repo.</span>
        </div>
      </div>
      <div className="pointer-events-none mt-10 select-none overflow-hidden text-center">
        <span className="serif-i block bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-[22vw] leading-[0.8] text-transparent">Hari Krishna</span>
      </div>
    </footer>
  );
}
