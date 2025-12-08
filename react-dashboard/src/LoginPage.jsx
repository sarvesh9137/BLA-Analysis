import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LoginPage = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === 'adani123') {
            onLogin();
        } else {
            setError('😕 Password incorrect');
            const form = document.getElementById('login-form');
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="glass-card p-8 md:p-12 max-w-md w-full relative overflow-hidden"
            >
                {/* Background Decorative Blobs */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>

                <div className="flex justify-center mb-8">
                    <img src="/logo.png" alt="Utthan Logo" className="h-20 object-contain drop-shadow-md" />
                </div>

                <h2 className="text-3xl font-bold text-center text-secondary mb-2">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-8">Please enter your password to access the dashboard.</p>

                <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner bg-white/50 backdrop-blur-sm"
                        />
                        {error && <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full btn-3d text-lg py-3 shadow-lg shadow-blue-500/30"
                    >
                        Access Dashboard
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    Powered by Adani Foundation
                </div>
            </motion.div>

            <style>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
