import { Menu, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-ice/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="text-sm font-sans tracking-widest">[00]</span>
            <h1 className="text-3xl tracking-widest">FEDERADA</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="hover:text-neon-cyan transition-colors">
            <ShoppingBag strokeWidth={1} className="w-6 h-6" />
          </button>
          <button className="hover:text-neon-cyan transition-colors">
            <Menu strokeWidth={1} className="w-8 h-8" />
          </button>
        </div>
      </div>
    </nav>
  );
}
