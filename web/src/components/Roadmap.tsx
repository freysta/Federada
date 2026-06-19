import { useState, useEffect, useRef } from 'react';
import { GitCommit } from 'lucide-react';
import FadeIn from './FadeIn';
import { API_URL } from '../config';

export default function Roadmap() {
  const [events, setEvents] = useState<any[]>([]);
  const [lineHeight, setLineHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/cms/events`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
        else setEvents([]);
      })
      .catch(err => {
        console.error(err);
        setEvents([]);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const startTrigger = windowHeight * 0.8; 
      const endTrigger = windowHeight * 0.4;   
      
      const containerTop = rect.top;
      const containerHeight = rect.height;
      
      if (containerTop > startTrigger) {
        setLineHeight(0);
      } else if (containerTop + containerHeight < endTrigger) {
        setLineHeight(100);
      } else {
        const scrolled = startTrigger - containerTop;
        const totalToScroll = containerHeight + (startTrigger - endTrigger);
        let percentage = (scrolled / totalToScroll) * 100;
        setLineHeight(Math.max(0, Math.min(100, percentage)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [events]);

  return (
    <section className="py-24 bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <FadeIn>
            <h2 className="text-4xl md:text-5xl mb-16 text-center tracking-normal">
                <span className="glitch" data-text="CALENDÁRIO">CALENDÁRIO</span> <br/>
                <span className="glitch" data-text="DE EVENTOS">DE EVENTOS</span>
            </h2>
        </FadeIn>

        <div className="relative ml-4 md:ml-0" ref={containerRef}>
            {/* Background Line */}
            <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/20"></div>
            
            {/* Animated Fill Line */}
            <div 
              className="absolute top-0 left-[0px] w-[2px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff] transition-all duration-300 ease-out z-10" 
              style={{ height: `${lineHeight}%` }}
            ></div>

            <div className="space-y-16 py-8">
              {events.map((event, i) => {
                  const isActive = lineHeight > (i / Math.max(1, events.length - 1)) * 100 - 10;
                  
                  return (
                  <FadeIn key={event.id || i} delay={i * 150}>
                      <div className="relative pl-12 md:pl-24">
                          {/* Node marker on the line */}
                          <div className={`absolute left-[-5px] top-2 w-3 h-3 border rounded-full transition-colors duration-500 z-20 ${isActive ? 'bg-[#00f0ff] border-[#00f0ff] shadow-[0_0_8px_#00f0ff]' : 'bg-black border-white'}`}></div>
                          
                          <div className={`absolute left-[-24px] top-1 hidden md:flex items-center justify-center w-12 h-12 bg-black border rounded-full transition-colors duration-500 z-20 ${isActive ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-white/20 text-gray-400'}`}>
                              <GitCommit size={20} />
                          </div>

                          <div className={`flex flex-col md:flex-row gap-6 md:items-start transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                              <div className="min-w-[120px]">
                                  <span className={`font-bold text-lg block transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-400'}`}>{event.date}</span>
                                  <span className="font-mono text-xs text-gray-500">{event.version}</span>
                              </div>
                              
                              <div>
                                  <h3 className={`text-2xl font-bold mb-2 uppercase transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-400'}`}>{event.title}</h3>
                                  <p className="text-gray-400 font-sans text-lg leading-relaxed max-w-lg">
                                      {event.description}
                                  </p>
                                  <div className="mt-4 flex items-center gap-2">
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-500 ${
                                        event.status === 'CONFIRMADO' 
                                          ? (isActive ? 'bg-white text-black' : 'bg-gray-800 text-gray-400') 
                                          : 'border border-white/20 text-gray-500'
                                      }`}>
                                          {event.status === 'CONFIRMADO' && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>}
                                          {event.status}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </FadeIn>
                  );
              })}
            </div>
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-mono text-sm">
            SISTEMA DE CALENDÁRIO: NENHUM DADO REGISTRADO.
          </div>
        )}

      </div>
    </section>
  );
}
