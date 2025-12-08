import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const LEVEL_SCORES = { 'L0': 0, 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4, 'L5': 5 };
const CATEGORY_COLORS = {
    'Progressive': '#2ecc71',      // Green
    'Developing stage': '#f1c40f', // Yellow
    'Needs improvement': '#e74c3c' // Red
};

const ComparativeViews = ({ data }) => {
    const { wardScores, mediumScores, categoryData, highestWard, lowestWard } = useMemo(() => {
        if (!data || data.length === 0) return { wardScores: [], mediumScores: [], categoryData: {}, highestWard: '-', lowestWard: '-' };

        const wardStats = {};
        const mediumStats = {};
        const categories = { Reading: {}, Writing: {}, Numeracy: {} };

        data.forEach(row => {
            // --- Average Score Calculation ---
            const scores = { Reading: 0, Writing: 0, Numeracy: 0 };
            let valid = true; // Simplified: usually we count valid per subject. 

            ['Reading', 'Writing', 'Numeracy'].forEach(sub => {
                const level = row[sub];
                const score = LEVEL_SCORES[level];
                if (score !== undefined) {
                    scores[sub] = score;
                }
            });

            // Ward Aggregation
            const ward = row.Ward || 'Unknown';
            if (!wardStats[ward]) wardStats[ward] = { Reading: 0, Writing: 0, Numeracy: 0, Count: 0 };
            wardStats[ward].Reading += scores.Reading;
            wardStats[ward].Writing += scores.Writing;
            wardStats[ward].Numeracy += scores.Numeracy;
            wardStats[ward].Count++;

            // Medium Aggregation
            const medium = row.Medium || 'Unknown';
            if (!mediumStats[medium]) mediumStats[medium] = { Reading: 0, Writing: 0, Numeracy: 0, Count: 0 };
            mediumStats[medium].Reading += scores.Reading;
            mediumStats[medium].Writing += scores.Writing;
            mediumStats[medium].Numeracy += scores.Numeracy;
            mediumStats[medium].Count++;

            // --- Category Counts ---
            ['Reading', 'Writing', 'Numeracy'].forEach(sub => {
                const cat = row[`${sub}_Category`]; // Assumes converted JSON has this field
                if (cat) {
                    categories[sub][cat] = (categories[sub][cat] || 0) + 1;
                }
            });
        });

        // Finalize Ward Scores
        const wardScoresArr = Object.keys(wardStats).map(ward => {
            const s = wardStats[ward];
            const count = s.Count || 1;
            return {
                Ward: ward,
                Reading: parseFloat((s.Reading / count).toFixed(2)),
                Writing: parseFloat((s.Writing / count).toFixed(2)),
                Numeracy: parseFloat((s.Numeracy / count).toFixed(2)),
                TotalScore: (s.Reading + s.Writing + s.Numeracy) / count // rough aggregate for sorting
            };
        }).sort((a, b) => b.TotalScore - a.TotalScore);

        const highestWard = wardScoresArr.length > 0 ? wardScoresArr[0].Ward : '-';
        const lowestWard = wardScoresArr.length > 0 ? wardScoresArr[wardScoresArr.length - 1].Ward : '-';

        // Finalize Medium Scores
        const mediumScoresArr = Object.keys(mediumStats).map(medium => {
            const s = mediumStats[medium];
            const count = s.Count || 1;
            return {
                Medium: medium,
                Reading: parseFloat((s.Reading / count).toFixed(2)),
                Writing: parseFloat((s.Writing / count).toFixed(2)),
                Numeracy: parseFloat((s.Numeracy / count).toFixed(2)),
            };
        });

        // Finalize Category Data for Pie Charts
        const processedCategories = {};
        ['Reading', 'Writing', 'Numeracy'].forEach(sub => {
            processedCategories[sub] = Object.keys(categories[sub]).map(cat => ({
                name: cat,
                value: categories[sub][cat]
            }));
        });

        return {
            wardScores: wardScoresArr,
            mediumScores: mediumScoresArr,
            categoryData: processedCategories,
            highestWard,
            lowestWard
        };
    }, [data]);

    return (
        <div className="space-y-8">

            {/* 1. Ward Wise Learning Levels */}
            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h3 className="text-lg font-semibold text-secondary">1. Ward Wise Learning Levels (Avg Score)</h3>
                    <div className="flex gap-4 text-sm mt-2 md:mt-0">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-200">
                            🏆 Highest: <strong>{highestWard}</strong>
                        </span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full border border-red-200">
                            ⚠️ Lowest: <strong>{lowestWard}</strong>
                        </span>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={wardScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="Ward" axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 5]} axisLine={false} tickLine={false} label={{ value: 'Avg Score (0-5)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="Reading" fill="#3498DB" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Writing" fill="#9B59B6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Numeracy" fill="#E67E22" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Medium Wise Trends */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-secondary mb-6">2. Medium Wise Trends</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mediumScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="Medium" axisLine={false} tickLine={false} padding={{ left: 30, right: 30 }} />
                            <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Reading" stroke="#3498DB" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="Writing" stroke="#9B59B6" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="Numeracy" stroke="#E67E22" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Category Overview */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-secondary mb-2">3. Category Overview</h3>
                <p className="text-sm text-gray-500 mb-6 flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Progressive (L4-L5)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Developing (L2-L3)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Needs Improvement (L0-L1)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Reading', 'Writing', 'Numeracy'].map(sub => (
                        <div key={sub} className="flex flex-col items-center">
                            <h4 className="font-semibold text-gray-700 mb-2">{sub}</h4>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData[sub]}
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {categoryData[sub] && categoryData[sub].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ComparativeViews;
