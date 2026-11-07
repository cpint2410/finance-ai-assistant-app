import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Wallet, TrendingUp, ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await login();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center relative z-10 py-12">
        
        {/* Left Hand: Hero / Features */}
        <div className="md:col-span-7 space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Introducing FinTrack flagship dashboard</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Track your wealth, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300">
                master your budget.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto md:mx-0">
              A comprehensive financial workspace. Record income, split categories, map monthly budgets, and see real-time graphical trend reports.
            </p>
          </div>

          {/* Features check */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto md:mx-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0 border border-indigo-100/30">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Real-Time Spending Graphs</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Visualize expenses by category & monthly progress.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 border border-emerald-100/30">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Secure Workspace Auth</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Industry-standard secure Firebase Google Authentication.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: Login Form Panel */}
        <div className="md:col-span-5 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800 space-y-8"
          >
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-100 dark:shadow-none">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-sm text-slate-400 dark:text-slate-500">Connect your account safely using Google Sign-In</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-1 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-slate-700 dark:text-slate-200">Sign in with Google</span>
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-300 dark:text-slate-600 text-xs uppercase font-bold tracking-wider">🔒 Protected Area</span>
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            </div>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              By signing in, you are securely synchronized into our PostgreSQL database instance. No credentials or codes are exposed.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
