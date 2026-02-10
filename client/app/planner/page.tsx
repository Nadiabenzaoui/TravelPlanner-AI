"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    MapPin, Clock, Info, ChevronRight, Sparkles, ExternalLink, Ticket,
    Save, Check, Loader2, Calendar, ChevronDown, Globe, Share2, Copy, Lock, Unlock
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateICS } from "@/lib/icsGenerator";
import { BudgetCard } from "@/components/BudgetCard";
import { PackingWidget } from "@/components/PackingWidget";
import { VibeCheck } from "@/components/VibeCheck";

import { PlaceImage } from "@/components/PlaceImage";
import { ItineraryMap } from "@/components/ItineraryMap";
import { ActivityModal } from "@/components/ActivityModal";

interface Activity {
    time: string;
    activity: string;
    location: string;
    lat: number;
    lng: number;
    image_prompt?: string;
}

interface Day {
    dayNumber: number;
    theme: string;
    activities: Activity[];
}

interface SmartFeatures {
    budget_estimator: {
        total_estimated: number;
        currency: string;
        breakdown: {
            flights: number;
            accommodation: number;
            activities: number;
            food: number;
        };
        budget_tips: string[];
    };
    packing_list: {
        weather_forecast: string;
        essentials: string[];
    };
    local_vibe: {
        etiquette_tips: string[];
        survival_phrases: Array<{
            original: string;
            pronunciation: string;
            meaning: string;
        }>;
    };
}

interface Itinerary {
    tripTitle: string;
    destination: string;
    days: Day[];
    tips: string[];
    smart_features?: SmartFeatures;
    is_public?: boolean;
}

