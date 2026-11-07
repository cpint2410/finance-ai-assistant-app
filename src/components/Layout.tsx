import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  PiggyBank, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  TrendingUp,
  Wallet,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'forecast' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'forecast' | 'profile') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, dbUser, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = window.document.body;
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: 'Statements & Predict', icon: Sparkles },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ] as const;

  const userDisplayName = dbUser?.name || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0D0D0D] border-r border-[#262626] shrink-0">
        <div className="p-8 flex items-center gap-3 border-b border-[#262626]">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold tracking-tight text-white text-lg">FinTrack</h1>
            <p className="text-xs text-gray-500 font-medium">Flagship Portfolio</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A1A] text-indigo-400 shadow-sm border border-[#262626]'
                    : 'text-gray-400 hover:bg-[#161616] hover:text-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#262626] space-y-4 bg-[#0D0D0D]">
          <div className="flex items-center gap-3 bg-[#161616] p-3 rounded-xl border border-[#262626]">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-semibold border border-indigo-500/20">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white leading-tight">
                {userDisplayName}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                PRO Plan
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={logout}
              className="w-full py-2.5 px-3 rounded-xl border border-[#262626] flex items-center justify-center gap-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden bg-[#0D0D0D] border-b border-[#262626] py-4 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="font-display font-bold tracking-tight text-white">FinTrack</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-400 hover:bg-[#161616]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-[65px] bg-[#0D0D0D] border-b border-[#262626] shadow-xl z-30 py-4 px-6 space-y-4"
          >
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1A1A1A] text-indigo-400'
                        : 'text-gray-400 hover:bg-[#161616]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#262626] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-300 font-semibold">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white truncate max-w-[150px]">
                    {userDisplayName}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors border border-rose-950"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>

    </div>
  );
};
