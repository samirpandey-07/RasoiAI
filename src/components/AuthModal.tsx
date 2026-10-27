import React, { useState } from 'react';
import { ChefHat, Mail, Lock, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userEmail: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSupabase = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabase) {
      // Local Guest Auth
      onAuthSuccess(email || 'chef@smartkitchen.ai');
      onClose();
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Supabase client unavailable. Please check settings.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Account created! Please check your email for confirmation link.');
        if (data.user) {
          onAuthSuccess(data.user.email || email);
          setTimeout(onClose, 1500);
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user.email || email);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E2EBE5] p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mx-auto shadow-sm">
            <ChefHat className="w-6 h-6 text-[#E7EFEA]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#143628]">
            {isSignUp ? 'Create Smart Kitchen Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-stone-500">
            {isSupabase
              ? 'Sign in with your Supabase account to sync your kitchen across all devices.'
              : 'Local Mode Active: You can continue as Guest or test signing in.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143628] transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="pt-2 text-center space-y-2 border-t border-stone-100">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-stone-600 hover:text-[#1B4332] font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>

          <div>
            <button
              onClick={() => {
                onAuthSuccess('guest_chef@kitchen.local');
                onClose();
              }}
              className="text-xs text-stone-400 hover:text-stone-700 underline"
            >
              Continue as Guest (No account needed)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
