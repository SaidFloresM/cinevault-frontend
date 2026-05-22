export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  release_year: number;
  duration_minutes: number;
  category_id: string | null;
  director: string;
  cast_list: string[];
  rating: number;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

export interface MoviesResponse {
  movies: Movie[];
  total: number;
  page: number;
  limit: number;
}

export type Page = 'home' | 'movies' | 'login' | 'register' | 'admin';
