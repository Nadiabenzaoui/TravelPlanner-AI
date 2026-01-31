"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Info, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ItineraryMap } from "@/components/maps/ItineraryMap";

interface Activity {
    time: string;
    activity: string;
    location: string;
    lat: number;
    lng: number;
}

interface Day {
    dayNumber: number;
    theme: string;
    activities: Activity[];
}

interface Itinerary {
    tripTitle: string;
    destination: string;
    days: Day[];
    tips: string[];
}

function PlannerContent() {
    const searchParams = useSearchParams();
    const destination = searchParams.get("destination");
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!destination) return;

        const generateTrip = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/generate-itinerary", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ destination }),
                });

                if (!response.ok) throw new Error("Failed to generate itinerary");
                const data = await response.json();
                setItinerary(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        generateTrip();
    }, [destination]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                >
                    <Sparkles className="w-12 h-12 text-primary" />
                </motion.div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4">
                    Designing your escape...
                </h2>
                <p className="text-text-secondary font-medium tracking-tight">
                    AI is gathering the best spots in <span className="text-foreground font-bold">{destination}</span> for you.
                </p>
            </div>
        );
    }

    if (error || !itinerary) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-black tracking-tighter uppercase mb-4 text-red-500">
                    Something went wrong
                </h2>
                <p className="text-text-secondary mb-8">{error || "Could not generate itinerary"}</p>
                <Link href="/" className="px-8 py-4 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest">
                    Go Back
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-32">
            <motion.header
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-24"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border mb-8">
                    <MapPin className="w-4 h-4 text-text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{itinerary.destination}</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-8">
                    {itinerary.tripTitle}
                </h1>
            </motion.header>

            <div className="flex flex-col lg:flex-row gap-24">
                {/* Left Side: Itinerary */}
                <div className="lg:w-3/5 grid gap-24">
                    {itinerary.days.map((day, dayIdx) => (
                        <motion.section
                            key={day.dayNumber}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="flex flex-col md:flex-row gap-12">
                                <div className="md:w-1/4">
                                    <div className="sticky top-32">
                                        <span className="text-8xl font-black tracking-tighter opacity-5 block leading-none mb-4">
                                            0{day.dayNumber}
                                        </span>
                                        <h3 className="text-xl font-black uppercase tracking-tight leading-tight">
                                            {day.theme}
                                        </h3>
                                    </div>
                                </div>

                                <div className="md:w-3/4 space-y-12">
                                    {day.activities.map((activity, actIdx) => (
                                        <div key={actIdx} className="group relative pl-8 border-l border-border hover:border-black transition-colors">
                                            <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] rounded-full bg-border group-hover:bg-black transition-colors" />
                                            <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.2em] text-text-secondary uppercase mb-2">
                                                <Clock className="w-3 h-3" />
                                                <span>{activity.time}</span>
                                                <span className="opacity-20">—</span>
                                                <span>{activity.location}</span>
                                            </div>
                                            <h4 className="text-2xl font-bold tracking-tight mb-2">{activity.activity}</h4>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Right Side: Sticky Map */}
                <div className="lg:w-2/5">
                    <div className="sticky top-32 lg:h-[calc(100vh-200px)]">
                        <ItineraryMap itinerary={itinerary} />
                    </div>
                </div>
            </div>

            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-32 p-12 bg-surface rounded-3xl border border-border"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-white border border-border">
                        <Info className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Pro Tips</h3>
                </div>
                <ul className="grid md:grid-cols-2 gap-6">
                    {itinerary.tips.map((tip, i) => (
                        <li key={i} className="flex gap-4 text-sm font-medium text-text-secondary leading-relaxed italic">
                            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                            {tip}
                        </li>
                    ))}
                </ul>
            </motion.section>

            <div className="mt-24 flex flex-col items-center gap-6">
                <Link href="/trips" className="px-8 py-4 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl shadow-black/10">
                    View Saved Trips
                </Link>
                <Link href="/" className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] hover:gap-6 transition-all group opacity-60 hover:opacity-100">
                    Plan another escape
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

export default function PlannerPage() {
    return (
        <main className="min-h-screen bg-background font-sans text-foreground noise">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <PlannerContent />
            </Suspense>
        </main>
    );
}
