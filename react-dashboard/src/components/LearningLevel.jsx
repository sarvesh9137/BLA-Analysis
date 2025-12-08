import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Filter, X } from 'lucide-react';

const LEVEL_COLORS = {
    'L0': '#E74C3C', // Red
    'L1': '#E67E22', // Orange
    'L2': '#F1C40F', // Yellow
    'L3': '#F39C12', // Darker Yellow
    'L4': '#27AE60', // Green
    'L5': '#2ECC71'  // Light Green
};

const LearningLevel = ({ data }) => {
    const [filters, setFilters] = useState({ ward: [], class: [], school: [] });

    // Get unique options for filters
    const options = useMemo(() => {
        if (!data) return { wards: [], classes: [], schools: [] };
        const wards = [...new Set(data.map(d => d.Ward))].filter(Boolean).sort();
        const classes = [...new Set(data.map(d => d['Class']))].filter(Boolean).sort();
        const schools = [...new Set(data.map(d => d['School Name']))].filter(Boolean).sort();
        return { wards, classes, schools };
    }, [data]);

    // Filter Data
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(row => {
            if (filters.ward.length > 0 && !filters.ward.includes(row.Ward)) return false;
            if (filters.class.length > 0 && !filters.class.includes(row['Class'])) return false;
            if (filters.school.length > 0 && !filters.school.includes(row['School Name'])) return false;
            return true;
        });
    }, [data, filters]);

    // Process Stats for each subject
    const stats = useMemo(() => {
        const subjects = ['Reading', 'Writing', 'Numeracy'];
        const result = {};

        subjects.forEach(subject => {
            const counts = {};
            let total = 0;

            filteredData.forEach(row => {
                const level = row[subject];
                // Only count valid L0-L5
                if (['L0', 'L1', 'L2', 'L3', 'L4', 'L5'].includes(level)) {
                    counts[level] = (counts[level] || 0) + 1;
                    total++;
                }
            });

            const tableData = Object.keys(counts).map(level => ({
                Level: level,
                Count: counts[level],
                Percentage: ((counts[level] / total) * 100).toFixed(2) + '%'
            })).sort((a, b) => a.Level.localeCompare(b.Level)); // L0 to L5

            const chartData = tableData.map(d => ({ name: d.Level, value: d.Count }));

            result[subject] = { tableData, chartData };
        });

        return result;
    }, [filteredData]);

    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            const newValues = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [type]: newValues };
        });
    };

    const clearFilters = () => setFilters({ ward: [], class: [], school: [] });

    return (
        <div className="space-y-6">

            {/* Filters Section */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
                        <Filter size={18} /> Filters
                    </h3>
                    <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                        <X size={14} /> Clear All
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ward Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Ward</label>
                        <div className="h-32 overflow-y-auto border rounded-lg p-2 bg-slate-50 text-sm">
                            {options.wards.map(ward => (
                                <div key={ward} className="flex items-center gap-2 mb-1">
                                    <input
                                        type="checkbox"
                                        checked={filters.ward.includes(ward)}
                                        onChange={() => toggleFilter('ward', ward)}
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    <span>{ward}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Class Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Class</label>
                        <div className="h-32 overflow-y-auto border rounded-lg p-2 bg-slate-50 text-sm">
                            {options.classes.map(cls => (
                                <div key={cls} className="flex items-center gap-2 mb-1">
                                    <input
                                        type="checkbox"
                                        checked={filters.class.includes(cls)}
                                        onChange={() => toggleFilter('class', cls)}
                                    />
                                    <span>{cls}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* School Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">School</label>
                        <div className="h-32 overflow-y-auto border rounded-lg p-2 bg-slate-50 text-sm">
                            {options.schools.map(sch => (
                                <div key={sch} className="flex items-center gap-2 mb-1">
                                    <input
                                        type="checkbox"
                                        checked={filters.school.includes(sch)}
                                        onChange={() => toggleFilter('school', sch)}
                                    />
                                    <span className="truncate">{sch}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {['Reading', 'Writing', 'Numeracy'].map(subject => (
                    <div key={subject} className="space-y-4">
                        {/* Card */}
                        <div className="glass-card p-4 hover-3d flex flex-col h-full">
                            <h3 className="text-lg font-bold text-secondary text-center mb-4 border-b pb-2">{subject}</h3>

                            {/* Chart */}
                            <div className="h-48 w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats[subject].chartData}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {stats[subject].chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={LEVEL_COLORS[entry.name]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500">
                                        <tr>
                                            <th className="px-2 py-1 text-left">Level</th>
                                            <th className="px-2 py-1 text-right">Count</th>
                                            <th className="px-2 py-1 text-right">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats[subject].tableData.map(row => (
                                            <tr key={row.Level} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                <td className="px-2 py-2 font-medium">
                                                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: LEVEL_COLORS[row.Level] }}></span>
                                                    {row.Level}
                                                </td>
                                                <td className="px-2 py-2 text-right">{row.Count}</td>
                                                <td className="px-2 py-2 text-right text-slate-500">{row.Percentage}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default LearningLevel;
