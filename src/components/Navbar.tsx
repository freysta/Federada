import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import ifroLogo from '../assets/logos/logo-ifro-branca-white-branco.png.webp';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Brand */}
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="w-3 h-3 bg-black"></span>
            FEDERADA
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-mono text-sm">
            <a href="#" className="hover:underline underline-offset-4">INÍCIO</a>
            <a href="#news" className="hover:underline underline-offset-4">NOTÍCIAS</a>
            <a href="#merch" className="hover:underline underline-offset-4">LOJA</a>
            <a href="#about" className="hover:underline underline-offset-4">SOBRE</a>
            
            <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
            
            <img src={ifroLogo} alt="IFRO Logo" className="h-8 opacity-80 hover:opacity-100 transition-opacity invert" />
            
            <button className="bg-black text-white px-6 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors">
                <ShoppingBag size={16} />
                <span className="font-sans font-bold tracking-wide">LOJA</span>
            </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-black/10 p-6 flex flex-col gap-4 font-mono text-sm">
            <a href="#" onClick={() => setIsOpen(false)}>INÍCIO</a>
            <a href="#news" onClick={() => setIsOpen(false)}>NOTÍCIAS</a>
            <a href="#merch" onClick={() => setIsOpen(false)}>LOJA</a>
            <a href="#about" onClick={() => setIsOpen(false)}>SOBRE</a>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                 <img src={ifroLogo} alt="IFRO Logo" className="h-6 opacity-60 invert" />
            </div>
        </div>
      )}
    </nav>
  );
}
