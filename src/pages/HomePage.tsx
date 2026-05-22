import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import MovieCard from '../components/MovieCard';
import GenreFilter from '../components/GenreFilter';
import MovieModal from '../components/MovieModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMovies } from '../hooks/useMovies';
import { useGenres } from '../hooks/useGenres';
import type { Movie, Page } from '../types';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { movies: featured } = useMovies({ featured: true, limit: 4 });
  const { movies, loading, loadingMore, hasMore, loadMore } = useMovies({ limit: 8 });
  const { genres } = useGenres();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const filteredMovies = selectedGenre
    ? movies.filter(m => m.category_id === selectedGenre)
    : movies;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero */}
      {featured.length > 0 && (
        <HeroSection movies={featured} onSelectMovie={setSelectedMovie} />
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">Catálogo</h2>
          <button
            onClick={() => onNavigate('movies')}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
          >
            Ver todo <ChevronRight size={16} />
          </button>
        </div>

        {/* Genre filter */}
        <div className="mb-8 overflow-x-auto pb-2 -mx-1 px-1">
          <GenreFilter genres={genres} selected={selectedGenre} onChange={setSelectedGenre} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p>No hay películas en esta categoría.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />
              ))}
            </div>

            {!selectedGenre && hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <LoadingSpinner size="sm" /> : 'Cargar más películas'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}
