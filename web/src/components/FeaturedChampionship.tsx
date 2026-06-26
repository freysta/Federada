import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowUpRight, Calendar } from 'lucide-react';
import { API_URL } from '../config';
import FadeIn from './FadeIn';

export default function FeaturedChampionship() {
  const [champ, setChamp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/championships`)
      .then(res => res.json())
      .then(data => {
        const openChamps = data.filter((c: any) => c.status === 'OPEN');
        if (openChamps.length > 0) {
          setChamp(openChamps[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !champ) return null;

  return (
    <section className="py-24 bg-neutral-50 border-t border-black" id="campeonato">
      <div className="max-w-7xl mx-auto px-6">

        <FadeIn>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-3 h-3 bg-green-500 animate-pulse rounded-full"></div>
            <h2 className="text-4xl tracking-normal">
              <span className="glitch" data-text="CAMPEONATO EM DESTAQUE">CAMPEONATO EM DESTAQUE</span>
            </h2>
            <span className="font-mono text-xs text-gray-400 hidden md:block">INSCRIÇÕES ABERTAS</span>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <Link
            to={`/campeonatos/${champ.id}`}
            className="group relative bg-white border border-gray-200 hover:border-black transition-all duration-300 shadow-sm hover:shadow-md flex flex-col md:flex-row overflow-hidden"
          >
            {/* Barra lateral de destaque */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-[#00f0ff] transition-colors"></div>

            {/* Imagem */}
            <div className="md:w-80 lg:w-96 h-56 md:h-auto bg-black relative shrink-0 overflow-hidden">
              {champ.bannerUrl ? (
                <img
                  src={`${API_URL}${champ.bannerUrl}`}
                  alt={champ.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <Trophy size={48} className="text-white/20" />
                </div>
              )}

              {/* Badge */}
              <div className="absolute top-4 left-4 bg-[#00f0ff] text-black px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-widest border border-black">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                  AO VIVO
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 uppercase tracking-wider">
                  {champ.modalities?.length || 0} MODALIDADES
                </span>
                {(champ.settings?.requireRg || champ.settings?.requireEnrollment) && (
                  <span className="font-mono text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 uppercase tracking-wider">
                    REQUER DOCS
                  </span>
                )}
              </div>

              <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3 group-hover:text-[#00f0ff] transition-colors duration-300" style={{ WebkitTextStroke: '0' }}>
                {champ.name}
              </h3>

              <p className="text-gray-500 font-mono text-sm leading-relaxed mb-6 max-w-lg line-clamp-2">
                {champ.description || 'Prepare-se para o evento universitário mais aguardado. Organize sua equipe e garanta sua vaga.'}
              </p>

              <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>PRAZO: {champ.enrollmentDeadline ? new Date(champ.enrollmentDeadline).toLocaleDateString() : 'A DEFINIR'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={14} />
                  <span>{champ.modalities?.length || 0} DISPUTAS</span>
                </div>
              </div>
            </div>

            {/* Seta */}
            <div className="hidden md:flex items-center justify-center px-8 shrink-0 border-l border-gray-100 group-hover:border-black transition-colors">
              <ArrowUpRight size={24} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
