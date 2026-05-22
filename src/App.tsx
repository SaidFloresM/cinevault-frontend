import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import type { Page } from './types';

function AppContent() {
  const { loading, user } = useAuth();
  const [page, setPage] = useState<Page>('home');

  function navigate(next: Page) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(next);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const showNavAndFooter = page !== 'login' && page !== 'register';

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {showNavAndFooter && <Navbar currentPage={page} onNavigate={navigate} />}

      <main className="flex-1">
        {page === 'home' && (
          user ? <HomePage onNavigate={navigate} /> : <GuestHome onNavigate={navigate} />
        )}
        {page === 'movies' && (
          user ? <MoviesPage /> : <GuestHome onNavigate={navigate} />
        )}
        {page === 'login' && <LoginPage onNavigate={navigate} />}
        {page === 'register' && <RegisterPage onNavigate={navigate} />}
        {page === 'admin' && <AdminPage onNavigate={navigate} />}
      </main>

      {showNavAndFooter && <Footer />}
    </div>
  );
}

function GuestHome({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full text-red-400 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Tu catálogo de cine definitivo
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-4">
          Descubre las mejores<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
            películas
          </span>
        </h1>

        <p className="text-neutral-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
          Explora un catálogo curado de cine. Filtra por género, descubre nuevas historias y guarda tus favoritas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/30 text-sm"
          >
            Comenzar gratis
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-8 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Iniciar sesión
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-16 text-left">
          {[
            { label: '16+ películas', sub: 'en el catálogo' },
            { label: '8 géneros', sub: 'para explorar' },
            { label: 'CRUD completo', sub: 'para admins' },
          ].map(item => (
            <div key={item.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="text-white font-bold text-lg">{item.label}</p>
              <p className="text-neutral-500 text-xs mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
