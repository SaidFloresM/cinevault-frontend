import type { Category } from '../types';

interface GenreFilterProps {
  genres: Category[];
  selected: string | null;
  onChange: (id: string | null) => void;
}

export default function GenreFilter({ genres, selected, onChange }: GenreFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === null
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
        }`}
      >
        Todos
      </button>
      {genres.map(genre => (
        <button
          key={genre.id}
          onClick={() => onChange(genre.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === genre.id
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
