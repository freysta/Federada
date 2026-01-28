import { Instagram } from 'lucide-react';
import FadeIn from './FadeIn';

// Placeholder data - replace with real event photos later
const moments = [
  { id: 1, caption: 'CALOURADA 2024', color: 'bg-neutral-800' },
  { id: 2, caption: 'INTERCLASSE FINAL', color: 'bg-neutral-700' },
  { id: 3, caption: 'VISITA TÉCNICA', color: 'bg-neutral-600' },
  { id: 4, caption: 'HACKATHON WINNERS', color: 'bg-neutral-900' },
];

export default function Gallery() {
  return (
    <section className="py-24 bg-white border-t border-black" id="gallery">
      <div className="max-w-7xl mx-auto px-6">
        
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl tracking-normal mb-2">LEGADO FEDERADA</h2>
              <p className="text-gray-500 font-sans text-lg">Momentos que definem nossa história.</p>
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
              <div className="group relative aspect-square overflow-hidden cursor-pointer bg-neutral-100 border border-gray-200">
                {/* Placeholder Block */}
                <div className={`w-full h-full ${moment.color} opacity-10 group-hover:scale-110 transition-transform duration-700`}></div>
                
                {/* Overlay Info */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-bold text-sm tracking-wide">{moment.caption}</span>
                  <span className="text-white/60 text-xs font-mono">VER NO INSTAGRAM ↗</span>
                </div>
                
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Instagram className="text-gray-300 opacity-20 group-hover:opacity-0 transition-opacity" size={48} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
            <a 
              href="https://instagram.com/federadaifro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold border border-black px-6 py-3"
            >
              <Instagram size={16} />
              SEGUIR NO INSTAGRAM
            </a>
        </div>

      </div>
    </section>
  );
}
