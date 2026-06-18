import { ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ursoImg from '../assets/urso.jpg';

export default function Hero() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: true })]);
  const [text, setText] = useState('');
  const fullText = "A marca oficial da Atlética de ADS. Vestuário premium para quem vive o código.";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        
        {/* SLIDE 1: Original Hero */}
        <div className="flex-[0_0_100%] min-w-0">
          <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden bg-white text-black">
            <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
              
              {/* Text Content */}
              <div className="z-10 order-2 md:order-1">
                <div className="flex items-center gap-4 mb-6">
                  <span className="h-[2px] w-12 bg-black"></span>
                  <span className="font-mono text-sm tracking-widest uppercase text-gray-600">Desde 2024</span>
                </div>
                
                <h1 className="text-6xl md:text-[7rem] leading-[0.9] mb-6 font-bold tracking-normal">
                  <span className="glitch" data-text="FEDERADA:">FEDERADA:</span><br/>
                  ESTILO &<br/>
                  PERFORMANCE
                </h1>
                
                <div className="h-20 mb-8 text-lg md:text-xl text-gray-700 max-w-lg leading-relaxed font-serif">
                  {text}
                  <span className="animate-pulse">|</span>
                </div>

                <button 
                  onClick={() => document.getElementById('merch')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-4 bg-black text-white px-10 py-5 hover:bg-neutral-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-sans text-xl tracking-wider font-bold">VER COLEÇÃO 2026</span>
                </button>
              </div>

              {/* Visual / Mascot - Actual Image */}
              <div className="relative order-1 md:order-2 flex justify-center items-center">
                  {/* Main Visual Container */}
                  <div className="relative w-full aspect-[4/5] bg-neutral-100 border border-neutral-200 overflow-hidden group shadow-2xl">
                      {/* Grid Background */}
                      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      
                      {/* Image */}
                      <img 
                          src={ursoImg} 
                          alt="Federada Polar Bear" 
                          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Technical Overlays - Cleaned up */}
                      <div className="absolute inset-0 pointer-events-none z-10 border-4 border-black/5"></div>
                      
                      <div className="absolute top-0 left-0 p-4 font-mono text-xs w-full flex justify-between z-20 mix-blend-hard-light">
                          <span className="bg-black text-white px-3 py-1 font-bold tracking-widest">COLEÇÃO_NOVA</span>
                      </div>
                      
                      <div className="absolute bottom-0 right-0 p-4 z-20">
                           <div className="bg-white/90 backdrop-blur border border-black p-3 shadow-lg">
                              <div className="font-sans text-xs font-bold text-right leading-tight">
                                  DESIGN EXCLUSIVO<br/>
                                  ED. LIMITADA
                              </div>
                           </div>
                      </div>
                  </div>
              </div>

            </div>

            {/* Scroll Indicator */}
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 group cursor-pointer"
            >
              <div className="w-6 h-10 border-2 border-black/20 rounded-full flex justify-center p-1 group-hover:border-black/50 transition-colors">
                  <div className="w-1 h-2 bg-black rounded-full animate-bounce"></div>
              </div>
              <span className="font-mono text-[10px] tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors uppercase">
                  Explorar Sistema
              </span>
            </button>
          </section>
        </div>

        {/* SLIDE 2: Placeholder Drop */}
        <div className="flex-[0_0_100%] min-w-0">
          <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden bg-black text-white text-center">
            
            {/* Imagem de Fundo (Exemplo de Placeholder) */}
            <div className="absolute inset-0 opacity-40">
              <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover mix-blend-luminosity" alt="Background" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
              <h2 className="text-6xl md:text-[8rem] font-bold font-sans uppercase leading-none mb-6">
                NOVO <span className="text-[#00f0ff]">DROP</span>
              </h2>
              <p className="font-mono text-xl text-gray-300 mb-10 border-l-4 border-[#00f0ff] pl-4 text-left max-w-xl mx-auto">
                {"// INSIRA AQUI A PUBLICIDADE DO PRÓXIMO LANÇAMENTO. VOCÊ PODE MUDAR O TEXTO, O FUNDO E O BOTÃO NO CÓDIGO FONTE (Hero.tsx - Slide 2)."}
              </p>
              
              <button className="bg-[#00f0ff] text-black px-12 py-5 font-bold font-mono tracking-widest hover:bg-white transition-colors shadow-[6px_6px_0_0_#fff] hover:shadow-[2px_2px_0_0_#fff] active:shadow-none translate-y-0 hover:translate-y-1 active:translate-y-2">
                ATIVAR NOTIFICAÇÕES
              </button>
            </div>
            
          </section>
        </div>

      </div>
    </div>
  );
}
