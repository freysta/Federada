import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { IChampionship, IAthleteProfile, ISubscription } from '../types';
import { API_URL } from '../config';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Shield, CheckCircle2, Info, ArrowLeft, Calendar, MapPin, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

function QuickProfileEditModal({ 
  isOpen, 
  onClose, 
  profile, 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  profile: any, 
  onSuccess: (updatedProfile: any) => void 
}) {
  const [gender, setGender] = useState(profile?.gender || '');
  const [cpf, setCpf] = useState(profile?.cpf || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      toast.error('Gênero é obrigatório para continuar.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.put(`/teams/my/profile`, {
        gender,
        cpf: cpf || undefined
      });
      toast.success('Perfil atualizado!');
      onSuccess(data);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-start gap-3">
          <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-orange-800">Informação Faltante</h3>
            <p className="text-sm text-orange-700 mt-1">Para continuar com a inscrição, precisamos que você complete alguns dados do seu perfil.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Gênero <span className="text-red-500">*</span></label>
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            >
              <option value="">Selecione o gênero...</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">CPF <span className="text-slate-400 font-normal">(Opcional)</span></label>
            <input 
              type="text" 
              value={cpf} 
              onChange={e => setCpf(e.target.value)} 
              placeholder="000.000.000-00"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Salvando...' : 'Salvar e Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import ConfirmSubscriptionModal from '../components/championships/ConfirmSubscriptionModal';
import RosterModal from '../components/championships/RosterModal';
import ModalityCard from '../components/championships/ModalityCard';

export default function ChampionshipDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const toggleAvailability = async () => {
    setLoadingAvailability(true);
    setTimeout(() => {
      setIsAvailable(!isAvailable);
      setLoadingAvailability(false);
    }, 500);
  };
  
  const [champ, setChamp] = useState<IChampionship | null>(null);
  const [loading, setLoading] = useState(true);

  const [athleteProfile, setAthleteProfile] = useState<IAthleteProfile | null>(null);
  const [mySubscriptions, setMySubscriptions] = useState<ISubscription[]>([]);
  const [teamMembers, setTeamMembers] = useState<IAthleteProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const [showQuickProfile, setShowQuickProfile] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
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

  // Tabs State
  const [activeTab, setActiveTab] = useState<'overview' | 'modalities' | 'teams' | 'brackets'>('overview');

  const fetchChampionship = () => {
    setLoading(true);
    apiClient.get<IChampionship>(`/championships/${id}`)
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
    apiClient.get<IAthleteProfile>('/teams/my/profile')
    .then(data => {
      setAthleteProfile(data || null);
      if (data?.team?.id) {
        fetchAvailabilities(data.team.id);
      }
    })
    .catch(err => console.error('Erro ao buscar perfil', err));
  };

  const fetchAvailabilities = (teamId: string) => {
    if (!token || !id) return;
    apiClient.get<any[]>(`/teams/${teamId}/availability/${id}`)
    .then(data => {
      if (Array.isArray(data)) {
        setTeamAvailabilities(data);
      }
    })
    .catch(err => console.error('Erro ao buscar disponibilidade', err));
  };

  const fetchMySubscriptions = () => {
    if (!token) return;
    apiClient.get<ISubscription[]>('/championships/my-subscriptions')
    .then(data => {
      setMySubscriptions(data || []);
    })
    .catch(err => console.error('Erro ao buscar inscrições', err));
  };

  const fetchTeamMembers = (teamId: string) => {
    setLoadingMembers(true);
    apiClient.get<IAthleteProfile[]>(`/teams/${teamId}/members`)
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
  }, [id]);

  const toggleModality = (modId: string) => {
    setSelectedModalities(prev => 
      prev.includes(modId) ? prev.filter(mId => mId !== modId) : [...prev, modId]
    );
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
    if (!athleteProfile.gender) {
      setShowQuickProfile(true);
      return;
    }
    if (selectedModalities.length === 0) return;

    setIsSubscribing(true);
    const toastId = toast.loading(`Processando ${selectedModalities.length} inscrição(ões)...`);
    
    let successCount = 0;
    let errors: string[] = [];

    for (const modId of selectedModalities) {
      try {
        await apiClient.post(`/championships/${modId}/enroll`, {});
        successCount++;
      } catch (err: any) {
        errors.push(err.message || `Erro na modalidade ${modId}`);
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
      await apiClient.post(`/championships/${modId}/unenroll`, {});
      
      toast.success('Inscrição cancelada!', { id: toastId });
      fetchMySubscriptions();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleAddToRoster = async (subId: string, athleteId: string) => {
    const toastId = toast.loading('Adicionando ao elenco...');
    try {
      const data = await apiClient.post<any>(`/championships/subscription/${subId}/roster/${athleteId}`, {});
      
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
      const data = await apiClient.delete<any>(`/championships/subscription/${subId}/roster/${athleteId}`);
      
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </>
    );
  }

  if (!champ) {
    return (
      <>
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
      <div className="min-h-screen bg-transparent pb-24 font-inter text-slate-200 pt-20">
        
        {/* HERO HEADER */}
        <div className="relative pt-10 pb-10 overflow-hidden">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-all mb-4 text-sm font-bold tracking-wide"
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
                
                <h1 className="text-3xl md:text-4xl font-mono font-bold uppercase tracking-tighter mb-3 text-white drop-shadow-md">
                  {champ.name}
                </h1>
                
                <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
                  {champ.description || 'Nenhuma descrição fornecida para este campeonato.'}
                </p>
              </div>
            </div>
            
            {/* Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-700/50 pt-6">
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

        {/* TABS NAVIGATION */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-20 z-30 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 flex gap-8 overflow-x-auto no-scrollbar font-mono text-sm uppercase tracking-wider font-bold">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('modalities')}
              className={`py-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'modalities' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
            >
              Modalidades
              {champ.modalities && champ.modalities.length > 0 && (
                <span className="bg-slate-800 text-slate-400 py-0.5 px-2 rounded-full text-xs border border-slate-700">{champ.modalities.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('teams')}
              className={`py-4 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'teams' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
            >
              Equipes Inscritas
            </button>
            <button 
              onClick={() => setActiveTab('brackets')}
              className={`py-4 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'brackets' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
            >
              Chaveamentos & Resultados
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-500 space-y-10">
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-sm backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4 font-mono uppercase tracking-wider">Sobre o Evento</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{champ.description || 'Nenhuma descrição detalhada fornecida para este campeonato.'}</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-sm backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4 font-mono uppercase tracking-wider">Regulamento Geral</h3>
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 text-center">
                  <Info className="mx-auto text-slate-500 mb-2" size={32} />
                  <p className="text-slate-400">O regulamento ainda não foi anexado pela organização.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="animate-in fade-in duration-500 text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 shadow-sm backdrop-blur-sm">
              <Shield className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-300">Equipes Inscritas</h3>
              <p className="text-slate-500 mt-2">As equipes inscritas aparecerão aqui em breve.</p>
            </div>
          )}

          {activeTab === 'brackets' && (
            <div className="animate-in fade-in duration-500 text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 shadow-sm backdrop-blur-sm">
              <Trophy className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-300">Chaveamentos em Construção</h3>
              <p className="text-slate-500 mt-2">A tabela de confrontos será gerada após o encerramento das inscrições.</p>
            </div>
          )}

          {activeTab === 'modalities' && (
            <div className="animate-in fade-in duration-500 space-y-10">
              {!user && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_15px_rgba(59,130,246,0.1)] backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/30">
                  <Info size={24} />
                </div>
                <div>
                   <h3 className="font-mono font-bold uppercase tracking-wider text-lg text-white">Quer participar?</h3>
                   <p className="text-slate-300 text-sm mt-1">Faça login e vincule-se a uma atlética para se inscrever nas modalidades.</p>
                 </div>
              </div>
              <Link to="/" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all whitespace-nowrap border border-blue-400/50">
                Fazer Login
              </Link>
            </div>
          )}

          {user && !athleteProfile?.team && (
             <div className="bg-orange-900/20 border border-orange-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_15px_rgba(249,115,22,0.1)] backdrop-blur-sm">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-900/50 rounded-full flex items-center justify-center text-orange-400 shrink-0 border border-orange-500/30">
                   <Shield size={24} />
                 </div>
                 <div>
                   <h3 className="font-mono font-bold uppercase tracking-wider text-lg text-white">Quase lá!</h3>
                   <p className="text-slate-300 text-sm mt-1">Você precisa estar vinculado a uma atlética para poder se inscrever.</p>
                 </div>
               </div>
               <Link to="/perfil" className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all whitespace-nowrap border border-orange-400/50">
                 Vincular-se a uma Atlética
               </Link>
             </div>
          )}

          {/* Painel de Disponibilidade do Atleta */}
          {user && athleteProfile?.team && athleteProfile.teamRole !== 'PRESIDENT' && isEnrollmentOpen && (
            <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm transition-colors duration-300 backdrop-blur-sm ${isAvailable ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${isAvailable ? 'bg-green-900/50 text-green-400 border-green-500/30' : 'bg-slate-900/50 text-slate-400 border-slate-700'}`}>
                  {isAvailable ? <CheckCircle2 size={24} /> : <Info size={24} />}
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase tracking-wider text-lg text-white">Sua Disponibilidade</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    {isAvailable 
                      ? "Você está marcado como DISPONÍVEL para jogar este campeonato. Seu presidente será notificado!"
                      : "Confirme sua disponibilidade para sinalizar ao presidente da sua equipe que você quer ser convocado."}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleAvailability}
                disabled={loadingAvailability}
                className={`font-bold py-2.5 px-6 rounded-xl transition-all whitespace-nowrap shadow-sm disabled:opacity-50 border ${isAvailable ? 'bg-transparent text-green-400 border-green-500/50 hover:bg-green-900/40' : 'bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'}`}
              >
                {loadingAvailability ? 'Atualizando...' : (isAvailable ? 'Remover Disponibilidade' : 'Estou Disponível!')}
              </button>
            </div>
          )}

          {/* Modalities Section */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-white flex items-center gap-3">
                <CheckCircle2 className="text-blue-500" /> 
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
                      className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm cursor-pointer"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="ALL">Todos os Tipos</option>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="COLETIVO">Coletivo</option>
                    </select>
                    <select 
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm cursor-pointer"
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
                  <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-slate-700 shadow-sm backdrop-blur-sm">
                    <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-300">Nenhuma modalidade disponível</h3>
                    <p className="text-slate-500 mt-2">A organização ainda não cadastrou modalidades para este campeonato.</p>
                  </div>
                );
              }

              if (filteredModalities.length === 0) {
                return (
                  <div className="text-center py-12 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700 backdrop-blur-sm">
                    <Filter size={32} className="mx-auto text-slate-600 mb-3" />
                    <h3 className="font-bold text-slate-300">Nenhuma modalidade encontrada</h3>
                    <p className="text-slate-500 text-sm mt-1">Tente ajustar os filtros de busca para encontrar outras modalidades.</p>
                    <button 
                      onClick={() => { setFilterText(''); setFilterType('ALL'); setFilterGender('ALL'); }}
                      className="mt-4 px-4 py-2 text-sm font-bold text-blue-400 bg-blue-900/50 border border-blue-500/30 rounded-lg hover:bg-blue-800/50 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModalities.map((mod: any) => {
                  const subscription = mySubscriptions?.find(s => s.modality?.id === mod.id);
                  const isSelected = selectedModalities.includes(mod.id);
                  
                  return (
                    <ModalityCard 
                      key={mod.id}
                      mod={mod}
                      subscription={subscription}
                      isSelected={isSelected}
                      isEnrollmentOpen={isEnrollmentOpen}
                      athleteProfile={athleteProfile}
                      onToggle={toggleModality}
                      onUnsubscribe={handleUnsubscribe}
                      onShowRoster={(sub) => {
                        setSelectedSubscription(sub); 
                        if(athleteProfile?.team?.id) fetchTeamMembers(athleteProfile.team.id);
                        setShowRosterModal(true); 
                      }}
                    />
                  );
                })}
              </div>
              );
            })()}
          </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING ACTION BAR FOR BULK SUBSCRIPTION */}
      {selectedModalities.length > 0 && user && athleteProfile?.team && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] p-4 px-6 z-40 transform transition-transform animate-in slide-in-from-bottom-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500/50 text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                {selectedModalities.length}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white leading-tight">Modalidades selecionadas</p>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {selectedModalities.map(id => champ.modalities?.find((m: any) => m.id === id)?.name).join(', ')}
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
      <RosterModal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        selectedSubscription={selectedSubscription}
        teamMembers={teamMembers}
        teamAvailabilities={teamAvailabilities}
        loadingMembers={loadingMembers}
        onAddToRoster={handleAddToRoster}
        onRemoveFromRoster={handleRemoveFromRoster}
      />

      {/* MODAL DE CONFIRMAÇÃO DE INSCRIÇÃO */}
      <ConfirmSubscriptionModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleBulkSubscribe}
        selectedModalities={champ?.modalities?.filter((m: any) => selectedModalities.includes(m.id)) || []}
        championshipSettings={champ?.settings}
        isSubscribing={isSubscribing}
      />

      {/* Quick Profile Edit Modal */}
      <QuickProfileEditModal 
        isOpen={showQuickProfile} 
        onClose={() => setShowQuickProfile(false)} 
        profile={athleteProfile} 
        onSuccess={(updated) => {
          setAthleteProfile(updated);
          // Auto continue
          handleBulkSubscribe();
        }}
      />
    </>
  );
}
