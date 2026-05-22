import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center">
              <Film size={15} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Cine<span className="text-red-500">Vault</span>
            </span>
          </div>
          <p className="text-neutral-600 text-xs text-center">
            Tu catálogo de cine. Descubre, explora y disfruta las mejores películas.
          </p>
          <p className="text-neutral-700 text-xs">&copy; {new Date().getFullYear()} CineVault</p>
        </div>
      </div>
    </footer>
  );
}
