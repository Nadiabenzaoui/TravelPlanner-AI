"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const destinations = [
    {
        city: "Tokyo",
        country: "Japan",
        description: "Neon lights, ancient temples, and sushi mastery.",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2994&auto=format&fit=crop",
        tags: ["Culture", "Food", "City"]
    },
    {
        city: "Reykjavik",
        country: "Iceland",
        description: "Northern lights, geothermal spas, and dramatic landscapes.",
        image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2759&auto=format&fit=crop",
        tags: ["Nature", "Adventure", "Cold"]
    },
    {
        city: "Paris",
        country: "France",
        description: "Art, gastronomy, and riverside romance.",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2973&auto=format&fit=crop",
        tags: ["Romance", "History", "Art"]
    },
    {
        city: "Bali",
        country: "Indonesia",
        description: "Tropical beaches, spiritual temples, and lush jungles.",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2838&auto=format&fit=crop",
        tags: ["Beach", "Relaxation", "Nature"]
    },
    {
        city: "New York",
        country: "USA",
        description: "The city that never sleeps, endless energy and icons.",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2940&auto=format&fit=crop",
        tags: ["City", "Nightlife", "Shopping"]
    },
    {
        city: "Rome",
        country: "Italy",
        description: "Eternal city of history, pasta, and grand architecture.",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2896&auto=format&fit=crop",
        tags: ["History", "Food", "Culture"]
    }
];

export default function DestinationsPage() {
    return (
        <main className="min-h-screen bg-background font-sans text-foreground noise p-8 md:p-16">
            <header className="max-w-7xl mx-auto mb-24">
                <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all mb-4 block">
                    ← Back Home
                </Link>
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8]">
                    Destinations.
                </h1>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {destinations.map((dest, i) => (
                    <motion.div
                        key={dest.city}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer"
                    >
                        <Link href={`/planner?destination=${encodeURIComponent(dest.city)}`}>
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${dest.image})` }}
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="flex gap-2 mb-4">
                                        {dest.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 opacity-80">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{dest.country}</span>
                                    </div>
                                    <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{dest.city}</h2>
                                    <p className="text-sm font-medium text-white/80 line-clamp-2 mb-6 max-w-[80%]">
                                        {dest.description}
                                    </p>

                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        Plan Trip
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
