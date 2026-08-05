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
      <div className="min-h-screen bg-neutral-50 pb-24 font-inter text-slate-900 pt-20">
        
        {/* HERO HEADER */}
        <div className="bg-white border-b border-gray-200 py-8 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Trophy size={300} />
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              {/* ALERTA DE CONSTRUÇÃO */}
              <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4 text-sm font-bold shadow-sm border border-yellow-200">
                🚧 Fase de Testes Beta
              </div>
              
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
                Hub de Campeonatos
              </h1>
              <p className="text-slate-600 text-base max-w-xl mb-4">
                Explore os campeonatos disponíveis, junte-se a uma equipe e inscreva-se para competir nas maiores disputas universitárias.
              </p>
              
              {!user && (
                <div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200 inline-block mt-2">
                  <p className="font-medium text-sm text-gray-700 flex items-center gap-2"><Shield size={16}/> Você não está logado.</p>
                  <p className="text-xs text-gray-500 mt-1">Faça login para se vincular a uma equipe.</p>
                </div>
              )}
            </div>
            
              {/* Quick Stats / Summary Cards */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto mt-6 md:mt-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
                <span className="text-4xl font-extrabold block mb-1 text-slate-800">
                  {championships.filter(c => c.status === 'OPEN' && (!c.enrollmentDeadline || new Date(c.enrollmentDeadline) >= new Date())).length}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Abertos</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
                <span className="text-4xl font-extrabold block mb-1 text-slate-800">
                  {championships.reduce((acc, c) => acc + (c.modalities?.length || 0), 0)}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modalidades</span>
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
                        placeholder="Buscar campeonatos..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                      >
                        <option value="ALL">Todos os Status</option>
                        <option value="OPEN">Inscrições Abertas</option>
                        <option value="ONGOING">Em Andamento</option>
                        <option value="FINISHED">Finalizados</option>
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
                        <div className="text-center py-24 bg-white border border-gray-200 rounded-3xl shadow-sm">
                          <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-2xl font-bold text-slate-800">Nenhum campeonato cadastrado.</h3>
                          <p className="text-gray-500 mt-2">A temporada está tranquila no momento.</p>
                        </div>
                      );
                    }

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-3xl shadow-sm">
                          <Filter size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-2xl font-bold text-slate-800">Nenhum resultado</h3>
                          <p className="text-gray-500 mt-2">Ajuste os filtros de busca.</p>
                          <button 
                            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                            className="mt-6 px-6 py-2 bg-gray-100 text-slate-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
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
                            <Link key={champ.id} to={`/campeonatos/${champ.id}`} className="group bg-white rounded-3xl shadow-sm border border-gray-200 hover:border-black transition-all flex flex-col transform hover:-translate-y-1 hover:shadow-md">
                              <div className="h-48 relative w-full overflow-hidden border-b border-gray-100 rounded-t-3xl">
                                {champ.bannerUrl ? (
                                  <img 
                                    src={`${API_URL}${champ.bannerUrl}`} 
                                    alt={champ.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                    <Trophy size={48} className="text-gray-300" />
                                  </div>
                                )}
                                <div className="absolute top-4 right-4 z-20">
                                  <span className={`px-3 py-1 font-bold tracking-wider text-[10px] rounded-full shadow-sm ${badgeColor}`}>
                                    {badgeText}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="p-6 flex-1 flex flex-col relative z-10">
                                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{champ.name}</h2>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1">{champ.description}</p>
                                
                                <div className="space-y-2 mt-auto">
                                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                                    <Calendar size={14} className="text-blue-500" />
                                    {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                                    <Activity size={14} className="text-orange-500" />
                                    {champ.modalities?.length || 0} modalidades
                                  </div>
                                </div>
                              </div>
                              
                              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-sm font-bold text-blue-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors rounded-b-3xl">
                                Ver Detalhes
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
