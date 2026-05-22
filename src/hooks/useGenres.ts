import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';

export function useGenres() {
  const { token } = useAuth();
  const [genres, setGenres] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/genres`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setGenres(data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return { genres, loading };
}
