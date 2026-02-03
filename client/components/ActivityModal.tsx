"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Ticket, ExternalLink } from "lucide-react";
import { PlaceImage } from "./PlaceImage";

interface Activity {
    time: string;
    activity: string;
    location: string;
    lat: number;
    lng: number;
    image_prompt?: string;
}

interface ActivityModalProps {
    activity: Activity | null;
    onClose: () => void;
    destination: string;
}

const getGoogleMapsUrl = (location: string, destination: string) => {
    const query = encodeURIComponent(`${location}, ${destination}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const getBookingUrl = (location: string, destination: string) => {
    const query = encodeURIComponent(`${location} ${destination}`);
    return `https://www.google.com/search?q=${query}+tickets+booking+reservation`;
};

export function ActivityModal({ activity, onClose, destination }: ActivityModalProps) {
    if (!activity) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-border/50 relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors backdrop-blur-md"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="h-64 sm:h-80 w-full relative">
                        <PlaceImage
                            query={activity.image_prompt || activity.activity}
                            className="w-full h-full"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-24">
                            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                                <Clock className="w-4 h-4" />
                                {activity.time}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none">
                                {activity.activity}
                            </h2>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-start gap-4 mb-8">
                            <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">Location</h3>
                                <p className="text-text-secondary">{activity.location}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <a
                                href={getBookingUrl(activity.location, destination)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg"
                            >
                                <Ticket className="w-4 h-4" />
                                Book Now
                            </a>
                            <a
                                href={getGoogleMapsUrl(activity.location, destination)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-4 bg-surface border border-border text-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Map
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
