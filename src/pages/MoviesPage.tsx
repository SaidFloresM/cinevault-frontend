import { useState } from 'react';
import { Search } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import GenreFilter from '../components/GenreFilter';
import MovieModal from '../components/MovieModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMovies } from '../hooks/useMovies';
import { useGenres } from '../hooks/useGenres';
import type { Movie } from '../types';

export default function MoviesPage() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { movies, loading, loadingMore, hasMore, loadMore } = useMovies({
    categoryId: selectedGenre ?? undefined,
    limit: 12,
  });
  const { genres } = useGenres();

  const filtered = search.trim()
    ? movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.director.toLowerCase().includes(search.toLowerCase()))
    : movies;

  function handleGenreChange(id: string | null) {
    setSelectedGenre(id);
    setSearch('');
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Películas</h1>
          <p className="text-neutral-500 text-sm">Explora nuestro catálogo completo</p>
        </div>

        {/* Search + filters */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título o director..."
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <GenreFilter genres={genres} selected={selectedGenre} onChange={handleGenreChange} />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-neutral-500 text-sm mb-6">
            {filtered.length} película{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-500 text-lg mb-2">Sin resultados</p>
            <p className="text-neutral-600 text-sm">Intenta con otro término o categoría</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />
              ))}
            </div>

            {!search && hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <LoadingSpinner size="sm" /> : 'Cargar más'}
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
