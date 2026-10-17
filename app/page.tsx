import { Banner } from "@/components/Banner";
import { BrowserAutomation } from "@/components/BrowserAutomation";
import { Contact } from "@/components/Contact";
import { Engage } from "@/components/Engage";
import { Experience } from "@/components/Experience";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { CinematicIntro } from "@/components/intro/CinematicIntro";
import { LiveRun } from "@/components/LiveRun";
import { Marquee } from "@/components/Marquee";
import { Nav } from "@/components/Nav";
import { Observability } from "@/components/Observability";
import { Principles } from "@/components/Principles";
import { Process } from "@/components/Process";
import { QuickMath } from "@/components/QuickMath";
import { Services } from "@/components/Services";
import { Stack } from "@/components/Stack";
import { Statement } from "@/components/Statement";
import { Stats } from "@/components/Stats";
import { Websites } from "@/components/Websites";
import { Work } from "@/components/Work";
import { IntroProvider } from "@/lib/intro";

export default function Home() {
  return (
    <IntroProvider>
      <CinematicIntro />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Statement />
        <Services />
        <Observability />
        <BrowserAutomation />
        <Websites />
        <LiveRun />
        <Process />
        <Work />
        <Stats />
        <Principles />
        <Banner />
        <Experience />
        <Stack />
        <Engage />
        <QuickMath />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </IntroProvider>
  );
}
