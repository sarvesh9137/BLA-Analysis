import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, BookOpen, BarChart2, School, LogOut } from 'lucide-react';

import WardAttendance from './components/WardAttendance';
import MediumDistribution from './components/MediumDistribution';
import ClassAttendance from './components/ClassAttendance';
import LearningLevel from './components/LearningLevel';
import ComparativeViews from './components/ComparativeViews';

const Dashboard = ({ onLogout }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ward');

    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(jsonData => {
                setData(jsonData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading data:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'ward', label: 'Ward Attendance', icon: MapIcon },
        { id: 'medium', label: 'Medium Dist.', icon: Users },
        { id: 'class', label: 'Class Attendance', icon: School },
        { id: 'learning', label: 'Learning Levels', icon: BookOpen },
        { id: 'comparative', label: 'Comparative', icon: BarChart2 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                        <div className="hidden md:block w-px h-8 bg-slate-300 mx-2"></div>
                        <h1 className="text-xl font-bold text-primary hidden md:block">
                            Utthan Baseline Assessment Analysis
                        </h1>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300
                ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-blue-500/30 translate-y-[-2px]'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
              `}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'ward' && <WardAttendance data={data} />}
                        {activeTab === 'medium' && <MediumDistribution data={data} />}
                        {activeTab === 'class' && <ClassAttendance data={data} />}
                        {activeTab === 'learning' && <LearningLevel data={data} />}
                        {activeTab === 'comparative' && <ComparativeViews data={data} />}
                    </motion.div>
                </AnimatePresence>

            </main>
        </div>
    );
};

// Simple Icon wrapper since Lucide doesn't have MapIcon sometimes named differently or I want a custom one
const MapIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
);

export default Dashboard;
