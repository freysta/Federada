import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, ArrowRight, Calendar, Activity, Shield, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChampionshipsPage() {
  const { user } = useAuth();
  
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    window.scrollTo(0, 0);
    fetchChampionships();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOrder]);

  const openChampionshipsCount = useMemo(() => {
    return championships.filter(c => c.status === 'OPEN' && (!c.enrollmentDeadline || new Date(c.enrollmentDeadline) >= new Date())).length;
  }, [championships]);

  const modalitiesCount = useMemo(() => {
    return championships.reduce((acc, c) => acc + (c.modalities?.length || 0), 0);
  }, [championships]);

  const filteredChampionships = useMemo(() => {
    const list = championships.filter(champ => {
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

    if (sortOrder === 'NEWEST') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'A_Z') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [championships, searchTerm, statusFilter, sortOrder]);

  return (
    <>
      <div className="min-h-screen bg-neutral-50 pb-24 font-inter text-slate-900">
        
        {/* HERO HEADER */}
        <div className="relative border-b border-black/10 pt-8 pb-12 px-6 overflow-hidden bg-slate-900 text-white">
          {/* DECORATIVE CLAW (garras.png) */}
          <div className="absolute top-0 right-0 h-full w-1/2 opacity-20 pointer-events-none flex justify-end items-center mix-blend-screen">
            <img src="/garras.png" alt="" className="h-[150%] md:h-[200%] max-w-none object-contain translate-x-1/4" />
          </div>

          {/* BETA BADGE */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-3 rounded shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> BETA
            </div>
          </div>
          
          {/* Subtle gradient overlay to ensure text readability against the solid color/claw */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg font-mono">
                HUB DE CAMPEONATOS
              </h1>
              <p className="text-gray-200 text-lg max-w-xl mb-6 font-medium text-shadow-sm">
                Explore os campeonatos disponíveis, junte-se a uma equipe e inscreva-se para competir nas maiores disputas esportivas.
              </p>
              
              {!user && (
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 inline-block mt-2">
                  <p className="font-medium text-sm text-gray-200 flex items-center gap-2"><Shield size={16}/> Você não está logado.</p>
                  <p className="text-xs text-gray-400 mt-1">Faça login para se vincular a uma equipe.</p>
                </div>
              )}
            </div>
            
              {/* Quick Stats / Summary Cards */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto mt-6 md:mt-0">
              <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
                <span className="text-5xl font-extrabold block mb-1 text-white font-mono drop-shadow-md">
                  {openChampionshipsCount}
                </span>
                <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">Abertos</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
                <span className="text-5xl font-extrabold block mb-1 text-white font-mono drop-shadow-md">
                  {modalitiesCount}
                </span>
                <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">Modalidades</span>
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
                  {/* Mobile Filters Button */}
                  <div className="sm:hidden mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-mono">Catálogo</h2>
                    <button 
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-bold active:scale-95 transition-transform"
                    >
                      <Filter size={16} /> Filtros
                    </button>
                  </div>

                  {/* Desktop Filters */}
                  <div className="hidden sm:flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Buscar campeonatos..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                      >
                        <option value="ALL">Todos os Status</option>
                        <option value="OPEN">Inscrições Abertas</option>
                        <option value="ONGOING">Em Andamento</option>
                        <option value="FINISHED">Finalizados</option>
                      </select>
                      <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full sm:w-auto px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                      >
                        <option value="NEWEST">Mais Recentes</option>
                        <option value="A_Z">A - Z</option>
                      </select>
                    </div>
                  </div>

                  {/* Mobile Filters Drawer */}
                  {isMobileFilterOpen && (
                    <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col gap-6 sm:hidden overflow-y-auto">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold font-mono">Filtros</h2>
                        <button 
                          onClick={() => setIsMobileFilterOpen(false)}
                          className="p-2 bg-gray-100 rounded-full active:scale-95 transition-transform"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="relative w-full">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input 
                            type="text" 
                            placeholder="Buscar campeonatos..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                          <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                          >
                            <option value="ALL">Todos os Status</option>
                            <option value="OPEN">Inscrições Abertas</option>
                            <option value="ONGOING">Em Andamento</option>
                            <option value="FINISHED">Finalizados</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Ordem</label>
                          <select 
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                          >
                            <option value="NEWEST">Mais Recentes</option>
                            <option value="A_Z">A - Z</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <button 
                          onClick={() => setIsMobileFilterOpen(false)}
                          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg"
                        >
                          Aplicar e Fechar
                        </button>
                      </div>
                    </div>
                  )}

                  {(() => {
                    const filtered = filteredChampionships;

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
                            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setSortOrder('NEWEST'); }}
                            className="mt-6 px-6 py-2 bg-gray-100 text-slate-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            Limpar Filtros
                          </button>
                        </div>
                      );
                    }

                    // Pagination Logic
                    const totalPages = Math.ceil(filtered.length / itemsPerPage);
                    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                    return (
                      <div className="space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                          {paginated.map(champ => {
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
                              <Link key={champ.id} to={`/campeonatos/${champ.id}`} className="group bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 hover:border-black transition-all flex flex-col transform hover:-translate-y-1 hover:shadow-md">
                                <div className="h-24 sm:h-48 relative w-full overflow-hidden border-b border-gray-100 rounded-t-2xl sm:rounded-t-3xl">
                                  {champ.bannerUrl ? (
                                    <img 
                                      src={`${API_URL}${champ.bannerUrl}`} 
                                      alt={champ.name} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                      <Trophy className="text-gray-300 w-8 h-8 sm:w-12 sm:h-12" />
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex flex-col gap-1 sm:gap-2 items-end">
                                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 font-bold tracking-wider text-[8px] sm:text-[10px] rounded-full shadow-sm ${badgeColor}`}>
                                      {badgeText}
                                    </span>
                                    {champ.audienceFocus && champ.audienceFocus !== 'GENERAL' && (
                                      <span className="hidden sm:inline-block px-2 sm:px-3 py-0.5 sm:py-1 font-bold tracking-wider text-[8px] sm:text-[10px] rounded-full shadow-sm bg-purple-100 text-purple-700">
                                        Foco: {
                                          champ.audienceFocus === 'UNIVERSITY' ? 'Universitário' : 
                                          champ.audienceFocus === 'SCHOOL' ? 'Escolar' : 
                                          champ.audienceFocus === 'CITY' ? 'Cidades' : ''
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="p-3 sm:p-6 flex-1 flex flex-col relative z-10">
                                  <h2 className="text-xs sm:text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{champ.name}</h2>
                                  
                                  {champ.organizer && (
                                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-2 line-clamp-1">Org: {champ.organizer}</p>
                                  )}
                                  
                                  <p className="hidden sm:block text-slate-400 text-sm mb-6 line-clamp-2 flex-1">{champ.description}</p>
                                  
                                  <div className="space-y-1 sm:space-y-2 mt-auto">
                                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-600 font-medium bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg">
                                      <Calendar size={12} className="text-blue-500 sm:w-[14px] sm:h-[14px]" />
                                      <span className="truncate">{champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-600 font-medium bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg">
                                      <Activity size={12} className="text-orange-500 sm:w-[14px] sm:h-[14px]" />
                                      {champ.modalities?.length || 0} mod.
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="px-3 sm:px-6 py-2 sm:py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-[10px] sm:text-sm font-bold text-blue-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors rounded-b-2xl sm:rounded-b-3xl">
                                  <span className="hidden sm:inline">Ver Detalhes</span>
                                  <span className="sm:hidden">Detalhes</span>
                                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform sm:w-4 sm:h-4" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 pt-6">
                            <button 
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => p - 1)}
                              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 disabled:opacity-50 transition-colors bg-white"
                            >
                              Anterior
                            </button>
                            
                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(i + 1)}
                                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'}`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>

                            <button 
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => p + 1)}
                              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-gray-50 disabled:opacity-50 transition-colors bg-white"
                            >
                              Próxima
                            </button>
                          </div>
                        )}
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
