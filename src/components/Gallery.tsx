import { Instagram, ArrowUpRight } from 'lucide-react';
import FadeIn from './FadeIn';
import img1 from '../assets/urso.jpg';
import img2 from '../assets/merchs/camiseta-atletica-v1-front.jpg';
import img3 from '../assets/membros/hyago.png';
import img4 from '../assets/membros/gabriel.jpg';

const moments = [
  { id: 1, image: img1, caption: 'NOSSA IDENTIDADE' },
  { id: 2, image: img2, caption: 'NOVA COLEÇÃO' },
  { id: 3, image: img3, caption: 'GESTÃO 2026' },
  { id: 4, image: img4, caption: 'ESPORTES' },
];

export default function Gallery() {
  return (
    <section className="py-24 bg-white border-t border-black" id="gallery">
      <div className="max-w-7xl mx-auto px-6">
        
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl tracking-normal mb-2">
                <span className="glitch" data-text="LEGADO FEDERADA">LEGADO FEDERADA</span>
              </h2>
              <p className="text-gray-500 font-sans text-lg">Acompanhe nossa rotina no Instagram.</p>
            </div>
            <a 
              href="https://instagram.com/federadaifro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-black pb-1 hover:text-gray-600 transition-colors"
            >
              <Instagram size={16} />
              @FEDERADAIFRO
            </a>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moments.map((moment, i) => (
            <FadeIn key={moment.id} delay={i * 100}>
              <a 
                href="https://instagram.com/federadaifro"
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden cursor-pointer bg-neutral-100 border border-gray-200 block"
              >
                {/* Image */}
                <img 
                    src={moment.image} 
                    alt={moment.caption} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
                
                {/* Overlay Info */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-bold text-lg tracking-wide mb-1">{moment.caption}</span>
                  <div className="flex items-center gap-2 text-white/80 text-xs font-mono">
                    <span>VER POST</span>
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
            <a 
              href="https://instagram.com/federadaifro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors"
            >
              <Instagram size={16} />
              SEGUIR NO INSTAGRAM
            </a>
        </div>

      </div>
    </section>
  );
}