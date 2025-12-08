import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MediumDistribution = ({ data }) => {
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const counts = {};
        let total = 0;

        data.forEach(row => {
            const medium = row['Medium'] || 'Unknown';
            counts[medium] = (counts[medium] || 0) + 1;
            total++;
        });

        return Object.keys(counts).map((medium, index) => ({
            id: index + 1,
            Medium: medium,
            Count: counts[medium],
            Percentage: ((counts[medium] / total) * 100).toFixed(2) + '%'
        })).sort((a, b) => b.Count - a.Count); // Sort by count descending
    }, [data]);

    const COLORS = ['#2E86C1', '#3498DB', '#5DADE2', '#85C1E9', '#AED6F1'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Table Section */}
            <div className="glass-card p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                    📖 Medium Wise Distribution Table
                </h3>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Medium</th>
                                <th className="px-4 py-3 text-right">Count</th>
                                <th className="px-4 py-3 text-right text-blue-600">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {processedData.map((row) => (
                                <tr key={row.Medium} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-slate-400">{row.id}</td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{row.Medium}</td>
                                    <td className="px-4 py-3 text-right font-semibold">{row.Count}</td>
                                    <td className="px-4 py-3 text-right text-slate-500">{row.Percentage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bar Chart Section */}
            <div className="glass-card p-6 hover-3d">
                <h3 className="text-lg font-semibold text-secondary mb-4">Student Distribution by Medium</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis dataKey="Medium" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="Count" radius={[0, 4, 4, 0]} barSize={30}>
                                {processedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default MediumDistribution;
