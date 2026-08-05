import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, ArrowRight, Calendar, Activity, Settings, Shield, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import AthleteDashboard from '../components/championships/AthleteDashboard';
import AthleteOnboarding from '../components/championships/AthleteOnboarding';

export default function ChampionshipsPage() {
  const { user, token } = useAuth();
  
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile State to determine if we show Onboarding or Dashboard
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'my-area'>('explore');

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

  const fetchProfile = () => {
    if (!token) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    apiClient.get<any>('/teams/my/profile')
    .then(data => {
      setAthleteProfile(data || null);
      setLoadingProfile(false);
    })
    .catch(err => {
      console.error('Erro ao buscar perfil', err);
      setLoadingProfile(false);
    });
  };

  useEffect(() => {
    fetchChampionships();
    fetchProfile();
    
    // Auto-switch to my-area if there's a hash
    if (window.location.hash === '#minha-area' && user) {
      setActiveTab('my-area');
    }
  }, [token, user]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-24 font-inter text-slate-800 pt-20">
        
        {/* HERO HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8 px-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Trophy size={300} />
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              {/* ALERTA DE CONSTRUÇÃO */}
              <div className="bg-yellow-500/20 border border-yellow-400/50 text-yellow-100 px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-4 text-sm font-bold shadow-sm">
                🚧 Fase de Testes Beta — Módulo de campeonatos em construção. Funcionalidades sujeitas a instabilidade.
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Hub de Campeonatos
              </h1>
              <p className="text-blue-100 text-base max-w-xl mb-4">
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
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                <span className="text-3xl font-extrabold block mb-1">
                  {championships.filter(c => c.status === 'OPEN' && (!c.enrollmentDeadline || new Date(c.enrollmentDeadline) >= new Date())).length}
                </span>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Abertos</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                <span className="text-3xl font-extrabold block mb-1">
                  {championships.reduce((acc, c) => acc + (c.modalities?.length || 0), 0)}
                </span>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Modalidades</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          
          {/* TABS */}
          <div className="flex bg-slate-200 p-1 rounded-xl w-full sm:w-fit mx-auto sm:mx-0 shadow-inner">
            <button 
              onClick={() => setActiveTab('explore')}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center ${activeTab === 'explore' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Trophy size={16} /> Explorar
            </button>
            {user && (
              <button 
                onClick={() => setActiveTab('my-area')}
                className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center ${activeTab === 'my-area' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Shield size={16} /> Minha Área
              </button>
            )}
            {isManager && (
              <a 
                href="/admin/championships"
                className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center text-slate-500 hover:text-slate-700`}
              >
                <Settings size={16} /> Painel de Gestão
              </a>
            )}
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'explore' && (
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
                        placeholder="Buscar campeonatos por nome..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
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
                        <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-200">
                          <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                          <h3 className="text-2xl font-bold text-slate-600">Nenhum campeonato cadastrado.</h3>
                          <p className="text-slate-500 mt-2">A temporada está tranquila no momento. Volte em breve!</p>
                        </div>
                      );
                    }

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-slate-300">
                          <Filter size={48} className="mx-auto text-slate-300 mb-4" />
                          <h3 className="text-2xl font-bold text-slate-600">Nenhum resultado encontrado</h3>
                          <p className="text-slate-500 mt-2">Tente ajustar os filtros de busca para encontrar outros campeonatos.</p>
                          <button 
                            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                            className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
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
                            <Link key={champ.id} to={`/campeonatos/${champ.id}`} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-200 transition-all overflow-hidden flex flex-col transform hover:-translate-y-1">
                              <div className="h-48 relative w-full overflow-hidden">
                                {champ.bannerUrl ? (
                                  <img 
                                    src={`${API_URL}${champ.bannerUrl}`} 
                                    alt={champ.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${badgeColor}`}>
                                  {badgeText}
                                </div>
                              </div>
                              
                              <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{champ.name}</h2>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">{champ.description}</p>
                                
                                <div className="space-y-2 mt-auto">
                                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg">
                                    <Calendar size={14} className="text-blue-500" />
                                    {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg">
                                    <Activity size={14} className="text-orange-500" />
                                    {champ.modalities?.length || 0} modalidades
                                  </div>
                                </div>
                              </div>
                              
                              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm font-bold text-blue-600 group-hover:bg-blue-50 transition-colors">
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
          )}

          {activeTab === 'my-area' && user && (
            <div className="animate-in fade-in duration-500">
              {loadingProfile ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
              ) : athleteProfile?.team ? (
                <AthleteDashboard />
              ) : (
                <AthleteOnboarding onSuccess={fetchProfile} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
