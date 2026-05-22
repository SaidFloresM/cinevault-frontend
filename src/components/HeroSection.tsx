import { Play, Star, Clock, Info } from 'lucide-react';
import type { Movie } from '../types';

interface HeroSectionProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export default function HeroSection({ movies, onSelectMovie }: HeroSectionProps) {
  const featured = movies[0];
  if (!featured) return null;

  const backdrop = featured.backdrop_url || featured.poster_url || 'https://images.pexels.com/photos/7234267/pexels-photo-7234267.jpeg?auto=compress&cs=tinysrgb&w=1280';

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={backdrop}
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-xl">
          {featured.categories && (
            <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded uppercase tracking-wider mb-4">
              {featured.categories.name}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-3">
            {featured.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-neutral-300 mb-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Star size={14} fill="currentColor" />
              {Number(featured.rating).toFixed(1)}
            </span>
            <span>{featured.release_year}</span>
            {featured.duration_minutes > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {featured.duration_minutes} min
              </span>
            )}
            {featured.director && <span>Dir. {featured.director}</span>}
          </div>

          <p className="text-neutral-300 text-sm leading-relaxed mb-6 line-clamp-3 max-w-md">
            {featured.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectMovie(featured)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded text-sm hover:bg-neutral-200 transition-colors"
            >
              <Play size={16} fill="currentColor" />
              Ver detalles
            </button>
            <button
              onClick={() => onSelectMovie(featured)}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-700/70 text-white font-semibold rounded text-sm hover:bg-neutral-600/70 transition-colors backdrop-blur-sm"
            >
              <Info size={16} />
              Más info
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {movies.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:right-8 hidden md:flex gap-2">
          {movies.slice(1, 4).map(movie => (
            <button
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="group relative w-20 h-28 rounded overflow-hidden border border-neutral-700 hover:border-red-500 transition-colors"
            >
              <img
                src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=200'}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
