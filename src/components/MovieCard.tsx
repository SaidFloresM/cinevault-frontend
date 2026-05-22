import { Star, Clock, Calendar } from 'lucide-react';
import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const posterFallback = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <button
      onClick={() => onClick(movie)}
      className="group relative bg-neutral-900 rounded-lg overflow-hidden text-left w-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-800">
        <img
          src={movie.poster_url || posterFallback}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).src = posterFallback; }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-amber-400">
          <Star size={10} fill="currentColor" />
          {Number(movie.rating).toFixed(1)}
        </div>

        {/* Category badge */}
        {movie.categories && (
          <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white">
            {movie.categories.name}
          </div>
        )}

        {/* Hover info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">{movie.description}</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 group-hover:text-red-400 transition-colors mb-2">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 text-neutral-500 text-xs">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {movie.release_year}
          </span>
          {movie.duration_minutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {movie.duration_minutes}m
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
