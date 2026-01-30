import { GitCommit } from 'lucide-react';
import FadeIn from './FadeIn';

const events = [
  {
    version: '2026.1',
    date: 'MARÇO',
    title: 'CALOURADA OPEN SOURCE',
    description: 'A recepção oficial dos novos integrantes. Integração, networking e boas-vindas.',
    status: 'CONFIRMADO'
  },
  {
    version: '2026.2',
    date: 'ABRIL',
    title: 'INTERCLASSE: GAMING EDITION',
    description: 'Torneio de CS2 e Valorant entre turmas. Premiação exclusiva para os vencedores.',
    status: 'CONFIRMADO'
  },
  {
    version: '2026.3',
    date: 'MAIO',
    title: 'WORKSHOP: DOCKER NA PRÁTICA',
    description: 'Treinamento intensivo de containers para iniciantes. Vagas limitadas.',
    status: 'EM BREVE'
  }
];

export default function Roadmap() {
  return (
    <section className="py-24 bg-black text-white overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <FadeIn>
            <h2 className="text-4xl md:text-5xl mb-16 text-center tracking-normal">
                <span className="glitch" data-text="CALENDÁRIO">CALENDÁRIO</span> <br/>
                <span className="glitch" data-text="DE EVENTOS">DE EVENTOS</span>
            </h2>
        </FadeIn>

        <div className="relative border-l border-white/20 ml-4 md:ml-0 space-y-16">
            {events.map((event, i) => (
                <FadeIn key={i} delay={i * 150}>
                    <div className="relative pl-12 md:pl-24">
                        {/* Node */}
                        <div className="absolute left-[-5px] top-2 w-3 h-3 bg-black border border-white rounded-full"></div>
                        <div className="absolute left-[-24px] top-1 hidden md:flex items-center justify-center w-12 h-12 bg-black border border-white/20 rounded-full">
                            <GitCommit size={20} className="text-gray-400" />
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 md:items-start">
                            <div className="min-w-[120px]">
                                <span className="font-bold text-white text-lg block">{event.date}</span>
                                <span className="font-mono text-xs text-gray-500">{event.version}</span>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-bold mb-2 uppercase">{event.title}</h3>
                                <p className="text-gray-400 font-sans text-lg leading-relaxed max-w-lg">
                                    {event.description}
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${event.status === 'CONFIRMADO' ? 'bg-white text-black' : 'border border-white/20 text-gray-500'}`}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            ))}
        </div>
        
        <FadeIn delay={300}>
            <div className="mt-24 text-center">
                <button className="bg-white text-black px-8 py-3 font-bold text-sm hover:bg-gray-200 transition-all tracking-wide">
                    VER CRONOGRAMA COMPLETO
                </button>
            </div>
        </FadeIn>

      </div>
    </section>
  );
}

