import { useState, FormEvent } from 'react';
import { Plus, CreditCard as Edit2, Trash2, X, Save, Film, Star, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../hooks/useMovies';
import { useGenres } from '../hooks/useGenres';
import { API_BASE } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Movie, Page } from '../types';

interface AdminPageProps {
  onNavigate: (page: Page) => void;
}

interface MovieForm {
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  release_year: string;
  duration_minutes: string;
  category_id: string;
  director: string;
  cast_list: string;
  rating: string;
  is_featured: boolean;
}

const emptyForm: MovieForm = {
  title: '', description: '', poster_url: '', backdrop_url: '',
  release_year: String(new Date().getFullYear()), duration_minutes: '',
  category_id: '', director: '', cast_list: '', rating: '', is_featured: false,
};

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { user, token } = useAuth();
  const { movies, loading, refetch } = useMovies({ limit: 50 });
  const { genres } = useGenres();
  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 text-lg mb-4">Acceso restringido a administradores.</p>
          <button onClick={() => onNavigate('home')} className="text-red-500 hover:text-red-400">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(movie: Movie) {
    setForm({
      title: movie.title,
      description: movie.description,
      poster_url: movie.poster_url,
      backdrop_url: movie.backdrop_url || '',
      release_year: String(movie.release_year),
      duration_minutes: String(movie.duration_minutes),
      category_id: movie.category_id || '',
      director: movie.director,
      cast_list: (movie.cast_list || []).join(', '),
      rating: String(movie.rating),
      is_featured: movie.is_featured,
    });
    setEditingId(movie.id);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('El título es obligatorio'); return; }
    if (!form.release_year) { setFormError('El año es obligatorio'); return; }

    setSaving(true);
    setFormError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      poster_url: form.poster_url.trim(),
      backdrop_url: form.backdrop_url.trim(),
      release_year: parseInt(form.release_year),
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : 0,
      category_id: form.category_id || null,
      director: form.director.trim(),
      cast_list: form.cast_list ? form.cast_list.split(',').map(s => s.trim()).filter(Boolean) : [],
      rating: form.rating ? parseFloat(form.rating) : 0,
      is_featured: form.is_featured,
    };

    try {
      const url = editingId ? `${API_BASE}/movies/${editingId}` : `${API_BASE}/movies`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      closeForm();
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta película permanentemente?')) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/movies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      refetch();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold">Panel de administración</h1>
            <p className="text-neutral-500 text-sm mt-1">{movies.length} películas en el catálogo</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} /> Nueva película
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left text-xs text-neutral-500 font-medium uppercase tracking-wider px-6 py-4">Película</th>
                    <th className="text-left text-xs text-neutral-500 font-medium uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Categoría</th>
                    <th className="text-left text-xs text-neutral-500 font-medium uppercase tracking-wider px-4 py-4 hidden md:table-cell">Año</th>
                    <th className="text-left text-xs text-neutral-500 font-medium uppercase tracking-wider px-4 py-4 hidden lg:table-cell">Rating</th>
                    <th className="text-right text-xs text-neutral-500 font-medium uppercase tracking-wider px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {movies.map(movie => (
                    <tr key={movie.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded overflow-hidden bg-neutral-800 flex-shrink-0">
                            {movie.poster_url ? (
                              <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film size={16} className="text-neutral-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium line-clamp-1">{movie.title}</p>
                            {movie.director && <p className="text-neutral-500 text-xs mt-0.5">{movie.director}</p>}
                            {movie.is_featured && (
                              <span className="inline-block mt-1 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Destacada</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-neutral-400 text-sm">{movie.categories?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-neutral-400 text-sm">{movie.release_year}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-amber-400 text-sm">
                          <Star size={12} fill="currentColor" /> {Number(movie.rating).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(movie)}
                            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(movie.id)}
                            disabled={deletingId === movie.id}
                            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                          >
                            {deletingId === movie.id ? <LoadingSpinner size="sm" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={closeForm}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative z-10 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl my-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-white font-bold text-lg">
                {editingId ? 'Editar película' : 'Nueva película'}
              </h2>
              <button onClick={closeForm} className="text-neutral-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Título *</label>
                  <input
                    type="text" required value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Año *</label>
                  <input
                    type="number" required min={1888} max={2100} value={form.release_year}
                    onChange={e => setForm(f => ({ ...f, release_year: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Categoría</label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="">Sin categoría</option>
                    {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Clock size={10} /> Duración (min)</span>
                  </label>
                  <input
                    type="number" min={0} value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Star size={10} /> Rating (0-10)</span>
                  </label>
                  <input
                    type="number" min={0} max={10} step={0.1} value={form.rating}
                    onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Director</label>
                  <input
                    type="text" value={form.director}
                    onChange={e => setForm(f => ({ ...f, director: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Reparto (separado por comas)</label>
                  <input
                    type="text" value={form.cast_list}
                    onChange={e => setForm(f => ({ ...f, cast_list: e.target.value }))}
                    placeholder="Actor 1, Actor 2"
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">URL del poster</label>
                  <input
                    type="url" value={form.poster_url}
                    onChange={e => setForm(f => ({ ...f, poster_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Descripción</label>
                  <textarea
                    rows={3} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox" id="featured" checked={form.is_featured}
                    onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label htmlFor="featured" className="text-neutral-300 text-sm cursor-pointer">
                    Marcar como película destacada (aparece en el hero)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-neutral-800">
                <button type="button" onClick={closeForm} className="px-5 py-2.5 text-sm text-neutral-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <><Save size={14} /> {editingId ? 'Guardar cambios' : 'Crear película'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
