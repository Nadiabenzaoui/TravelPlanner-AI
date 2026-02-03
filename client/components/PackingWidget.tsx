
import { motion } from "framer-motion";
import { Briefcase, Sun, CloudRain, Thermometer } from "lucide-react";

interface PackingData {
    weather_forecast: string;
    essentials: string[];
}

export function PackingWidget({ data }: { data: PackingData }) {
    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow h-full"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Smart Packing</h3>
                    <p className="text-sm text-text-secondary font-medium">Weather adapted</p>
                </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                <Sun className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400 block mb-1">Forecast</span>
                    <p className="text-sm font-medium text-blue-900 leading-relaxed">{data.weather_forecast}</p>
                </div>
            </div>

            <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-text-secondary block mb-2">Essentials</span>
                {data.essentials.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className="w-5 h-5 rounded-md border-2 border-gray-200 group-hover:border-black transition-colors flex items-center justify-center">
                            {/* Checkbox simulation */}
                        </div>
                        <span className="text-sm font-medium group-hover:line-through transition-all cursor-pointer select-none">{item}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
