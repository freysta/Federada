import { ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';
import ursoImg from '../assets/urso.jpg';

export default function Hero() {
  const navigate = useNavigate();
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: true })]);
  const [text, setText] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const fullText = "A marca oficial da Atlética de ADS. Vestuário premium para quem vive o código.";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 30);
    
    // Setup countdown timer (30 days from now as example)
    const target = new Date();
    target.setDate(target.getDate() + 30);
    
    const countTimer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;
      
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(countTimer);
    };
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
                  onClick={() => navigate('/loja')}
                  className="group flex items-center gap-4 bg-black text-white px-10 py-5 hover:bg-[#00f0ff] hover:text-black transition-all duration-300 shadow-xl hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <ShoppingBag className="w-5 h-5 relative z-10" />
                  <span className="font-sans text-xl tracking-wider font-bold relative z-10">VER COLEÇÃO 2026</span>
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
              <div className="w-12 h-12 border border-black/20 rounded-full flex justify-center items-center relative overflow-hidden group-hover:border-black/50 transition-colors bg-white">
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_70%,rgba(0,240,255,0.4)_100%)] animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full z-10 relative shadow-[0_0_8px_#00f0ff]"></div>
              </div>
              <span className="font-mono text-[10px] tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors uppercase">
                  Scanner de Sistema
              </span>
            </button>
          </section>
        </div>

        {/* SLIDE 2: Placeholder Drop */}
        <div className="flex-[0_0_100%] min-w-0">
          <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden bg-[#050505] text-white">
            
            {/* Grid Hacker Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center">
              
              <div className="font-mono text-[#00f0ff] mb-8 flex items-center gap-2 bg-[#00f0ff]/10 px-4 py-2 border border-[#00f0ff]/30">
                <span className="w-2 h-2 bg-[#00f0ff] rounded-full animate-pulse"></span>
                SYSTEM_UPDATE_PENDING // V_3.0
              </div>

              <h2 className="text-5xl md:text-7xl font-bold font-sans uppercase leading-none mb-12 text-center">
                PRÓXIMO <span className="text-transparent stroke-text" style={{ WebkitTextStroke: '1px #00f0ff' }}>DROP</span>
              </h2>
              
              {/* Terminal Countdown */}
              <div className="grid grid-cols-4 gap-4 md:gap-8 w-full max-w-3xl mb-12">
                {[
                  { label: 'DIAS', value: countdown.days },
                  { label: 'HORAS', value: countdown.hours },
                  { label: 'MINUTOS', value: countdown.minutes },
                  { label: 'SEGUNDOS', value: countdown.seconds }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center bg-black/50 border border-[#00f0ff]/30 p-4 md:p-6 backdrop-blur group hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors">
                    <span className="font-sans text-4xl md:text-6xl font-bold text-white group-hover:text-[#00f0ff] transition-colors">{String(item.value).padStart(2, '0')}</span>
                    <span className="font-mono text-[10px] md:text-xs text-[#00f0ff]/70 mt-2 tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
              
              <button className="bg-[#00f0ff] text-black px-12 py-5 font-bold font-mono tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] translate-y-0 hover:-translate-y-1">
                INICIAR PROTOCOLO DE ALERTA
              </button>
            </div>
            
          </section>
        </div>

      </div>
    </div>
  );
}