const getGoogleMapsUrl = (location: string, destination: string) => {
    const query = encodeURIComponent(`${location}, ${destination}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const getBookingUrl = (location: string, destination: string) => {
    const query = encodeURIComponent(`${location} ${destination}`);
    return `https://www.google.com/search?q=${query}+tickets+booking+reservation`;
};

function PlannerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const destinationParam = searchParams.get("destination");
    const tripIdParam = searchParams.get("tripId");
    const dateParam = searchParams.get("date");

    // Core Data State
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Sharing State
    const [isPublic, setIsPublic] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copying, setCopying] = useState(false);

    // UI State
    const [showExportDate, setShowExportDate] = useState(false);
    const [exportDate, setExportDate] = useState<string>("");

    // Interactive Features State
    const [expandedDay, setExpandedDay] = useState<number | null>(1); // Default open first day
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    const allActivities = itinerary ? itinerary.days.flatMap(d => d.activities) : [];

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, []);

    const fetchSavedTrip = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            // Try to get session, but don't fail if none (public access)
            const { data: { session } } = await supabase.auth.getSession();
            const headers: HeadersInit = {};
            if (session) {
                headers["Authorization"] = `Bearer ${session.access_token}`;
                headers["x-user-id"] = session.user.id;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${id}`, {
                headers
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error("This trip is private.");
                throw new Error("Failed to load trip");
            }

            const data = await response.json();
            setItinerary(data.trip.itinerary);
            setIsPublic(data.trip.is_public);
            setIsOwner(data.isOwner || false); // Backend returns isOwner
            setSaved(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load trip");
        } finally {
            setLoading(false);
        }
    };

    const handleShareToggle = async () => {
        if (!tripIdParam || !isOwner) return;

        const newStatus = !isPublic;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripIdParam}/share`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ is_public: newStatus })
            });

            if (response.ok) {
                setIsPublic(newStatus);
            }
        } catch (err) {
            console.error("Failed to toggle share", err);
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/planner?tripId=${tripIdParam}`;
        navigator.clipboard.writeText(url);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    const saveTrip = async () => {
        if (!itinerary || !user) return;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                    "x-user-id": user.id,
                },
                body: JSON.stringify({
                    destination: itinerary.destination,
                    title: itinerary.tripTitle,
                    itinerary: itinerary,
                }),
            });
            if (response.ok) setSaved(true);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        if (!exportDate || !itinerary) return;
        const icsData = generateICS(itinerary, new Date(exportDate));
        const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", `${itinerary.tripTitle.replace(/\s+/g, "_")}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportDate(false);
    };

    const generateTrip = async (dest: string, dateParam?: string | null) => {
        if (!dest.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const preferences = dateParam ? `Travel Date: ${dateParam}` : undefined;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/itinerary/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destination: dest, preferences }),
            });
            if (!response.ok) throw new Error("Failed");
            const data = await response.json();
            setItinerary(data);

            // Cache the result
            try {
                const cacheKey = `itinerary_${dest}_${dateParam || 'nodate'}`;
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (e) {
                console.warn("Failed to cache itinerary:", e);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tripIdParam) {
            fetchSavedTrip(tripIdParam);
        } else if (destinationParam) {
            // Check cache first
            const cacheKey = `itinerary_${destinationParam}_${dateParam || 'nodate'}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached) {
                try {
                    setItinerary(JSON.parse(cached));
                    setLoading(false);
                } catch {
                    sessionStorage.removeItem(cacheKey);
                    generateTrip(destinationParam, dateParam);
                }
            } else {
                generateTrip(destinationParam, dateParam);
            }
        }
    }, [destinationParam, tripIdParam, dateParam]);

    useEffect(() => {
        if (!destinationParam && !tripIdParam && !itinerary && !loading) router.push("/");
    }, [destinationParam, tripIdParam, itinerary, loading, router]);

    if (!destinationParam && !tripIdParam && !itinerary && !loading) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-8">
                    <Sparkles className="w-12 h-12 text-primary" />
                </motion.div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4">Designing your escape...</h2>
                <p className="text-text-secondary font-medium tracking-tight">AI is gathering coordinates and photos for <span className="text-foreground font-bold">{destinationParam}</span>.</p>
            </div>
        );
    }

    if (error || !itinerary) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-black tracking-tighter uppercase mb-4 text-red-500">Something went wrong</h2>
                <p className="text-text-secondary mb-8">{error}</p>
                <Link href="/" className="px-8 py-4 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest">Go Back</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-24">
            {/* Modal for Map Interaction */}
            {selectedActivity && itinerary && (
                <ActivityModal
                    activity={selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                    destination={itinerary.destination}
                />
            )}

            {/* Header */}
            <motion.header initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-16">
                <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all mb-8 block">← Back Home</Link>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8">{itinerary.tripTitle}</h1>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border">
                        <MapPin className="w-3 h-3 text-text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{itinerary.destination}</span>
                    </div>

                    {/* Country Insights Link */}
                    <Link
                        href={`/destinations/${itinerary.destination.split(',').pop()?.trim() || itinerary.destination}`}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white hover:scale-105 transition-transform shadow-lg"
                    >
                        <Globe className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Discover {itinerary.destination.split(',').pop()?.trim()}</span>
                    </Link>
                </div>
            </motion.header>

            <div className="flex flex-col lg:flex-row gap-12 relative">

                {/* LEFT COLUMN: Collapsible Itinerary (60%) */}
                <div className="w-full lg:w-[55%] space-y-6">
                    <div className="space-y-6">
                        {itinerary.days.map((day) => (
                            <section key={day.dayNumber} className="relative bg-surface rounded-3xl overflow-hidden border border-border shadow-sm transition-all duration-300 hover:shadow-md">
                                {/* Collapsible Header */}
                                <button
                                    onClick={() => setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber)}
                                    className="w-full flex items-center justify-between p-6 md:p-8 text-left bg-white/50 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <span className="text-5xl font-black tracking-tighter opacity-10 text-outline-text">0{day.dayNumber}</span>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none mb-1">{day.theme}</h3>
                                            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{day.activities.length} Activities</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full border border-border flex items-center justify-center transition-transform duration-300 ${expandedDay === day.dayNumber ? 'rotate-180 bg-black text-white border-black' : 'bg-white'}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </button>

                                {/* Collapsible Content */}
                                <div className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${expandedDay === day.dayNumber ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="space-y-8 p-6 md:p-8 pt-0 border-t border-border/50">
                                        {day.activities.map((activity, actIdx) => (
                                            <div
                                                key={actIdx}
                                                className="relative group cursor-pointer"
                                                onClick={() => setSelectedActivity(activity)} // Click anywhere to open modal details
                                            >
                                                <div className="bg-white rounded-2xl p-4 md:p-6 hover:bg-gray-50 transition-all border border-border/50 hover:border-black/10 hover:shadow-lg flex gap-6 items-start">

                                                    {/* Thumbnail Image */}
                                                    <div className="hidden md:block w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
                                                        <PlaceImage
                                                            query={activity.location}
                                                            className="w-full h-full"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-text-secondary uppercase mb-2">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{activity.time}</span>
                                                        </div>
                                                        <h4 className="text-lg font-bold tracking-tight mb-1 truncate group-hover:text-primary transition-colors">{activity.activity}</h4>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <MapPin className="w-3 h-3 text-primary/60" />
                                                            <span className="text-xs font-medium text-text-secondary truncate">{activity.location}</span>
                                                        </div>

                                                        {/* Mini Actions */}
                                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <a
                                                                href={getBookingUrl(activity.location, itinerary.destination)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1.5 bg-black text-white rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-gray-800"
                                                            >
                                                                Book
                                                            </a>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedActivity(activity);
                                                                }}
                                                                className="px-3 py-1.5 bg-gray-100 text-foreground rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200"
                                                            >
                                                                Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Widgets Section */}
                    {itinerary.smart_features && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-border">
                            <BudgetCard data={itinerary.smart_features.budget_estimator} />
                            <PackingWidget data={itinerary.smart_features.packing_list} />
                            <div className="md:col-span-2">
                                <VibeCheck data={itinerary.smart_features.local_vibe} />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Footer */}
                    <div className="pt-12 flex flex-col items-center gap-6 pb-24">
                        <div className="flex gap-4">
                            {user ? (
                                <>
                                    {/* Save Button (Only if not saved or owner) */}
                                    {(!saved || isOwner) && (
                                        <button
                                            onClick={saveTrip}
                                            disabled={saving || (saved && !isOwner)} // Allow re-save? simplified for now
                                            className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl inline-flex items-center gap-3 ${saved ? "bg-green-600 text-white" : "bg-black text-white"}`}
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                            {saved ? "Saved" : "Save Trip"}
                                        </button>
                                    )}

                                    {/* Share Button (Only for Owner and if saved) */}
                                    {saved && isOwner && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowShareModal(!showShareModal)}
                                                className="px-8 py-4 bg-white text-black border border-black/10 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-xl inline-flex items-center gap-3"
                                            >
                                                {isPublic ? <Globe className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4" />}
                                                Share
                                            </button>

                                            {/* Share Popover */}
                                            {showShareModal && (
                                                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-border p-6 z-50 animate-in fade-in slide-in-from-bottom-4">
                                                    <h3 className="text-lg font-bold mb-2">Share your Trip</h3>
                                                    <p className="text-xs text-text-secondary mb-4">
                                                        {isPublic ? "Anyone with the link can view this." : "Only you can see this trip."}
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                                                        <button
                                                            onClick={handleShareToggle}
                                                            className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-colors ${isPublic ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}
                                                        >
                                                            Public
                                                        </button>
                                                        <button
                                                            onClick={handleShareToggle}
                                                            className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-colors ${!isPublic ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}
                                                        >
                                                            Private
                                                        </button>
                                                    </div>

                                                    {isPublic && (
                                                        <button
                                                            onClick={copyLink}
                                                            className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-xl text-xs font-bold uppercase hover:bg-gray-50"
                                                        >
                                                            {copying ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                                            {copying ? "Copied!" : "Copy Link"}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link href="/login" className="px-8 py-4 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                    Login to Save
                                </Link>
                            )}
                        </div>

                        <button onClick={() => setShowExportDate(!showExportDate)} className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Export to Calendar
                        </button>
                        {showExportDate && (
                            <div className="flex gap-2 p-2 bg-white border border-border rounded-lg shadow-xl">
                                <input type="date" onChange={(e) => setExportDate(e.target.value)} className="text-sm p-1" />
                                <button onClick={handleExport} disabled={!exportDate} className="bg-black text-white p-1 rounded"><Check className="w-3 h-3" /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Sticky Map (45%) */}
                <div className="hidden lg:block w-[45%] relative">
                    <div className="sticky top-8 h-[calc(100vh-4rem)] bg-surface rounded-3xl overflow-hidden border border-border shadow-2xl">
                        <ItineraryMap
                            activities={allActivities}
                            onMarkerClick={setSelectedActivity}
                        />
                        <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-border shadow-lg">
                            <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-text-secondary">Interactive Map</h4>
                            <p className="text-sm font-medium">Click on markers to see details about {allActivities.length} locations.</p>
                        </div>
                    </div>
                </div>

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
