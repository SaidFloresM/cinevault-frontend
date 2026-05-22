import { useEffect } from 'react';
import { X, Star, Clock, Calendar, User, Tag } from 'lucide-react';
import type { Movie } from '../types';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  useEffect(() => {
    if (!movie) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [movie, onClose]);

  if (!movie) return null;

  const backdrop = movie.backdrop_url || movie.poster_url || 'https://images.pexels.com/photos/7234267/pexels-photo-7234267.jpeg?auto=compress&cs=tinysrgb&w=1280';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-neutral-900 rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Backdrop */}
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <img
            src={backdrop}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          {/* Poster overlay */}
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <div className="w-20 h-28 rounded-lg overflow-hidden border-2 border-neutral-700 shadow-xl flex-shrink-0">
              <img
                src={movie.poster_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=200'}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pb-1">
              <h2 className="text-white text-xl font-bold leading-tight">{movie.title}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={13} className="text-amber-400" fill="currentColor" />
                <span className="text-amber-400 font-semibold text-sm">{Number(movie.rating).toFixed(1)}</span>
                <span className="text-neutral-500 text-sm">/ 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.categories && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 text-red-400 text-xs font-medium rounded-full border border-red-600/30">
                <Tag size={10} /> {movie.categories.name}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full">
              <Calendar size={10} /> {movie.release_year}
            </span>
            {movie.duration_minutes > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full">
                <Clock size={10} /> {movie.duration_minutes} min
              </span>
            )}
          </div>

          {/* Description */}
          {movie.description && (
            <p className="text-neutral-300 text-sm leading-relaxed mb-5">{movie.description}</p>
          )}

          {/* Director & Cast */}
          <div className="space-y-3 border-t border-neutral-800 pt-4">
            {movie.director && (
              <div className="flex items-start gap-3">
                <span className="text-neutral-500 text-xs w-20 flex-shrink-0 pt-0.5 uppercase tracking-wider">Director</span>
                <span className="text-neutral-200 text-sm">{movie.director}</span>
              </div>
            )}
            {movie.cast_list && movie.cast_list.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-neutral-500 text-xs w-20 flex-shrink-0 pt-0.5 uppercase tracking-wider">Reparto</span>
                <div className="flex flex-wrap gap-1.5">
                  {movie.cast_list.map((actor, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-neutral-800 text-neutral-300 text-xs rounded">
                      <User size={9} /> {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
