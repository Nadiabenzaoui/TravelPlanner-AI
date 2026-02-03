
import { motion } from "framer-motion";
import { DollarSign, PieChart, TrendingUp } from "lucide-react";

interface BudgetData {
    total_estimated: number;
    currency: string;
    breakdown: {
        flights: number;
        accommodation: number;
        activities: number;
        food: number;
    };
    budget_tips: string[];
}

export function BudgetCard({ data }: { data: BudgetData }) {
    if (!data) return null;

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(amount);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Estimated Budget</h3>
                    <p className="text-sm text-text-secondary font-medium">For one person</p>
                </div>
            </div>

            <div className="text-4xl font-black mb-8 tracking-tight">
                {formatMoney(data.total_estimated)}
            </div>

            <div className="space-y-4 mb-8">
                {Object.entries(data.breakdown).map(([category, amount], i) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                        <span className="font-bold uppercase tracking-wider text-text-secondary text-xs">{category}</span>
                        <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(amount / data.total_estimated) * 100}%` }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="h-full bg-black"
                            />
                        </div>
                        <span className="font-bold">{formatMoney(amount)}</span>
                    </div>
                ))}
            </div>

            <div className="bg-surface p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-widest text-text-secondary">
                    <TrendingUp className="w-3 h-3" />
                    Savings Tips
                </div>
                <ul className="space-y-2">
                    {data.budget_tips.map((tip, i) => (
                        <li key={i} className="text-sm italic text-gray-600 leading-snug">"{tip}"</li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}
