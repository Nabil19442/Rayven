import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { db } from '../lib/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and synchronize authentication session
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession notice:', error.message);
          }

          if (session?.user) {
            // Fetch profile data and role from profiles table
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('id,email,role,full_name,phone,avatar_url,created_at')
              .eq('id', session.user.id)
              .single();

            if (profile && !profileErr) {
              const role: UserRole = profile.role as UserRole;
              const userProfile: UserProfile = {
                id: session.user.id,
                email: session.user.email || profile.email || '',
                full_name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                phone: profile.phone || session.user.user_metadata?.phone || '',
                role,
                avatar_url: profile.avatar_url || session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
                created_at: profile.created_at || session.user.created_at || new Date().toISOString(),
              };

              if (isMounted) {
                setUser(userProfile);
                db.setCurrentUser(userProfile);
              }
            } else {
              // Profile not found in database: clear session
              if (isMounted) {
                setUser(null);
                db.setCurrentUser(null);
              }
            }
          } else {
            // No active session: ensure state is cleared (no fake session restoration)
            if (isMounted) {
              setUser(null);
              db.setCurrentUser(null);
            }
          }

          // Listen to Supabase auth events
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session?.user) {
              if (isMounted) {
                setUser(null);
                db.setCurrentUser(null);
              }
            } else if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id,email,role,full_name,phone,avatar_url,created_at')
                .eq('id', session.user.id)
                .single();

              if (profile) {
                const role: UserRole = profile.role as UserRole;
                const userProfile: UserProfile = {
                  id: session.user.id,
                  email: session.user.email || profile.email || '',
                  full_name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  phone: profile.phone || session.user.user_metadata?.phone || '',
                  role,
                  avatar_url: profile.avatar_url || session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
                  created_at: profile.created_at || session.user.created_at || new Date().toISOString(),
                };

                if (isMounted) {
                  setUser(userProfile);
                  db.setCurrentUser(userProfile);
                }
              } else {
                if (isMounted) {
                  setUser(null);
                  db.setCurrentUser(null);
                }
              }
            }
          });

          return () => subscription.unsubscribe();
        } else {
          if (isMounted) {
            setUser(null);
            db.setCurrentUser(null);
          }
        }
      } catch (err) {
        console.warn('Auth initialization check error:', err);
        if (isMounted) {
          setUser(null);
          db.setCurrentUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Customer Login
   */
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        if (!password) {
          setIsLoading(false);
          return { success: false, error: 'Password is required.' };
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const role: UserRole = profile?.role || (data.user.user_metadata?.role as UserRole) || 'customer';
          const userProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
            phone: profile?.phone || data.user.user_metadata?.phone || '',
            role,
            avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
            created_at: data.user.created_at || new Date().toISOString(),
          };

          setUser(userProfile);
          db.setCurrentUser(userProfile);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local / Offline authentication handling
      if (!email || !email.includes('@')) {
        setIsLoading(false);
        return { success: false, error: 'Please provide a valid email address.' };
      }

      const cleanEmail = email.trim().toLowerCase();
      const customUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        full_name: cleanEmail.split('@')[0].toUpperCase(),
        phone: '01712345678',
        role: 'customer',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        created_at: new Date().toISOString(),
      };

      setUser(customUser);
      db.setCurrentUser(customUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  /**
   * Admin-Only Secure Login
   * Uses Supabase auth.signInWithPassword, validates session, and queries profiles for admin/super_admin.
   */
  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        throw new Error('Both email and password are required.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Admin authentication failed: No active session established.');
      }

      const userId = session.user.id;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id,email,role')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error('Admin profile does not exist in database.');
      }

      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Your account role is not admin or super_admin.');
      }

      const adminProfile: UserProfile = {
        id: profile.id,
        email: profile.email || session.user.email || cleanEmail,
        full_name: session.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        phone: session.user.user_metadata?.phone || '',
        role: profile.role as UserRole,
        avatar_url: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        created_at: session.user.created_at || new Date().toISOString(),
      };

      setUser(adminProfile);
      db.setCurrentUser(adminProfile);
      return { success: true };
    } catch (err: any) {
      setUser(null);
      db.setCurrentUser(null);
      return { success: false, error: err?.message || 'Admin authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Customer Registration
   */
  const register = async (name: string, email: string, phone: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: name,
              phone,
              role: 'customer',
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: name,
            phone,
            role: 'customer',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
            created_at: new Date().toISOString(),
          };

          setUser(newUser);
          db.setCurrentUser(newUser);
          setIsLoading(false);
          return { success: true };
        }
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        full_name: name,
        phone,
        role: 'customer',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      db.setCurrentUser(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  /**
   * Forgot Password / Reset Password
   */
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) return { success: false, error: 'Please enter your email.' };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) return { success: false, error: error.message };
      }

      return {
        success: true,
        message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`,
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send reset link.' };
    }
  };

  /**
   * Complete Sign Out
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    } finally {
      setUser(null);
      db.setCurrentUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data, updated_at: new Date().toISOString() };
    setUser(updated);
    db.setCurrentUser(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update(data).eq('id', user.id);
      } catch (err) {
        console.warn('Could not sync profile to Supabase:', err);
      }
    }
  };

  const isAdmin = Boolean(user && (user.role === 'admin' || user.role === 'super_admin'));
  const isSuperAdmin = Boolean(user && user.role === 'super_admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isSuperAdmin,
        login,
        adminLogin,
        register,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
