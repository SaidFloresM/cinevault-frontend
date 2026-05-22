import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Movie } from '../types';

interface UseMoviesOptions {
  categoryId?: string;
  featured?: boolean;
  limit?: number;
}

export function useMovies(options: UseMoviesOptions = {}) {
  const { token } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = options.limit ?? 8;

  const fetchMovies = useCallback(async (p: number, replace: boolean) => {
    if (!token) return;
    p === 1 ? setLoading(true) : setLoadingMore(true);

    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (options.categoryId) params.set('category', options.categoryId);
    if (options.featured) params.set('featured', 'true');

    try {
      const res = await fetch(`${API_BASE}/movies?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMovies(prev => replace ? data.movies : [...prev, ...data.movies]);
      setTotal(data.total ?? 0);
      setPage(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load movies');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, options.categoryId, options.featured, limit]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMovies(1, true);
  }, [fetchMovies]);

  function loadMore() {
    fetchMovies(page + 1, false);
  }

  const hasMore = movies.length < total;

  return { movies, total, loading, loadingMore, error, loadMore, hasMore, refetch: () => fetchMovies(1, true) };
}

export function useMovie(id: string) {
  const { token } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    fetch(`${API_BASE}/movies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setMovie(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  return { movie, loading, error };
}
