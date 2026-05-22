import { useState, useEffect } from 'react';
import { Film, Menu, X, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function handleNav(page: Page) {
    onNavigate(page);
    setMobileOpen(false);
  }

  async function handleLogout() {
    await logout();
    handleNav('home');
  }

  const navLinks: { label: string; page: Page }[] = [
    { label: 'Inicio', page: 'home' },
    { label: 'Películas', page: 'movies' },
    ...(user?.role === 'admin' ? [{ label: 'Administrar', page: 'admin' as Page }] : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-neutral-950/95 backdrop-blur-sm shadow-lg shadow-black/30' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center group-hover:bg-red-500 transition-colors">
              <Film size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Cine<span className="text-red-500">Vault</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'text-white bg-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  {user.role === 'admin' ? (
                    <Shield size={14} className="text-amber-400" />
                  ) : (
                    <User size={14} className="text-neutral-400" />
                  )}
                  <span>{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded transition-colors"
                >
                  <LogOut size={14} />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-neutral-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-neutral-950/98 backdrop-blur-sm border-t border-neutral-800">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ label, page }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`w-full text-left px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                  currentPage === page ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="pt-3 border-t border-neutral-800 mt-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300">
                    {user.role === 'admin' ? <Shield size={14} className="text-amber-400" /> : <User size={14} />}
                    <span>{user.username}</span>
                    {user.role === 'admin' && <span className="text-xs text-amber-400 ml-1">(Admin)</span>}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-400 hover:text-white"
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => handleNav('login')} className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:text-white">
                    Iniciar sesión
                  </button>
                  <button onClick={() => handleNav('register')} className="w-full text-left px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded transition-colors">
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
