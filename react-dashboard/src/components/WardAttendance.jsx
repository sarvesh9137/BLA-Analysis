import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = {
    Present: '#2ecc71',      // Green
    Absent: '#e74c3c',       // Red
    'Long Absent': '#f1c40f', // Yellow/Orange
    NA: '#95a5a6'            // Gray
};

const WardAttendance = ({ data }) => {
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return { tableData: [], chartData: [], overallData: [] };

        // Group by Ward and Attendance
        const wardGroups = {};
        const overallCounts = {};

        data.forEach(row => {
            const ward = row['Ward'] || 'Unknown';
            const status = row['Attendance'] || 'NA';

            if (!wardGroups[ward]) wardGroups[ward] = { Ward: ward, Present: 0, Absent: 0, 'Long Absent': 0, NA: 0, Total: 0 };
            if (!overallCounts[status]) overallCounts[status] = 0;

            if (wardGroups[ward][status] !== undefined) {
                wardGroups[ward][status]++;
            } else {
                // Handle unexpected status if any
                wardGroups[ward][status] = (wardGroups[ward][status] || 0) + 1;
            }
            wardGroups[ward].Total++;
            overallCounts[status]++;
        });

        // Format for Table and Bar Chart
        const tableData = Object.values(wardGroups).map((group, index) => ({
            ...group,
            id: index + 1,
            'Present%': group.Total ? ((group.Present / group.Total) * 100).toFixed(2) + '%' : '0.00%',
            'Absent%': group.Total ? ((group.Absent / group.Total) * 100).toFixed(2) + '%' : '0.00%',
            'Long Absent%': group.Total ? ((group['Long Absent'] / group.Total) * 100).toFixed(2) + '%' : '0.00%',
        })).sort((a, b) => a.Ward.localeCompare(b.Ward));

        // Format for Pie Chart
        const overallData = Object.keys(overallCounts).map(status => ({
            name: status,
            value: overallCounts[status]
        }));

        return { tableData, overallData };
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Table Section */}
                <div className="glass-card p-6 lg:col-span-2 overflow-hidden">
                    <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                        📊 Ward Wise Attendance Table
                    </h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Ward</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-right text-green-600">Present</th>
                                    <th className="px-4 py-3 text-right text-green-600">%</th>
                                    <th className="px-4 py-3 text-right text-red-600">Absent</th>
                                    <th className="px-4 py-3 text-right text-red-600">%</th>
                                    <th className="px-4 py-3 text-right text-yellow-600">Long Absent</th>
                                    <th className="px-4 py-3 text-right text-yellow-600">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {processedData.tableData.map((row) => (
                                    <tr key={row.Ward} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-400">{row.id}</td>
                                        <td className="px-4 py-3 font-medium text-slate-700">{row.Ward}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{row.Total}</td>
                                        <td className="px-4 py-3 text-right">{row.Present}</td>
                                        <td className="px-4 py-3 text-right text-slate-500">{row['Present%']}</td>
                                        <td className="px-4 py-3 text-right">{row.Absent}</td>
                                        <td className="px-4 py-3 text-right text-slate-500">{row['Absent%']}</td>
                                        <td className="px-4 py-3 text-right">{row['Long Absent']}</td>
                                        <td className="px-4 py-3 text-right text-slate-500">{row['Long Absent%']}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bar Chart Section */}
                <div className="glass-card p-6 hover-3d">
                    <h3 className="text-lg font-semibold text-secondary mb-4">Ward Wise Distribution</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedData.tableData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="Ward" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="Present" stackId="a" fill={COLORS.Present} radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Absent" stackId="a" fill={COLORS.Absent} />
                                <Bar dataKey="Long Absent" stackId="a" fill={COLORS['Long Absent']} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart Section */}
                <div className="glass-card p-6 hover-3d">
                    <h3 className="text-lg font-semibold text-secondary mb-4">Overall Attendance</h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={processedData.overallData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {processedData.overallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.NA} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WardAttendance;
