import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
    Present: '#2ecc71',
    Absent: '#e74c3c',
    'Long Absent': '#f1c40f',
    NA: '#95a5a6'
};

const ClassAttendance = ({ data }) => {
    const { tableData, chartData } = useMemo(() => {
        if (!data || data.length === 0) return { tableData: [], chartData: {} };

        // Group by Class and Attendance
        const classGroups = {};
        const classes = ['I', 'II', 'III', 'IV'];

        data.forEach(row => {
            const cls = row['Class'] || 'Unknown';
            const status = row['Attendance'] || 'NA';

            if (!classGroups[cls]) classGroups[cls] = { Class: cls, Present: 0, Absent: 0, 'Long Absent': 0, NA: 0, Total: 0 };

            if (classGroups[cls][status] !== undefined) {
                classGroups[cls][status]++;
            } else {
                classGroups[cls][status] = (classGroups[cls][status] || 0) + 1;
            }
            classGroups[cls].Total++;
        });

        const tableData = Object.values(classGroups).sort((a, b) => {
            // Sort Roman Numerals roughly
            const order = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
            return (order[a.Class] || 99) - (order[b.Class] || 99);
        });

        const chartData = {};
        classes.forEach(cls => {
            if (classGroups[cls]) {
                chartData[cls] = [
                    { name: 'Present', value: classGroups[cls].Present },
                    { name: 'Absent', value: classGroups[cls].Absent },
                    { name: 'Long Absent', value: classGroups[cls]['Long Absent'] },
                ].filter(d => d.value > 0);
            } else {
                chartData[cls] = [];
            }
        });

        return { tableData, chartData };
    }, [data]);

    return (
        <div className="space-y-8">

            {/* Table */}
            <div className="glass-card p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-secondary mb-4">🏫 Class Wise Attendance Table</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full text-sm text-center">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Class</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3 text-green-600">Present</th>
                                <th className="px-4 py-3 text-red-600">Absent</th>
                                <th className="px-4 py-3 text-yellow-600">Long Absent</th>
                                <th className="px-4 py-3 text-gray-400">NA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tableData.map((row) => (
                                <tr key={row.Class} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-left text-slate-700">{row.Class}</td>
                                    <td className="px-4 py-3 font-semibold">{row.Total}</td>
                                    <td className="px-4 py-3">{row.Present}</td>
                                    <td className="px-4 py-3">{row.Absent}</td>
                                    <td className="px-4 py-3">{row['Long Absent']}</td>
                                    <td className="px-4 py-3 text-gray-400">{row.NA}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['I', 'II', 'III', 'IV'].map(cls => (
                    <div key={cls} className="glass-card p-4 hover-3d flex flex-col items-center">
                        <h4 className="font-semibold text-secondary mb-2">Class {cls}</h4>
                        <div className="h-40 w-full">
                            {chartData[cls] && chartData[cls].length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData[cls]}
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData[cls].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400">No Data</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ClassAttendance;
