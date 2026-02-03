
import { motion } from "framer-motion";
import { Globe, MessageCircle, Info } from "lucide-react";
import { useState } from "react";

interface Phrase {
    original: string;
    pronunciation: string;
    meaning: string;
}

interface VibeData {
    etiquette_tips: string[];
    survival_phrases: Phrase[];
}

export function VibeCheck({ data }: { data: VibeData }) {
    const [activeTab, setActiveTab] = useState<'tips' | 'phrases'>('tips');

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black text-white p-8 rounded-3xl shadow-xl h-full flex flex-col"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white/10 rounded-xl text-white">
                    <Globe className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Local Vibe</h3>
                    <p className="text-sm text-white/60 font-medium">Don't be a tourist</p>
                </div>
            </div>

            <div className="flex p-1 bg-white/10 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('tips')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'tips' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                >
                    Etiquette
                </button>
                <button
                    onClick={() => setActiveTab('phrases')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'phrases' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
                >
                    Phrases
                </button>
            </div>

            <div className="flex-1">
                {activeTab === 'tips' ? (
                    <motion.ul
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {data.etiquette_tips.map((tip, i) => (
                            <li key={i} className="flex gap-3 text-sm font-medium leading-relaxed text-white/90">
                                <Info className="w-5 h-5 shrink-0 text-white/40" />
                                {tip}
                            </li>
                        ))}
                    </motion.ul>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {data.survival_phrases.map((phrase, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-lg">{phrase.original}</span>
                                    <MessageCircle className="w-4 h-4 text-white/40" />
                                </div>
                                <div className="text-xs font-mono text-white/50 uppercase tracking-wider mb-2">{phrase.pronunciation}</div>
                                <div className="text-sm font-medium text-white/80 italic border-t border-white/10 pt-2">{phrase.meaning}</div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
