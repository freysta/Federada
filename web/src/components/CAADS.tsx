import { Award, GraduationCap, Building2, ExternalLink, Instagram } from 'lucide-react';
import FadeIn from './FadeIn';

export default function CAADS() {
  return (
    <section className="py-24 bg-neutral-900 text-white border-t border-white/10 relative overflow-hidden" id="caads">
      
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <FadeIn>
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="flex items-center gap-2 text-green-400 font-mono text-xs mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                SYSTEM_STATUS: ACADEMIC_CORE_ACTIVE
              </div>
              <h2 className="text-4xl md:text-6xl tracking-normal mb-6">
                CENTRO ACADÊMICO <br/>
                <span className="text-gray-500">DE ADS</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-lg font-sans leading-relaxed">
                A representação oficial dos estudantes. Lutamos por melhorias, 
                organizamos eventos acadêmicos e garantimos que sua voz seja ouvida no campus.
              </p>
            </div>

            {/* Stats / Highlights Box */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-sm hover:border-green-500/50 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <Award className="text-yellow-400" size={32} />
                        <span className="font-mono text-xs text-gray-500">MEC_EVALUATION</span>
                    </div>
                    <div className="text-5xl font-bold mb-2">NOTA 5</div>
                    <p className="text-sm text-gray-400">Excelência máxima reconhecida pelo MEC. Um curso de referência nacional.</p>
                </div>
            </div>
          </div>
        </FadeIn>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-3 gap-6">
            
            <FadeIn delay={100}>
                <a href="https://portal.ifro.edu.br" target="_blank" rel="noopener noreferrer" className="block bg-neutral-800 p-8 border border-white/5 hover:bg-neutral-800/80 hover:border-white/20 transition-all group">
                    <Building2 className="mb-4 text-gray-300 group-hover:text-white transition-colors" size={28} />
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        PORTAL IFRO <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-500">Acesso ao SUAP, notas, calendário acadêmico e documentos.</p>
                </a>
            </FadeIn>

            <FadeIn delay={200}>
                <a href="https://instagram.com/caadsifro" target="_blank" rel="noopener noreferrer" className="block bg-neutral-800 p-8 border border-white/5 hover:bg-neutral-800/80 hover:border-white/20 transition-all group">
                    <Instagram className="mb-4 text-gray-300 group-hover:text-white transition-colors" size={28} />
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        INSTAGRAM CA <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-500">@caadsifro. Acompanhe pautas, reuniões e avisos oficiais.</p>
                </a>
            </FadeIn>

            <FadeIn delay={300}>
                <div className="bg-neutral-800 p-8 border border-white/5 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <GraduationCap size={100} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">REPRESENTATIVIDADE</h3>
                    <ul className="space-y-3 font-mono text-xs text-gray-400">
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                            DIREITOS ESTUDANTIS
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                            EVENTOS CIENTÍFICOS
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                            APOIO PEDAGÓGICO
                        </li>
                    </ul>
                </div>
            </FadeIn>

        </div>

      </div>
    </section>
  );
}
