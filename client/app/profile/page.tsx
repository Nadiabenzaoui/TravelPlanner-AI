"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, MapPin, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
    user: {
        id: string;
        email: string;
        created_at: string;
        last_sign_in: string;
    };
    stats: {
        trips_count: number;
    };
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
            });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Error logging out:", error);
            setLoggingOut(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background noise">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background noise">
                <p className="text-zinc-500">Erreur de chargement</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background noise p-6 md:p-16">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <Link
                        href="/"
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-4xl font-black uppercase tracking-tight">
                        Mon Profil
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl shadow-black/5"
                >
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-zinc-100">
                        <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{profile.user.email}</h2>
                            <p className="text-zinc-500 text-sm">
                                Membre depuis {formatDate(profile.user.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Email
                                </p>
                                <p className="font-medium">{profile.user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Voyages planifiés
                                </p>
                                <p className="font-medium">{profile.stats.trips_count} voyage{profile.stats.trips_count > 1 ? "s" : ""}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                    Dernière connexion
                                </p>
                                <p className="font-medium">
                                    {profile.user.last_sign_in
                                        ? formatDate(profile.user.last_sign_in)
                                        : "Première connexion"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-100 flex gap-4">
                        <Link
                            href="/trips"
                            className="flex-1 text-center bg-zinc-100 text-black py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                        >
                            Mes Voyages
                        </Link>
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {loggingOut ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4" />
                                    Déconnexion
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
