"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "30%"]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const searchY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);

  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handlePlanTrip = () => {
    if (!searchQuery.trim()) return;
    router.push(`/planner?destination=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <main ref={containerRef} className="relative min-h-screen bg-background font-sans text-foreground flex flex-col items-center overflow-x-hidden noise">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="flex gap-12 items-center">
          <span className="text-2xl font-black tracking-tighter uppercase italic">TravelAI.</span>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary">
            <Link href="#" className="hover:text-foreground transition-all duration-300">Produce</Link>
            <Link href="#" className="hover:text-foreground transition-all duration-300">About Us</Link>
            <Link href="#" className="hover:text-foreground transition-all duration-300">Recipes</Link>
          </div>
        </div>
        <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
          <Link href="#" className="hidden md:block text-text-secondary hover:text-foreground transition-all duration-300">Stories</Link>
          <Link href="#" className="hidden md:block text-text-secondary hover:text-foreground transition-all duration-300">Join Us</Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-black hover:bg-black transition-all shadow-lg shadow-black/5"
          >
            FIND YOUR TRIP
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative w-full h-[100vh] flex flex-col items-center overflow-hidden">

        {/* Massive Background Text - with Parallax */}
        <motion.div
          style={{ y: textY, opacity: heroOpacity, scale: textScale }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10 pt-20"
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[28vw] font-black tracking-tighter leading-[0.75] text-foreground uppercase flex flex-col items-center mix-blend-multiply"
          >
            <span>GO</span>
            <span className="mt-[-2vw]">AWAY</span>
          </motion.h1>
        </motion.div>

        {/* Minimalist Search Bar - with Scroll Transition */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ y: searchY, opacity: heroOpacity }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center z-20 pt-[30%] px-6"
        >
          <div className="w-full max-w-2xl bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-2 flex items-center gap-2 group focus-within:border-black/20 focus-within:bg-white/90 transition-all duration-500">
            <div className="flex-1 flex items-center gap-4 px-4">
              <Search className="w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlanTrip()}
                placeholder="Where to next? (e.g. Paris, Tokyo, Bali...)"
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-lg font-bold placeholder:text-text-secondary/50 placeholder:font-medium text-foreground py-4"
              />
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              onClick={handlePlanTrip}
              className="bg-zinc-950 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10 flex items-center gap-2"
            >
              PLAN TRIP
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-30 w-full py-32 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "AI PREDICTIONS", val: "2.4M+" },
            { label: "COUNTRIES", val: "190+" },
            { label: "HAPPY USERS", val: "50k+" },
            { label: "RATING", val: "4.9/5" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <span className="text-6xl font-black tracking-tighter text-foreground italic">{stat.val}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="w-full py-24 flex items-center justify-center border-t border-border bg-white">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.05 }}
          className="text-[15vw] font-black tracking-tighter italic uppercase text-foreground select-none"
        >
          TravelAI.
        </motion.span>
      </footer>
    </main>
  );
}
