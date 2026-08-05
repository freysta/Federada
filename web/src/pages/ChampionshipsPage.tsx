import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, ArrowRight, Calendar, Activity, Settings, Shield, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChampionshipsPage() {
  const { user, token } = useAuth();
  
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isManager = user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN';

  const fetchChampionships = () => {
    setLoading(true);
    apiClient.get<any>('/championships')
      .then(result => {
        setChampionships(result.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao buscar campeonatos');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChampionships();
  }, [token, user]);

  return (
    <>
      <div className="min-h-screen bg-transparent pb-24 font-inter text-white pt-20">
        
        {/* HERO HEADER */}
        <div className="bg-neutral-900 border-b-2 border-neutral-800 text-white py-8 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Trophy size={300} />
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              {/* ALERTA DE CONSTRUÇÃO */}
              <div className="bg-yellow-400 border-2 border-black text-black px-4 py-2 rounded-none inline-flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-wider">
                🚧 Fase de Testes Beta
              </div>
              
              <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter mb-4 uppercase">
                Hub de Campeonatos
              </h1>
              <p className="text-neutral-400 text-base max-w-xl mb-4 font-sans tracking-wide">
                Explore os campeonatos disponíveis, junte-se a uma equipe e inscreva-se para competir nas maiores disputas universitárias.
              </p>
              
              {!user && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 inline-block">
                  <p className="font-medium text-sm text-white flex items-center gap-2"><Shield size={16}/> Você não está logado.</p>
                  <p className="text-xs text-blue-200 mt-1">Faça login para se vincular a uma equipe.</p>
                </div>
              )}
            </div>
            
              {/* Quick Stats / Summary Cards */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-black border-2 border-neutral-800 rounded-none p-6 text-center shadow-[4px_4px_0_0_#00f0ff]">
                <span className="text-4xl font-mono font-extrabold block mb-1 text-[#00f0ff]">
                  {championships.filter(c => c.status === 'OPEN' && (!c.enrollmentDeadline || new Date(c.enrollmentDeadline) >= new Date())).length}
                </span>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Abertos</span>
              </div>
              <div className="bg-black border-2 border-neutral-800 rounded-none p-6 text-center shadow-[4px_4px_0_0_#00f0ff]">
                <span className="text-4xl font-mono font-extrabold block mb-1 text-[#00f0ff]">
                  {championships.reduce((acc, c) => acc + (c.modalities?.length || 0), 0)}
                </span>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Modalidades</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          
          {/* CONTENT */}
          <div className="animate-in fade-in duration-500">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="BUSCAR CAMPEONATO..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black border-2 border-neutral-800 rounded-none text-white focus:outline-none focus:border-[#00f0ff] transition-colors placeholder:text-neutral-600 font-bold uppercase tracking-wider font-mono text-sm shadow-[4px_4px_0_0_#00f0ff] focus:shadow-[2px_2px_0_0_#00f0ff]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-black border-2 border-neutral-800 rounded-none font-bold uppercase tracking-wider font-mono text-sm text-neutral-300 focus:outline-none focus:border-[#00f0ff] cursor-pointer shadow-[4px_4px_0_0_#00f0ff] focus:shadow-[2px_2px_0_0_#00f0ff]"
                      >
                        <option value="ALL">TODOS OS STATUS</option>
                        <option value="OPEN">INSCRIÇÕES ABERTAS</option>
                        <option value="ONGOING">EM ANDAMENTO</option>
                        <option value="FINISHED">FINALIZADOS</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const filtered = championships.filter(champ => {
                      const matchesSearch = champ.name.toLowerCase().includes(searchTerm.toLowerCase());
                      let matchesStatus = true;
                      
                      if (statusFilter !== 'ALL') {
                        if (statusFilter === 'OPEN') {
                          const isOpen = champ.status === 'OPEN' && (!champ.enrollmentDeadline || new Date(champ.enrollmentDeadline) >= new Date());
                          matchesStatus = isOpen;
                        } else {
                          matchesStatus = champ.status === statusFilter;
                        }
                      }
                      
                      return matchesSearch && matchesStatus;
                    });

                    if (championships.length === 0) {
                      return (
                        <div className="text-center py-24 bg-neutral-900 border-2 border-neutral-800 rounded-none">
                          <Trophy size={48} className="mx-auto text-neutral-600 mb-4" />
                          <h3 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Nenhum campeonato cadastrado.</h3>
                          <p className="text-neutral-500 mt-2 font-mono uppercase text-sm">A temporada está tranquila no momento.</p>
                        </div>
                      );
                    }

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-24 bg-neutral-900 border-2 border-neutral-800 rounded-none">
                          <Filter size={48} className="mx-auto text-neutral-600 mb-4" />
                          <h3 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Nenhum resultado</h3>
                          <p className="text-neutral-500 mt-2 font-mono uppercase text-sm">Ajuste os filtros de busca.</p>
                          <button 
                            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                            className="mt-6 px-6 py-2 bg-black text-white font-mono font-bold tracking-widest uppercase border-2 border-neutral-700 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-colors"
                          >
                            Limpar Filtros
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map(champ => {
                          let badgeText = '';
                          let badgeColor = '';
                          
                          switch(champ.status) {
                            case 'PUBLISHED':
                              badgeText = 'Em Breve';
                              badgeColor = 'bg-yellow-100 text-yellow-700';
                              break;
                            case 'OPEN':
                              const isOpen = !champ.enrollmentDeadline || new Date(champ.enrollmentDeadline) >= new Date();
                              badgeText = isOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas';
                              badgeColor = isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                              break;
                            case 'CLOSED':
                            case 'GENERATING_BRACKET':
                              badgeText = 'Inscrições Encerradas';
                              badgeColor = 'bg-red-100 text-red-700';
                              break;
                            case 'ONGOING':
                              badgeText = 'Em Andamento';
                              badgeColor = 'bg-blue-100 text-blue-700';
                              break;
                            case 'FINISHED':
                              badgeText = 'Finalizado';
                              badgeColor = 'bg-slate-200 text-slate-700';
                              break;
                            default:
                              badgeText = 'Indisponível';
                              badgeColor = 'bg-slate-200 text-slate-600';
                          }
                          
                          return (
                            <Link key={champ.id} to={`/campeonatos/${champ.id}`} className="group bg-black border-2 border-neutral-800 hover:border-[#00f0ff] transition-all flex flex-col transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#00f0ff] shadow-none">
                              <div className="h-48 relative w-full overflow-hidden border-b-2 border-neutral-800 group-hover:border-[#00f0ff] transition-colors">
                                {champ.bannerUrl ? (
                                  <img 
                                    src={`${API_URL}${champ.bannerUrl}`} 
                                    alt={champ.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-neutral-900" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                                )}
                                <div className="absolute top-0 left-0 p-4 font-mono text-[10px] w-full flex justify-end z-20 mix-blend-normal">
                                  <span className={`px-2 py-1 font-bold tracking-widest border-2 border-black ${badgeColor}`}>
                                    {badgeText}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="p-6 flex-1 flex flex-col relative z-10">
                                <h2 className="text-2xl font-mono font-bold text-white mb-2 group-hover:text-[#00f0ff] transition-colors line-clamp-2 uppercase tracking-tighter leading-none">{champ.name}</h2>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1">{champ.description}</p>
                                
                                <div className="space-y-2 mt-auto">
                                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold bg-neutral-900 border border-neutral-800 px-3 py-2 uppercase tracking-wider font-mono">
                                    <Calendar size={14} className="text-neutral-500" />
                                    {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold bg-neutral-900 border border-neutral-800 px-3 py-2 uppercase tracking-wider font-mono">
                                    <Activity size={14} className="text-[#00f0ff]" />
                                    {champ.modalities?.length || 0} modalidades
                                  </div>
                                </div>
                              </div>
                              
                              <div className="px-6 py-4 border-t-2 border-neutral-800 bg-neutral-950 flex justify-between items-center text-sm font-bold text-neutral-500 group-hover:bg-[#00f0ff] group-hover:text-black transition-colors uppercase tracking-widest font-mono">
                                Acessar Torneio
                                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
            </div>
      </div>
    </>
  );
}
