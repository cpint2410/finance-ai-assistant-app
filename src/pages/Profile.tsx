import { apiFetch } from '../lib/api';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Category } from '../types.ts';
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Palette, 
  Sparkles, 
  Edit2, 
  Lock,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  onNotify: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNotify }) => {
  const { user, dbUser, token, refreshProfile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setNameInput(dbUser.name || '');
    }
  }, [dbUser]);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const response = await apiFetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!nameInput.trim()) {
      onNotify('Name cannot be empty.', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await apiFetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nameInput.trim() }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to update name.');
      }

      if (json.success) {
        onNotify('Profile updated successfully!', 'success');
        setEditingName(false);
        await refreshProfile(); // Refresh dbUser in context
      }
    } catch (err: any) {
      onNotify(err.message || 'Error saving changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const userDisplayName = dbUser?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const creationDate = dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Recently';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
          Profile & Account Settings
        </h2>
        <p className="text-sm text-gray-400">
          Manage your synchronized profile details and view taxonomy configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Card */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#111111] p-6 rounded-2xl border border-[#262626] space-y-6 text-center relative overflow-hidden">
            {/* Ambient blur */}
            <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600" />

            <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-[#262626] flex items-center justify-center mx-auto text-indigo-400 text-3xl font-bold font-display shadow-inner">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-2">
              {editingName ? (
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-1.5 rounded-lg border border-[#262626] bg-[#0A0A0A] text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingName(false)}
                      className="px-3 py-1 rounded-lg border border-[#262626] text-[11px] font-semibold text-gray-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-1.5 group">
                  <h3 className="text-lg font-bold text-white">
                    {userDisplayName}
                  </h3>
                  <button
                    onClick={() => {
                      if (dbUser) setNameInput(dbUser.name || '');
                      setEditingName(true);
                    }}
                    className="p-1 rounded text-gray-500 hover:text-white transition-all cursor-pointer"
                    title="Change name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <div className="border-t border-[#262626] pt-5 text-left space-y-3.5 text-xs font-semibold">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>Verified Google Account</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500 ml-auto" />
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Registered:</span>
                <span className="font-bold text-white ml-auto">{creationDate}</span>
              </div>
            </div>
          </div>

          {/* Security details card */}
          <div className="bg-[#111111]/30 p-5 rounded-2xl border border-[#262626] space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">ðŸ”’ Database Credentials</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Your profile is secured on our Google Cloud Run environment utilizing connection pooling and Firebase ID signature encryption tokens. No raw credentials or secret files are ever downloaded or stored in the browser.
            </p>
          </div>
        </div>

        {/* Right Side: Category Taxonomy Map */}
        <div className="md:col-span-7">
          <div className="bg-[#111111] p-6 rounded-2xl border border-[#262626] shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-display font-bold text-white tracking-tight">
                Taxonomy & Categories Configuration
              </h3>
              <p className="text-xs text-gray-500">
                Manage your transaction grouping taxonomies. Custom categories are created specific to your account, while system defaults are locked globally.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isCustom = cat.userId !== null;
                return (
                  <div 
                    key={cat.id} 
                    className="p-3.5 rounded-xl border border-[#262626] flex items-center justify-between gap-4 bg-[#0A0A0A]/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div>
                        <p className="text-xs font-bold text-white">{cat.name}</p>
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{cat.type}</span>
                      </div>
                    </div>

                    <div>
                      {isCustom ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400">
                          <Sparkles className="w-3 h-3" />
                          Custom Category
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-bold text-gray-500">
                          <Lock className="w-3 h-3" />
                          System Default
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

