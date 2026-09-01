import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RayvenLogo } from '../../components/RayvenLogo';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onNavigateStore?: (path: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onNavigateStore }) => {
  const { adminLogin, resetPassword, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forgot Password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both administrative email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await adminLogin(email, password);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    if (!resetEmail.trim()) {
      setResetStatus({ error: 'Please provide your admin email.' });
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(resetEmail);
    setIsResetting(false);

    if (res.success) {
      setResetStatus({ success: true, message: res.message || 'Reset link sent to your email.' });
    } else {
      setResetStatus({ error: res.error || 'Failed to send reset email.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans selection:bg-[#6D35C8] selection:text-white text-[#1F2024]">
      {/* Return to Store Link */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => onNavigateStore ? onNavigateStore('/') : (window.location.href = '/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-[#E5E5E3] transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 flex flex-col items-center">
        {/* Brand Logo */}
        <div className="mb-4">
          <RayvenLogo size="lg" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#1F2024] uppercase">
          RAYVEN COMMAND CENTER
        </h2>
        <p className="mt-1 text-xs text-zinc-500 font-medium">
          Authorized Store Personnel Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-purple-900/5 rounded-3xl border border-[#E5E5E3]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authorization Error</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Admin Email / Username
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rayven.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#F7F7F5] border border-zinc-300 rounded-xl text-xs font-medium text-[#1F2024] placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#6D35C8] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Secure Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setForgotPasswordOpen(true);
                  }}
                  className="text-xs font-bold text-[#6D35C8] hover:text-[#4B218A] transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-[#F7F7F5] border border-zinc-300 rounded-xl text-xs font-medium text-[#1F2024] placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#6D35C8] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-signin-btn"
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#6D35C8] hover:bg-[#4B218A] active:scale-[0.99] transition shadow-md shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In To Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5E5E3] text-center">
            <p className="text-[11px] text-zinc-400">
              Role-Based Access Control enforced with Supabase RLS policies.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E5E5E3]">
            <h3 className="text-lg font-bold text-[#1F2024] mb-1">Reset Admin Password</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Enter your registered administrator email. We will dispatch secure credentials recovery instructions.
            </p>

            {resetStatus?.error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {resetStatus.error}
              </div>
            )}

            {resetStatus?.success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="admin@rayven.com"
                className="w-full px-3.5 py-2.5 bg-[#F7F7F5] border border-zinc-300 rounded-xl text-xs text-[#1F2024] focus:bg-white focus:border-[#6D35C8] focus:outline-none"
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase text-white bg-[#6D35C8] hover:bg-[#4B218A] transition cursor-pointer shadow-xs"
                >
                  {isResetting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
