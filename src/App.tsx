import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { Layout } from './components/Layout.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { Login } from './pages/Login.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Transactions } from './pages/Transactions.tsx';
import { Budgets } from './pages/Budgets.tsx';
import { Reports } from './pages/Reports.tsx';
import { Profile } from './pages/Profile.tsx';
import { Forecast } from './pages/Forecast.tsx';

// Inner component that actually accesses the Auth Context
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'reports' | 'forecast' | 'profile'>('dashboard');
  
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    
    // Auto-remove toast after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col items-center justify-center space-y-4">
        {/* Modern high-contrast spinner */}
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold tracking-tight font-display">
          Establishing SSL Auth handshake...
        </p>
      </div>
    );
  }

  // If not logged in, render the login page
  if (!user) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* Tab rendering */}
      {activeTab === 'dashboard' && (
        <Dashboard 
          onAddTransactionSuccess={(msg) => addToast(msg, 'success')} 
          setActiveTab={setActiveTab}
        />
      )}
      
      {activeTab === 'transactions' && (
        <Transactions 
          onNotify={(text, type) => addToast(text, type)} 
        />
      )}
      
      {activeTab === 'budgets' && (
        <Budgets 
          onNotify={(text, type) => addToast(text, type)} 
        />
      )}
      
      {activeTab === 'reports' && (
        <Reports />
      )}
      
      {activeTab === 'forecast' && (
        <Forecast 
          onNotify={(text, type) => addToast(text, type)} 
        />
      )}

      {activeTab === 'profile' && (
        <Profile 
          onNotify={(text, type) => addToast(text, type)} 
        />
      )}

      {/* Global Toast Overlay */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
