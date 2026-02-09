"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, LogOut, Plane, Sparkles, Coins, Calendar } from "lucide-react";
import { GoogleMapsAutocomplete } from "@/components/maps/GoogleMapsAutocomplete";
import { createClient } from "@/lib/supabase/client";
import { PlaceImage } from "@/components/PlaceImage";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Mouse move effect removed as per user request

  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "30%"]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const searchY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);

  const [searchQuery, setSearchQuery] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [user, setUser] = useState<any>(undefined); // undefined = loading, null = not logged in
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error checking user:", error);
        setUser(null);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlanTrip = () => {
    if (!searchQuery.trim()) return;
    if (!searchQuery.trim()) return;
    let url = `/planner?destination=${encodeURIComponent(searchQuery)}`;
    if (tripDate) url += `&date=${tripDate}`;
    router.push(url);
  };

  const handlePlaceSelect = (place: { name?: string; formatted_address?: string } | null) => {
    if (place?.name || place?.formatted_address) {
      setSearchQuery(place.name || place.formatted_address || "");
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setTimeout(() => {
      setUser(null);
      setLoggingOut(false);
      router.refresh();
    }, 1500);
  };

  return (
    <main ref={containerRef} className="relative min-h-screen bg-background font-sans text-foreground flex flex-col items-center overflow-x-hidden noise">
      {/* Logout Overlay */}
      <AnimatePresence>
        {loggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            {/* ... keeping logout animation ... */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ x: [0, 100, 200], y: [0, -20, 0] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <Plane className="w-12 h-12 text-white mb-6 mx-auto" />
              </motion.div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tight">See you soon!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="flex gap-12 items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic">TravelAI.</Link>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary">
            {user && (
              <Link href="/trips" className="hover:text-foreground transition-all duration-300">My Trips</Link>
            )}
            <Link href="/destinations" className="hover:text-foreground transition-all duration-300">Destinations</Link>
          </div>
        </div>
        <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
          {user === undefined ? null : !user ? (
            <>
              <Link href="/login" className="text-text-secondary hover:text-foreground transition-all duration-300">Login</Link>
              <Link href="/signup" className="text-text-secondary hover:text-foreground transition-all duration-300">Join Us</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="flex items-center gap-2 text-text-secondary hover:text-red-500 transition-all duration-300">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });
            }}
            className="px-6 py-2.5 bg-black text-white rounded-lg font-black hover:bg-zinc-800 transition-all shadow-lg shadow-black/5"
          >
            START NOW
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-dot-pattern">

        {/* Massive Background Text - with Parallax */}
        <motion.div
          style={{
            y: textY,
            opacity: heroOpacity,
            scale: textScale
          }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10 pt-20"
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[28vw] font-black tracking-tighter leading-[0.75] text-foreground uppercase flex flex-col items-center opacity-10"
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
          className="relative z-20 w-full px-6 flex justify-center"
        >
          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl shadow-black/5 p-3 flex items-center gap-2 group focus-within:scale-105 transition-all duration-500">
            <div className="flex-1 flex items-center gap-4 px-4">
              <Search className="w-6 h-6 text-text-secondary" />
              <GoogleMapsAutocomplete
                onPlaceSelect={handlePlaceSelect}
                onChange={setSearchQuery}
                placeholder="Where is your dream destination?"
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-xl font-bold placeholder:text-text-secondary/50 placeholder:font-medium text-foreground py-4"
              />
            </div>

            {/* Date Picker Divider */}
            <div className="w-px h-10 bg-black/10 mx-2 hidden md:block" />

            {/* Date Input */}
            <div className="hidden md:flex items-center gap-3 px-4 min-w-[180px]">
              <Calendar className="w-5 h-5 text-text-secondary" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-bold text-foreground placeholder:text-text-secondary/50 font-sans uppercase tracking-widest cursor-pointer"
              />
            </div>

            <motion.button
              whileHover={{ x: 5 }}
              onClick={handlePlanTrip}
              className="bg-black text-white px-8 py-5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-lg flex items-center gap-2"
            >
              Let's Go
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Trending Destinations */}
      <section className="relative z-30 w-full py-32 bg-surface border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Trending Now</h2>
              <p className="text-text-secondary font-medium text-lg">Most visited destinations by our community this week.</p>
            </div>
            <Link href="/destinations" className="hidden md:flex items-center gap-2 font-bold uppercase tracking-widest hover:translate-x-2 transition-transform">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Tokyo, Japan", query: "Tokyo Shibuya neon night city" },
              { name: "Paris, France", query: "Eiffel Tower Paris sunset river" },
              { name: "New York, USA", query: "New York City skyline Brooklyn Bridge" }
            ].map((dest, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => router.push(`/destinations/${dest.name.split(',')[0]}`)}
              >
                <PlaceImage query={dest.query} width={600} height={800} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Discover</p>
                  <h3 className="text-4xl font-black uppercase tracking-tight">{dest.name.split(',')[0]}</h3>
                  <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-bold border-b border-white pb-0.5">Explore Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6 p-8 rounded-3xl bg-surface border border-border/50">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">AI Generated Itineraries</h3>
            <p className="text-text-secondary leading-relaxed">Stop wasting hours planning. advanced AI creates the perfect day-by-day plan tailored to your interests in seconds.</p>
          </div>
          <div className="space-y-6 p-8 rounded-3xl bg-surface border border-border/50">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-4">
              <Coins className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Smart Budgeting</h3>
            <p className="text-text-secondary leading-relaxed">Keep your finances in check with our smart estimator. We calculate costs for flights, hotels, and activities automatically.</p>
          </div>
          <div className="space-y-6 p-8 rounded-3xl bg-surface border border-border/50">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
              <Plane className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Travel Toolkit</h3>
            <p className="text-text-secondary leading-relaxed">Visa requirements, essential apps, and emergency numbers. Everything you need to know before you go, instantly available.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-30 w-full py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "ITINERARIES BUILT", val: "2.4M+" },
            { label: "COUNTRIES COVERED", val: "195" },
            { label: "ACTIVE TRAVELERS", val: "50k+" },
            { label: "USER RATING", val: "4.9/5" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <span className="text-5xl md:text-7xl font-black tracking-tighter italic">{stat.val}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="w-full py-24 flex flex-col items-center justify-center bg-white">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          className="text-[15vw] font-black tracking-tighter italic uppercase text-foreground select-none"
        >
          TravelAI.
        </motion.span>
        <p className="mt-8 text-text-secondary font-medium">© 2026 TravelPlanner AI. Crafted with <span className="text-red-500">♥</span> for explorers.</p>
      </footer>
    </main>
  );
}

