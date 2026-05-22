import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, API_BASE } from '../lib/supabase';
import type { UserProfile, AuthState } from '../types';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.access_token);
      } else {
        setState({ user: null, token: null, loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.access_token);
      } else {
        setState({ user: null, token: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(token: string) {
    try {
      const res = await fetch(`${API_BASE}/auth-api/me`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const profile: UserProfile = await res.json();
        setState({ user: profile, token, loading: false });
      } else {
        setState({ user: null, token: null, loading: false });
      }
    } catch {
      setState({ user: null, token: null, loading: false });
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth-api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Login failed' };

    setState({ user: data.user, token: data.access_token, loading: false });
    await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
    return {};
  }

  async function register(email: string, password: string, username: string) {
    const res = await fetch(`${API_BASE}/auth-api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Registration failed' };
    return {};
  }

  async function logout() {
    await supabase.auth.signOut();
    setState({ user: null, token: null, loading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
