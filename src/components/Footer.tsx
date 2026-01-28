import { ArrowUpRight, MapPin, Circle } from 'lucide-react';
import ifroLogo from '../assets/logos/logo-ifro-branca-white-branco.png.webp';
import federadaLogo from '../assets/logos/logo-minimalista-federada.jpg';

export default function Footer() {
    return (
      <footer className="bg-black text-white pt-24 pb-8 overflow-hidden relative">
        
        {/* Massive Background Signature */}
        <div className="absolute bottom-[-5%] left-0 w-full select-none pointer-events-none opacity-10">
            <h1 className="text-[15vw] leading-none font-bold text-center tracking-tighter text-transparent stroke-text">
                FEDERADA
            </h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="grid md:grid-cols-12 gap-12 border-b border-white/20 pb-16 mb-12">
            
            {/* Brand Section (Cols 1-5) */}
            <div className="md:col-span-5 space-y-8">
              <div>
                <img src={federadaLogo} alt="Federada Logo" className="h-16 mb-6 invert mix-blend-screen opacity-90" />
                <h2 className="sr-only">ATLÉTICA DE ADS</h2>
                <p className="text-gray-400 font-sans text-lg leading-relaxed">
                  Fomentando tecnologia, esporte e integração no IFRO Campus Ji-Paraná desde 2024.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <img src={ifroLogo} alt="IFRO Logo" className="h-12 opacity-80 hover:opacity-100 transition-opacity" />
                <div className="h-8 w-[1px] bg-white/20"></div>
                <div className="text-xs text-gray-500 font-mono uppercase">
                  Parceiro<br/>Institucional
                </div>
              </div>
            </div>

            {/* Links Section (Cols 6-9) */}
            <div className="md:col-span-3 md:col-start-7">
                <h3 className="font-mono text-xs text-gray-500 mb-6 uppercase tracking-widest">// NAVEGAÇÃO</h3>
                <ul className="space-y-4 font-bold text-xl">
                    {['INÍCIO', 'LOJA OFICIAL', 'NOTÍCIAS', 'SOBRE NÓS'].map((item, i) => (
                        <li key={i}>
                            <a href="#" className="group flex items-center gap-2 hover:text-gray-300 transition-colors">
                                <span className="w-0 group-hover:w-4 h-[2px] bg-white transition-all duration-300"></span>
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Contact/Social (Cols 10-12) */}
            <div className="md:col-span-3">
                <h3 className="font-mono text-xs text-gray-500 mb-6 uppercase tracking-widest">// CONEXÃO</h3>
                <ul className="space-y-4">
                    <li>
                        <a href="#" className="flex items-center justify-between border-b border-white/10 pb-2 group hover:border-white transition-colors">
                            <span>INSTAGRAM</span>
                            <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center justify-between border-b border-white/10 pb-2 group hover:border-white transition-colors">
                            <span>WHATSAPP</span>
                            <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center justify-between border-b border-white/10 pb-2 group hover:border-white transition-colors">
                            <span>GITHUB</span>
                            <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </li>
                </ul>
            </div>

          </div>
          
          {/* Bottom Bar: Tech Details */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 font-mono text-xs text-gray-500">
            
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <MapPin size={12} />
                    <span>JI-PARANÁ, RO - BRASIL</span>
                </div>
                <span>LAT: -10.87, LONG: -61.95</span>
            </div>

            <div className="flex flex-col md:items-end gap-1">
                <div className="flex items-center gap-2 text-green-500">
                    <Circle size={8} fill="currentColor" className="animate-pulse" />
                    <span>SYSTEM STATUS: ONLINE</span>
                </div>
                <span>© 2026 FEDERADA. ALL RIGHTS RESERVED.</span>
            </div>

          </div>

        </div>
      </footer>
    );
  }
