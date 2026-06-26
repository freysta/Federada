import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Users, Shield, ArrowRight, Calendar, Activity, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import AthleteDashboard from '../components/championships/AthleteDashboard';
import AthleteOnboarding from '../components/championships/AthleteOnboarding';
import OrganizerDashboard from '../components/championships/OrganizerDashboard';

export default function ChampionshipsPage() {
  const { token, user } = useAuth();
  
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile State to determine if we show Onboarding or Dashboard
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'my-area' | 'manage'>('explore');

  const isManager = user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN';

  const fetchChampionships = () => {
    setLoading(true);
    fetch(`${API_URL}/championships`)
      .then(res => res.json())
      .then(data => {
        setChampionships(data);
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
    fetch(`${API_URL}/teams/my/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
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
      <Navbar />
      <div className="min-h-screen bg-slate-50 pb-24 font-inter text-slate-800 pt-20">
        
        {/* HERO HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Trophy size={400} />
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Hub de Campeonatos
              </h1>
              <p className="text-blue-100 text-lg max-w-xl mb-6">
                Explore os campeonatos disponíveis, junte-se a uma atlética e inscreva-se para competir nas maiores disputas universitárias.
              </p>
              
              {!user && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 inline-block">
                  <p className="font-medium text-sm text-white flex items-center gap-2"><Shield size={16}/> Você não está logado.</p>
                  <p className="text-xs text-blue-200 mt-1">Faça login para se vincular a uma atlética.</p>
                </div>
              )}
            </div>
            
            {/* Quick Stats / Summary Cards */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                <span className="text-3xl font-extrabold block mb-1">
                  {championships.filter(c => c.status === 'OPEN').length}
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
              <button 
                onClick={() => setActiveTab('manage')}
                className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center ${activeTab === 'manage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Settings size={16} /> Gestão
              </button>
            )}
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'explore' && (
            <div className="animate-in fade-in duration-500">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
              ) : championships.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-200">
                  <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-2xl font-bold text-slate-600">Nenhum campeonato aberto.</h3>
                  <p className="text-slate-500 mt-2">A temporada está tranquila no momento. Volte em breve!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {championships.map(champ => {
                    const isOpen = champ.status === 'OPEN' && (!champ.enrollmentDeadline || new Date(champ.enrollmentDeadline) >= new Date());
                    
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
                          <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {isOpen ? 'Inscrições Abertas' : 'Encerrado'}
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

          {activeTab === 'manage' && isManager && (
            <div className="animate-in fade-in duration-500">
              <OrganizerDashboard />
            </div>
          )}
          
        </div>
      </div>
    </>
  );
}
