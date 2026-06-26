import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Users, Shield, Check, Plus, Copy, CheckCircle2, X, Info, ArrowLeft, Calendar, MapPin, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import SubscriptionStepper from '../components/championships/SubscriptionStepper';
import ConfirmSubscriptionModal from '../components/championships/ConfirmSubscriptionModal';

export default function ChampionshipDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  
  const [champ, setChamp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [teamAvailabilities, setTeamAvailabilities] = useState<any[]>([]);
  
  // Bulk Registration State
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Roster Management State
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Filters State
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');

  const fetchChampionship = () => {
    setLoading(true);
    fetch(`${API_URL}/championships/${id}`)
      .then(res => res.json())
      .then(data => {
        setChamp(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao buscar campeonato');
        setLoading(false);
      });
  };

  const fetchProfile = () => {
    if (!token) return;
    fetch(`${API_URL}/teams/my/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setAthleteProfile(data || null);
      if (data?.team?.id) {
        fetchAvailabilities(data.team.id, data.id);
      }
    })
    .catch(err => console.error('Erro ao buscar perfil', err));
  };

  const fetchAvailabilities = (teamId: string, profileId: string) => {
    if (!token || !id) return;
    fetch(`${API_URL}/teams/${teamId}/availability/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setTeamAvailabilities(data);
        const myAvail = data.find((a: any) => a.athleteProfile?.id === profileId);
        if (myAvail && myAvail.status === 'AVAILABLE') {
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
        }
      }
    })
    .catch(err => console.error('Erro ao buscar disponibilidade', err));
  };

  const fetchMySubscriptions = () => {
    if (!token) return;
    fetch(`${API_URL}/championships/my-subscriptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setMySubscriptions(data || []);
    })
    .catch(err => console.error('Erro ao buscar inscrições', err));
  };

  const fetchTeamMembers = (teamId: string) => {
    setLoadingMembers(true);
    fetch(`${API_URL}/teams/${teamId}/members`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setTeamMembers(data);
      setLoadingMembers(false);
    })
    .catch(err => {
      console.error('Erro ao buscar membros', err);
      setLoadingMembers(false);
    });
  };

  useEffect(() => {
    fetchChampionship();
    fetchProfile();
    fetchMySubscriptions();
  }, [id, token]);

  const toggleModality = (modId: string) => {
    setSelectedModalities(prev => 
      prev.includes(modId) ? prev.filter(mId => mId !== modId) : [...prev, modId]
    );
  };

  const toggleAvailability = async () => {
    if (!user || !athleteProfile?.team) return;
    setLoadingAvailability(true);
    try {
      const newStatus = !isAvailable;
      const res = await fetch(`${API_URL}/teams/availability/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: newStatus })
      });
      if (!res.ok) throw new Error('Erro ao alterar disponibilidade');
      setIsAvailable(newStatus);
      toast.success(newStatus ? 'Sua disponibilidade foi confirmada!' : 'Você marcou como indisponível.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleBulkSubscribe = async () => {
    if (!user) {
      toast.error('Faça login para se inscrever!');
      return;
    }
    if (!athleteProfile?.team) {
      toast.error('Você precisa estar vinculado a uma equipe para se inscrever.');
      return;
    }
    if (selectedModalities.length === 0) return;

    setIsSubscribing(true);
    const toastId = toast.loading(`Processando ${selectedModalities.length} inscrição(ões)...`);
    
    let successCount = 0;
    let errors: string[] = [];

    for (const modId of selectedModalities) {
      try {
        const res = await fetch(`${API_URL}/championships/${modId}/enroll`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) {
          errors.push(data.message || `Erro na modalidade ${modId}`);
        } else {
          successCount++;
        }
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} inscrição(ões) realizada(s) com sucesso!`, { id: toastId });
      setSelectedModalities([]);
      setIsConfirmModalOpen(false);
      fetchMySubscriptions();
    } else {
      toast.error('Nenhuma inscrição foi concluída. Erro: ' + errors[0], { id: toastId });
    }
    
    setIsSubscribing(false);
  };

  const handleUnsubscribe = async (modId: string) => {
    const toastId = toast.loading('Cancelando inscrição...');
    try {
      const res = await fetch(`${API_URL}/championships/${modId}/unenroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao cancelar inscrição.');
      
      toast.success('Inscrição cancelada!', { id: toastId });
      fetchMySubscriptions();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleAddToRoster = async (subId: string, athleteId: string) => {
    const toastId = toast.loading('Adicionando ao elenco...');
    try {
      const res = await fetch(`${API_URL}/championships/subscription/${subId}/roster/${athleteId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao adicionar atleta.');
      
      toast.success('Atleta adicionado!', { id: toastId });
      setSelectedSubscription(data);
      fetchMySubscriptions();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleRemoveFromRoster = async (subId: string, athleteId: string) => {
    const toastId = toast.loading('Removendo do elenco...');
    try {
      const res = await fetch(`${API_URL}/championships/subscription/${subId}/roster/${athleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao remover atleta.');
      
      toast.success('Atleta removido!', { id: toastId });
      setSelectedSubscription(data);
      fetchMySubscriptions();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </>
    );
  }

  if (!champ) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Campeonato não encontrado</h2>
          <Link to="/campeonatos" className="text-blue-600 hover:underline">Voltar para a lista</Link>
        </div>
      </>
    );
  }

  const isEnrollmentOpen = champ.status === 'OPEN' && (!champ.enrollmentDeadline || new Date(champ.enrollmentDeadline) >= new Date());

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pb-24 font-inter text-slate-800 pt-20">
        
        {/* HERO HEADER */}
        <div className="relative pt-32 pb-20 overflow-hidden">
          {champ.bannerUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${API_URL}${champ.bannerUrl})` }}
              />
              <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" />
          )}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10 text-white">
            <Link 
              to="/campeonatos" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-all mb-8 text-sm font-bold tracking-wide"
            >
              <ArrowLeft size={16} /> Voltar
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    isEnrollmentOpen ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isEnrollmentOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas'}
                  </span>
                  {champ.settings?.requireRg && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                      <AlertCircle size={12} /> Exige Documentação
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-mono font-bold uppercase tracking-tighter mb-4 text-white drop-shadow-md">
                  {champ.name}
                </h1>
                
                <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                  {champ.description || 'Nenhuma descrição fornecida para este campeonato.'}
                </p>
              </div>
            </div>
            
            {/* Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10 border-t border-slate-700/50 pt-8">
              <div className="flex items-start gap-3">
                <Calendar className="text-blue-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Período</p>
                  <p className="font-medium text-slate-200">
                    {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}
                    {champ.endDate ? ` até ${new Date(champ.endDate).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="text-orange-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Inscrições até</p>
                  <p className="font-medium text-slate-200">
                    {champ.enrollmentDeadline ? new Date(champ.enrollmentDeadline).toLocaleDateString() : 'Sem prazo definido'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="text-green-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Local(is)</p>
                  <p className="font-medium text-slate-200">
                    {champ.settings?.locations?.join(', ') || 'A definir'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Trophy className="text-yellow-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Modalidades</p>
                  <p className="font-medium text-slate-200">
                    {champ.modalities?.length || 0} disputas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Info size={24} />
                </div>
                <div>
                   <h3 className="font-mono font-bold uppercase tracking-wider text-lg text-slate-800">Quer participar?</h3>
                   <p className="text-slate-600 text-sm mt-1">Faça login e vincule-se a uma atlética para se inscrever nas modalidades.</p>
                 </div>
              </div>
              <Link to="/" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm">
                Fazer Login
              </Link>
            </div>
          )}

          {user && !athleteProfile?.team && (
             <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                   <Shield size={24} />
                 </div>
                 <div>
                   <h3 className="font-mono font-bold uppercase tracking-wider text-lg text-slate-800">Quase lá!</h3>
                   <p className="text-slate-600 text-sm mt-1">Você precisa estar vinculado a uma atlética para poder se inscrever.</p>
                 </div>
               </div>
               <Link to="/perfil" className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-700 transition-colors whitespace-nowrap shadow-sm">
                 Vincular-se a uma Atlética
               </Link>
             </div>
          )}

          {/* Painel de Disponibilidade do Atleta */}
          {user && athleteProfile?.team && athleteProfile.teamRole !== 'PRESIDENT' && isEnrollmentOpen && (
            <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm transition-colors duration-300 ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                  {isAvailable ? <CheckCircle2 size={24} /> : <Info size={24} />}
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase tracking-wider text-lg text-slate-800">Sua Disponibilidade</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    {isAvailable 
                      ? "Você está marcado como DISPONÍVEL para jogar este campeonato. Seu presidente será notificado!"
                      : "Confirme sua disponibilidade para sinalizar ao presidente da sua equipe que você quer ser convocado."}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleAvailability}
                disabled={loadingAvailability}
                className={`font-bold py-2.5 px-6 rounded-xl transition-all whitespace-nowrap shadow-sm disabled:opacity-50 ${isAvailable ? 'bg-white text-green-700 border border-green-300 hover:bg-green-50' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {loadingAvailability ? 'Atualizando...' : (isAvailable ? 'Remover Disponibilidade' : 'Estou Disponível!')}
              </button>
            </div>
          )}

          {/* Modalities Section */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-slate-800 flex items-center gap-3">
                <CheckCircle2 className="text-blue-600" /> 
                Modalidades
              </h2>
              
              {/* Filter Bar */}
              {champ.modalities && champ.modalities.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome..." 
                      className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="ALL">Todos os Tipos</option>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="COLETIVO">Coletivo</option>
                    </select>
                    <select 
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm cursor-pointer"
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                    >
                      <option value="ALL">Todos os Gêneros</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMININO">Feminino</option>
                      <option value="MISTO">Misto</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {(() => {
              const filteredModalities = champ.modalities?.filter((mod: any) => {
                const matchesText = mod.name.toLowerCase().includes(filterText.toLowerCase());
                const matchesType = filterType === 'ALL' || mod.type === filterType;
                const matchesGender = filterGender === 'ALL' || (mod.gender || 'MISTO') === filterGender;
                return matchesText && matchesType && matchesGender;
              }) || [];

              if (!champ.modalities || champ.modalities.length === 0) {
                return (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-600">Nenhuma modalidade disponível</h3>
                    <p className="text-slate-500 mt-2">A organização ainda não cadastrou modalidades para este campeonato.</p>
                  </div>
                );
              }

              if (filteredModalities.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
                    <Filter size={32} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-slate-600">Nenhuma modalidade encontrada</h3>
                    <p className="text-slate-500 text-sm mt-1">Tente ajustar os filtros de busca para encontrar outras modalidades.</p>
                    <button 
                      onClick={() => { setFilterText(''); setFilterType('ALL'); setFilterGender('ALL'); }}
                      className="mt-4 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModalities.map((mod: any) => {
                  const subscription = mySubscriptions.find(s => s.modality?.id === mod.id);
                  const isSubscribed = !!subscription;
                  const isSelected = selectedModalities.includes(mod.id);
                  
                  if (isSubscribed) {
                    return (
                      <div key={mod.id} className="relative bg-white rounded-2xl border-2 border-green-500 shadow-sm overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={14} /> INSCRITO
                        </div>
                        <div className="p-6 pb-4 border-b border-slate-100">
                          <div className="flex gap-2 mb-2">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">{mod.type}</span>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">{mod.gender || 'MISTO'}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xl leading-tight mb-2">{mod.name}</h4>
                        </div>
                        
                        <div className="p-6 pt-4 bg-green-50/30 flex-1 flex flex-col">
                          <SubscriptionStepper status={subscription.status} />
                          
                          <div className="mt-4 flex justify-between items-center gap-4">
                            <button 
                              onClick={() => handleUnsubscribe(mod.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline px-2"
                            >
                              Cancelar
                            </button>
                            
                            {mod.type === 'COLETIVO' && athleteProfile?.teamRole === 'PRESIDENT' && (
                              <button 
                                onClick={() => { 
                                  setSelectedSubscription(subscription); 
                                  fetchTeamMembers(athleteProfile.team.id);
                                  setShowRosterModal(true); 
                                }}
                                className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-700 shadow-sm flex-1 text-center transition-colors"
                              >
                                Elenco
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={mod.id} 
                      onClick={() => isEnrollmentOpen && toggleModality(mod.id)}
                      className={`relative bg-white rounded-2xl border-2 transition-all flex flex-col overflow-hidden ${
                        !isEnrollmentOpen ? 'opacity-60 cursor-not-allowed border-slate-200' :
                        isSelected ? 'border-blue-500 shadow-md shadow-blue-500/10 cursor-pointer scale-[1.02] transform' : 'border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className={`absolute top-5 right-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10 ${
                        isSelected ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      
                      <div className="p-6 pb-4 border-b border-slate-100">
                        <div className="flex gap-2 mb-2 pr-8">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${mod.type === 'COLETIVO' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                            {mod.type}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider">
                            {mod.gender || 'MISTO'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xl leading-tight mb-2">{mod.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500 font-medium">
                          {mod.type === 'COLETIVO' && (
                            <div className="flex items-center gap-1">
                              <Users size={14} /> {mod.minAthletes} a {mod.maxAthletes} atletas
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="font-mono">{mod.minAge || 0} - {mod.maxAge || 99} anos</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-6 pt-4 flex-1 flex flex-col justify-end ${isSelected ? 'bg-blue-50/50' : 'bg-slate-50/50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Taxa de Inscrição</span>
                          <span className="font-extrabold text-slate-800 text-lg">
                            {Number(mod.price) === 0 ? 'Grátis' : `R$ ${Number(mod.price).toFixed(2).replace('.', ',')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR FOR BULK SUBSCRIPTION */}
      {selectedModalities.length > 0 && user && athleteProfile?.team && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] p-4 px-6 z-40 transform transition-transform animate-in slide-in-from-bottom-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                {selectedModalities.length}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 leading-tight">Modalidades selecionadas</p>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {selectedModalities.map(id => champ.modalities.find((m: any) => m.id === id)?.name).join(', ')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsConfirmModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 flex justify-center items-center gap-2"
              disabled={isSubscribing}
            >
              {isSubscribing ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Inscrições'}
            </button>
          </div>
        </div>
      )}

      {/* ROSTER MODAL */}
      {showRosterModal && selectedSubscription && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRosterModal(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-2xl">{selectedSubscription.modality.name}</h3>
                <p className="text-blue-200 text-sm">{selectedSubscription.modality.championship?.name}</p>
              </div>
              <button onClick={() => setShowRosterModal(false)} className="text-blue-200 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Available Team Members */}
              <div>
                <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Seu Plantel</h4>
                {loadingMembers ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {[...teamMembers].sort((a, b) => {
                      const availA = teamAvailabilities.some(av => av.athleteProfile?.id === a.id && av.status === 'AVAILABLE');
                      const availB = teamAvailabilities.some(av => av.athleteProfile?.id === b.id && av.status === 'AVAILABLE');
                      if (availA && !availB) return -1;
                      if (!availA && availB) return 1;
                      return 0;
                    }).map((member: any) => {
                      const isInRoster = selectedSubscription.athletes?.some((a: any) => a.id === member.id);
                      if (isInRoster) return null; // already in roster

                      const isMemberAvailable = teamAvailabilities.some(av => av.athleteProfile?.id === member.id && av.status === 'AVAILABLE');

                      return (
                        <div key={member.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center hover:bg-white hover:border-slate-300 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 text-sm">{member.user?.name}</p>
                              {isMemberAvailable && (
                                <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Disponível
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">{member.cpf} | {member.gender || 'N/A'}</p>
                          </div>
                          <button 
                            onClick={() => handleAddToRoster(selectedSubscription.id, member.id)}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      );
                    })}
                    {teamMembers.filter(m => !selectedSubscription.athletes?.some((a: any) => a.id === m.id)).length === 0 && (
                      <p className="text-sm text-slate-500 italic text-center py-4">Nenhum atleta disponível para adicionar.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side: Modality Roster */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col">
                <h4 className="font-bold text-lg text-slate-800 mb-1 border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span>Elenco Inscrito</span>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    selectedSubscription.athletes?.length >= selectedSubscription.modality.minAthletes ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedSubscription.athletes?.length || 0} / {selectedSubscription.modality.maxAthletes || '∞'}
                  </span>
                </h4>
                
                <div className="space-y-2 mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedSubscription.athletes?.map((athlete: any) => (
                    <div key={athlete.id} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{athlete.user?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{athlete.cpf}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromRoster(selectedSubscription.id, athlete.id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        title="Remover do Elenco"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {(!selectedSubscription.athletes || selectedSubscription.athletes.length === 0) && (
                    <p className="text-sm text-slate-500 italic text-center py-8">Nenhum atleta no elenco ainda.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE INSCRIÇÃO */}
      <ConfirmSubscriptionModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleBulkSubscribe}
        selectedModalities={champ?.modalities?.filter((m: any) => selectedModalities.includes(m.id)) || []}
        championshipSettings={champ?.settings}
        isSubscribing={isSubscribing}
      />
    </>
  );
}
