import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { User, Lock, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { RayvenLogo } from '../components/RayvenLogo';

interface AuthPagesProps {
  mode: 'login' | 'register';
  onNavigate: (path: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode, onNavigate }) => {
  const { switchUserRole } = useAuth();
  const { showToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Read query parameters for pre-filled email and signup success message
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      const registeredParam = urlParams.get('registered');

      if (emailParam) {
        setEmail(emailParam);
      }

      if (mode === 'login' && (registeredParam === 'true' || urlParams.has('signup_success'))) {
        setSuccessMessage(
          'Your account has been created. Please check your email and verify your address before logging in.'
        );
      } else {
        setSuccessMessage(null);
      }
    } catch {
      // Fallback gracefully
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        setIsLoading(false);

        if (authError) {
          setError(authError.message);
        } else if (data?.user) {
          showToast('Welcome back to RAYVEN!', 'success');
          onNavigate('/');
        }
      } else {
        const targetEmail = email.trim();
        const { data, error: authError } = await supabase.auth.signUp({
          email: targetEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
            },
          },
        });

        setIsLoading(false);

        if (authError) {
          setError(authError.message);
        } else if (data) {
          // Explicitly sign out so user is not automatically logged in before verification
          try {
            await supabase.auth.signOut();
          } catch {
            // Ignore signout error
          }

          showToast('Account created! Please check your email to verify.', 'success');
          // Redirect to sign in with pre-filled email & registered banner flag
          onNavigate(`/login?email=${encodeURIComponent(targetEmail)}&registered=true`);
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to initialize Google authentication.');
    }
  };

  const handleDemoLogin = (role: 'admin' | 'customer') => {
    switchUserRole(role);
    showToast(`Logged in as ${role === 'admin' ? 'Store Administrator' : 'Customer'}`, 'success');
    if (role === 'admin') {
      onNavigate('/admin');
    } else {
      onNavigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-[#1F2024]">
      {/* Brand Icon Header */}
      <div className="text-center space-y-3 flex flex-col items-center">
        <RayvenLogo size="lg" />
        <h1 className="font-display text-2xl sm:text-3xl font-black text-[#1F2024] uppercase tracking-tight">
          {mode === 'login' ? 'Welcome to RAYVEN' : 'Join The Squad'}
        </h1>
        <p className="text-xs text-zinc-600 max-w-sm">
          {mode === 'login'
            ? 'Sign in to access your orders, saved jerseys, and profile.'
            : 'Create an account to track match kit shipments and enjoy member rewards.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] shadow-xl shadow-purple-900/5 space-y-5">
        {/* Verification Success Banner on Sign In */}
        {mode === 'login' && successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
                Account Created Successfully
              </p>
              <p className="leading-relaxed text-zinc-700">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shakib Ahmed"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1F2024] placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1F2024] placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
                Phone Number (Bangladesh)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1F2024] placeholder-zinc-400 font-mono focus:outline-none focus:border-[#6D35C8]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1F2024] placeholder-zinc-400 focus:outline-none focus:border-[#6D35C8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#6D35C8] hover:bg-[#4B218A] disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-[0.98] shadow-md shadow-purple-900/20 cursor-pointer"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In to Account'
              : 'Create My Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E3]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-400">
            <span className="bg-white px-2">OR</span>
          </div>
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[#F7F7F5] hover:bg-[#EFEFEA] active:bg-[#E5E5E0] disabled:opacity-50 text-[#1F2024] font-bold rounded-xl text-xs border border-[#E5E5E3] flex items-center justify-center gap-3 transition cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        {/* Toggle between login and register */}
        <div className="text-center pt-2 text-xs text-zinc-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="text-[#6D35C8] font-bold hover:underline cursor-pointer"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already a member?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="text-[#6D35C8] font-bold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="pt-4 border-t border-[#E5E5E3] space-y-2">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold text-center">
            One-Click Instant Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="py-2 px-3 bg-[#F7F7F5] hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold border border-[#E5E5E3] transition cursor-pointer"
            >
              👤 Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-3 bg-[#F3EEFC] hover:bg-[#8B5AD9]/20 text-[#6D35C8] rounded-xl text-xs font-bold border border-[#8B5AD9]/30 transition cursor-pointer"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
