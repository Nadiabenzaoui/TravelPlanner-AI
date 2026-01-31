"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface Trip {
    id: string;
    created_at: string;
    destination: string;
    title: string;
    itinerary: any;
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/trips");
            const data = await res.json();
            if (data.trips) {
                setTrips(data.trips);
            }
        } catch (error) {
            console.error("Error fetching trips:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTrip = async (id: string) => {
        if (!confirm("Supprimer ce voyage ?")) return;

        setDeleting(id);
        try {
            const res = await fetch("/api/trips", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setTrips(trips.filter((trip) => trip.id !== id));
            }
        } catch (error) {
            console.error("Error deleting trip:", error);
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background font-sans text-foreground noise p-8 md:p-16">
            <header className="max-w-7xl mx-auto mb-24 flex justify-between items-end">
                <div>
                    <Link href="/" className="text-sm font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all mb-4 block">
                        ← Back Home
                    </Link>
                    <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">
                        Saved <br /> Escapees.
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <span className="text-9xl font-black tracking-tighter opacity-5 leading-none">
                        {trips.length.toString().padStart(2, "0")}
                    </span>
                </div>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trips.length === 0 ? (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-3xl">
                        <p className="text-text-secondary font-medium italic mb-4">No adventures saved yet.</p>
                        <Link
                            href="/planner"
                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                        >
                            Plan your first trip
                        </Link>
                    </div>
                ) : (
                    trips.map((trip, i) => (
                        <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-white border border-border p-8 rounded-3xl hover:border-black transition-all duration-500 shadow-xl shadow-black/5 hover:shadow-black/10"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border">
                                    <MapPin className="w-3 h-3 text-text-secondary" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{trip.destination}</span>
                                </div>
                                <button
                                    onClick={() => deleteTrip(trip.id)}
                                    disabled={deleting === trip.id}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                >
                                    {deleting === trip.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            <h3 className="text-3xl font-black tracking-tighter uppercase leading-tight mb-8">
                                {trip.title}
                            </h3>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(trip.created_at).toLocaleDateString("fr-FR")}
                                </div>
                                <Link
                                    href={`/planner?destination=${encodeURIComponent(trip.destination)}`}
                                    className="p-3 bg-black text-white rounded-xl hover:scale-110 transition-all active:scale-95"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </main>
    );
}
