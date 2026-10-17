"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { services } from "@/lib/content";
import { SectionHead } from "./Reveal";
import { Tilt } from "./Tilt";

export function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="page">
        <SectionHead
          eyebrow="Services & expertise"
          title={<>What I ship</>}
          aside={
            <a href="#contact" className="inline-flex items-center gap-1.5 text-[15px] text-white/55 transition hover:text-white">
              Start a project <ArrowRight className="h-4 w-4" />
            </a>
          }
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Tilt key={s.id} className="h-full">
            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#0a0a0b] transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-white/[0.2]"
              style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 30px 60px -40px rgb(0 0 0 / 0.9)" }}
            >
              <div className="relative h-[210px] overflow-hidden">
                <img
                  src={s.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#0a0a0b]" />
              </div>
              <div className="flex flex-1 flex-col px-8 pb-9 pt-7">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/55">{s.tag}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white/80 transition-all duration-300 group-hover:rotate-45 group-hover:border-white/60 group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="text-[1.6rem] font-medium leading-tight tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-white/60">{s.body}</p>
              </div>
            </motion.a>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}
