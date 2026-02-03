"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Globe, Users, Coins, Clock, Languages, ExternalLink, Loader2, Sparkles, Info, Home } from "lucide-react";
import Link from "next/link";
import { PlaceImage } from "@/components/PlaceImage";

interface CountryData {
    name: {
        common: string;
        official: string;
        nativeName?: { [key: string]: { common: string; official: string } };
    };
    tld: string[];
    cca2: string;
    ccn3: string;
    cca3: string;
    independent: boolean;
    status: string;
    unMember: boolean;
    currencies: { [key: string]: { name: string; symbol: string } };
    idd: { root: string; suffixes: string[] };
    capital: string[];
    altSpellings: string[];
    region: string;
    subregion: string;
    languages: { [key: string]: string };
    translations: { [key: string]: { official: string; common: string } };
    latlng: number[];
    landlocked: boolean;
    area: number;
    demonyms: { [key: string]: { f: string; m: string } };
    flag: string;
    maps: { googleMaps: string; openStreetMaps: string };
    population: number;
    car: { signs: string[]; side: string };
    timezones: string[];
    continents: string[];
    flags: { png: string; svg: string; alt: string };
    coatOfArms: { png: string; svg: string };
    startOfWeek: string;
    capitalInfo: { latlng: number[] };
}

function CountryDetails() {
    const params = useParams();
    const router = useRouter();
    // Decode the param properly. It might be partial like "Japan" or "Tokyo, Japan"
    // We will try to clean it up before fetching if needed, but usually the link provided will be just the country name.
    const rawName = typeof params.name === 'string' ? decodeURIComponent(params.name) : '';

    // Simple heuristic: if it contains a comma, take the last part (assuming "City, Country")
    const countryName = rawName.includes(',') ? rawName.split(',').pop()?.trim() || rawName : rawName;

    const [country, setCountry] = useState<CountryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    interface TravelInsights {
        apps: Array<{ name: string; category: string; description: string }>;
        visa: { summary: string; warning: string };
        emergency: { police: string; ambulance: string };
    }

    const [insights, setInsights] = useState<TravelInsights | null>(null);

    // Fetch AI Insights when country is loaded
    useEffect(() => {
        if (!country) return;

        const fetchInsights = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/destinations/insights`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destination: country.name.common })
                });
                if (res.ok) {
                    const data = await res.json();
                    setInsights(data);
                }
            } catch (err) {
                console.error("Failed to load insights", err);
            }
        };

        fetchInsights();
    }, [country]);

    useEffect(() => {
        if (!countryName) return;

        const fetchCountry = async () => {
            setLoading(true);
            setError(null);

            const fetchFromRestCountries = async (name: string) => {
                const res = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=false`);
                if (!res.ok) throw new Error("Country not found");
                const data = await res.json();
                return data.find((c: any) => c.name.common.toLowerCase() === name.toLowerCase()) || data[0];
            };

            try {
                // Attempt 1: Try as Country Name (e.g. "Japan")
                try {
                    const countryData = await fetchFromRestCountries(countryName);
                    setCountry(countryData);
                    return;
                } catch (e) {
                    console.log(`Not a country name: ${countryName}`);
                }

                // Attempt 2: Try as Capital City (e.g. "Tokyo", "Paris")
                try {
                    const res = await fetch(`https://restcountries.com/v3.1/capital/${countryName}?fullText=false`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.length > 0) {
                            setCountry(data[0]);
                            return;
                        }
                    }
                } catch (e) {
                    console.log(`Not a capital city: ${countryName}`);
                }

                // Attempt 3: Resolve City -> Country via Nominatim (e.g. "Kyoto", "New York")
                const nomiRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(countryName)}&format=json&addressdetails=1&limit=1&accept-language=en`);
                if (!nomiRes.ok) throw new Error("Location resolution failed");

                const nomiData = await nomiRes.json();
                if (!nomiData.length || !nomiData[0].address?.country) {
                    throw new Error(`Could not identify country for '${countryName}'`);
                }

                const resolvedCountryName = nomiData[0].address.country;
                console.log(`Resolved '${countryName}' to '${resolvedCountryName}'`);

                // Attempt 4: Fetch with resolved country name
                const countryData = await fetchFromRestCountries(resolvedCountryName);
                setCountry(countryData);

            } catch (err) {
                console.error(err);
                setError(`We couldn't find country data for "${countryName}". Try searching for the country name directly.`);
            } finally {
                setLoading(false);
            }
        };

        fetchCountry();
    }, [countryName]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-xl font-bold uppercase tracking-widest animate-pulse">Loading Insights...</p>
            </div>
        );
    }

    if (error || !country) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
                <h1 className="text-4xl font-black mb-4">Are you lost?</h1>
                <p className="text-text-secondary mb-8">{error || "We couldn't find data for this destination."}</p>
                <button onClick={() => router.back()} className="px-8 py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                    Go Back
                </button>
            </div>
        );
    }

    const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <PlaceImage
                    query={country.name.common + " beautiful scenic landmark travel wallpaper"}
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/30" />

                <div className="absolute top-0 left-0 w-full p-8 flex gap-4 items-start z-20">
                    <button
                        onClick={() => router.back()}
                        className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/20 group"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <Link
                        href="/"
                        className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/20 group"
                        title="Back to Home"
                    >
                        <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="max-w-7xl mx-auto">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row gap-8 md:items-end">
                            {/* Flag */}
                            <div className="w-32 h-20 md:w-48 md:h-32 shadow-2xl rounded-xl overflow-hidden border-4 border-white transform -rotate-3">
                                <img src={country.flags.svg} alt={country.flags.alt} className="w-full h-full object-cover" />
                            </div>

                            <div className="mb-4">
                                <h4 className="text-white/80 font-bold uppercase tracking-[0.3em] mb-2">{country.subregion}</h4>
                                <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">{country.name.common}</h1>
                                {country.name.nativeName && (
                                    <p className="text-white/60 font-serif italic text-2xl mt-2">
                                        {Object.values(country.name.nativeName)[0]?.common}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Key Stat Cards */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-surface border border-border p-8 rounded-3xl shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Capital City</p>
                        <h3 className="text-2xl font-black">{country.capital?.[0] || "N/A"}</h3>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-surface border border-border p-8 rounded-3xl shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Population</p>
                        <h3 className="text-2xl font-black">{formatNumber(country.population)}</h3>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-surface border border-border p-8 rounded-3xl shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
                            <Coins className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Currency</p>
                        <h3 className="text-2xl font-black truncate">
                            {country.currencies ? Object.values(country.currencies)[0].name : "N/A"}
                            <span className="text-lg opacity-50 ml-2">({country.currencies ? Object.values(country.currencies)[0].symbol : ""})</span>
                        </h3>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-surface border border-border p-8 rounded-3xl shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                            <Languages className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Language</p>
                        <h3 className="text-2xl font-black truncate">{country.languages ? Object.values(country.languages)[0] : "N/A"}</h3>
                    </motion.div>

                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Essential Info List */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* AI TRAVEL TOOLKIT SECTION */}
                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Sparkles className="w-8 h-8 text-yellow-500" />
                                Travel Toolkit
                            </h2>

                            {insights ? (
                                <div className="space-y-6">
                                    {/* Visa & Emergency Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-black text-white p-8 rounded-3xl shadow-xl border border-white/10">
                                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-4 flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> Visa Info
                                            </h3>
                                            <p className="font-medium text-lg mb-4">{insights.visa.summary}</p>
                                            {insights.visa.warning && (
                                                <div className="bg-white/10 p-4 rounded-xl text-sm font-medium flex gap-3 items-start">
                                                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-yellow-300" />
                                                    {insights.visa.warning}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-red-900">
                                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-4 flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Emergency
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-red-100">
                                                    <span className="font-bold">Police</span>
                                                    <span className="text-2xl font-black">{insights.emergency.police}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-red-100">
                                                    <span className="font-bold">Ambulance</span>
                                                    <span className="text-2xl font-black">{insights.emergency.ambulance}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommended Apps */}
                                    <div className="bg-surface rounded-3xl p-8 border border-border">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-6">Essential Apps</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {insights.apps.map((app, idx) => (
                                                <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-border/50 hover:shadow-md transition-shadow">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 font-black text-xl text-gray-400">
                                                        {app.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg">{app.name}</h4>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">{app.category}</span>
                                                        <p className="text-sm text-text-secondary mt-1 leading-snug">{app.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Loading Skeleton for AI
                                <div className="space-y-6 animate-pulse">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="h-48 bg-gray-200 rounded-3xl"></div>
                                        <div className="h-48 bg-gray-200 rounded-3xl"></div>
                                    </div>
                                    <div className="h-64 bg-gray-200 rounded-3xl"></div>
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Globe className="w-8 h-8" />
                                Country Overview
                            </h2>
                            <div className="bg-surface rounded-3xl p-8 border border-border space-y-6">
                                <div className="flex justify-between items-center py-4 border-b border-border/50">
                                    <span className="font-bold text-text-secondary">Region</span>
                                    <span className="font-bold">{country.region} ({country.subregion})</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-border/50">
                                    <span className="font-bold text-text-secondary">Timezones</span>
                                    <span className="font-bold text-right">{country.timezones.join(", ")}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-border/50">
                                    <span className="font-bold text-text-secondary">Driving Side</span>
                                    <span className="font-bold capitalize">{country.car.side}</span>
                                </div>
                                <div className="flex justify-between items-center py-4">
                                    <span className="font-bold text-text-secondary">Internet Domain</span>
                                    <span className="font-bold">{country.tld?.[0]}</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                <ExternalLink className="w-8 h-8" />
                                Useful Links
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer" className="p-6 bg-white border border-border rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <span className="font-bold">View on Google Maps</span>
                                    <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <a href={`https://en.wikipedia.org/wiki/${country.name.common}`} target="_blank" rel="noopener noreferrer" className="p-6 bg-white border border-border rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <span className="font-bold">Wikipedia Entry</span>
                                    <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </section>
                    </div>

                    {/* Fun/Visual Side Column */}
                    <div className="space-y-8">
                        <div className="bg-black text-white p-8 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Did you know?</h3>
                            <p className="text-white/80 leading-relaxed font-medium">
                                {country.name.common} covers an area of {formatNumber(country.area)} km².
                                It is {country.landlocked ? "a landlocked country" : "not landlocked"} located in {country.continents[0]}.
                            </p>
                        </div>

                        <div className="p-8 border border-border rounded-3xl bg-surface">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4">Coat of Arms</h3>
                            <div className="aspect-square flex items-center justify-center p-4">
                                {country.coatOfArms.svg ? (
                                    <img src={country.coatOfArms.svg} alt="Coat of Arms" className="max-w-full max-h-full object-contain drop-shadow-lg" />
                                ) : (
                                    <p className="text-center opacity-30 font-bold">Not Available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CountryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CountryDetails />
        </Suspense>
    )
}
