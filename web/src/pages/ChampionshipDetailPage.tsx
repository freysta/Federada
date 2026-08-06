import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { IChampionship, IAthleteProfile, ISubscription } from '../types';
import { API_URL } from '../config';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  Loader2, Trophy, Shield, CheckCircle2, XCircle, Info, ArrowLeft, 
  Calendar, MapPin, AlertCircle, Clock, Search, Filter, Upload, 
  FileText, Users, Copy, Check, ExternalLink, FileCheck2, UserCheck, Sparkles, Swords
} from 'lucide-react';
import toast from 'react-hot-toast';

import ConfirmSubscriptionModal from '../components/championships/ConfirmSubscriptionModal';
import RosterModal from '../components/championships/RosterModal';
import ModalityCard from '../components/championships/ModalityCard';
import ChampionshipDetailNav from '../components/championships/ChampionshipDetailNav';

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
      const data = await apiClient.put<any>(`/teams/my/profile`, {
        gender,
        cpf: cpf || undefined
      });
      toast.success('Perfil atualizado com sucesso!');
      onSuccess(data);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-inter">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="bg-orange-50 p-6 border-b border-orange-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <AlertCircle size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Informações Obrigatórias</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Para prosseguir com a inscrição, precisamos de alguns dados essenciais no seu perfil de atleta.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Gênero <span className="text-orange-600">*</span>
            </label>
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)} 
              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
              required
            >
              <option value="">Selecione o gênero...</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              CPF <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <input 
              type="text" 
              value={cpf} 
              onChange={e => setCpf(e.target.value)} 
              placeholder="000.000.000-00"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 disabled:opacity-50 text-xs tracking-wider uppercase transition-colors shadow-md shadow-orange-600/20 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              {loading ? 'Salvando...' : 'Salvar e Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChampionshipDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const [champ, setChamp] = useState<IChampionship | null>(null);
  const [loading, setLoading] = useState(true);

  const [athleteProfile, setAthleteProfile] = useState<IAthleteProfile | null>(null);
  const [mySubscriptions, setMySubscriptions] = useState<ISubscription[]>([]);
  const [teamMembers, setTeamMembers] = useState<IAthleteProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [joinRequests, setJoinRequests] = useState<IAthleteProfile[]>([]);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);

  const [showQuickProfile, setShowQuickProfile] = useState(false);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [teamAvailabilities, setTeamAvailabilities] = useState<any[]>([]);

  // Document Uploading States
  const [uploadingRg, setUploadingRg] = useState(false);
  const [uploadingEnrollment, setUploadingEnrollment] = useState(false);

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
  const [activeTab, setActiveTab] = useState('visao-geral');

  const fetchChampionship = () => {
    setLoading(true);
    apiClient.get<IChampionship>(`/championships/${id}`)
      .then(data => {
        setChamp(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar detalhes do campeonato');
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
        const isPres = data.teamRole === 'PRESIDENT' || data.team.owner?.id === user?.id || (user as any)?.userType === 'PRESIDENT';
        if (isPres) {
          fetchTeamMembers(data.team.id);
          fetchJoinRequests();
        }
      }
    })
    .catch(err => console.error('Erro ao buscar perfil:', err));
  };

  const fetchAvailabilities = (teamId: string) => {
    if (!token || !id) return;
    apiClient.get<any[]>(`/teams/${teamId}/availability/${id}`)
    .then(data => {
      if (Array.isArray(data)) {
        setTeamAvailabilities(data);
        if (athleteProfile?.id) {
          const myAvail = data.find(av => av.athleteProfile?.id === athleteProfile.id || av.athleteId === athleteProfile.id);
          if (myAvail) {
            setIsAvailable(myAvail.status === 'AVAILABLE');
          }
        }
      }
    })
    .catch(err => console.error('Erro ao buscar disponibilidade:', err));
  };

  const fetchMySubscriptions = () => {
    if (!token) return;
    apiClient.get<ISubscription[]>('/championships/my-subscriptions')
    .then(data => {
      setMySubscriptions(data || []);
    })
    .catch(err => console.error('Erro ao buscar inscrições:', err));
  };

  const fetchTeamMembers = (teamId: string) => {
    setLoadingMembers(true);
    apiClient.get<IAthleteProfile[]>(`/teams/${teamId}/members`)
    .then(data => {
      setTeamMembers(data || []);
      setLoadingMembers(false);
    })
    .catch(err => {
      console.error('Erro ao buscar membros da equipe:', err);
      setLoadingMembers(false);
    });
  };

  const fetchJoinRequests = () => {
    if (!token) return;
    setLoadingJoinRequests(true);
    apiClient.get<IAthleteProfile[]>('/teams/my-team/join-requests')
    .then(data => {
      setJoinRequests(data || []);
      setLoadingJoinRequests(false);
    })
    .catch(err => {
      console.error('Erro ao buscar solicitações de entrada:', err);
      setLoadingJoinRequests(false);
    });
  };

  useEffect(() => {
    fetchChampionship();
    fetchProfile();
    fetchMySubscriptions();
  }, [id]);

  const toggleAvailability = async () => {
    setLoadingAvailability(true);
    setTimeout(() => {
      const nextState = !isAvailable;
      setIsAvailable(nextState);
      setLoadingAvailability(false);
      if (nextState) {
        toast.success('Disponibilidade confirmada! Seu presidente foi notificado.');
      } else {
        toast('Sua disponibilidade foi removida.', { icon: 'ℹ️' });
      }
    }, 400);
  };

  const handleJoinRequest = async (profileId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/teams/my-team/requests/${profileId}/status`, { status });
      toast.success(status === 'APPROVED' ? 'Atleta aprovado para a equipe!' : 'Solicitação recusada com sucesso.');
      fetchJoinRequests();
      if (athleteProfile?.team?.id) {
        fetchTeamMembers(athleteProfile.team.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar solicitação.');
    }
  };

  const handleUploadDocument = async (type: 'rg' | 'enrollment', file: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    if (type === 'rg') setUploadingRg(true);
    else setUploadingEnrollment(true);

    try {
      await apiClient.post(`/teams/my/documents/${type}`, formData);
      toast.success(`Documento (${type === 'rg' ? 'RG / Identidade' : 'Matrícula'}) enviado com sucesso!`);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'Falha no envio do documento.');
    } finally {
      if (type === 'rg') setUploadingRg(false);
      else setUploadingEnrollment(false);
    }
  };

  const toggleModality = (modId: string) => {
    setSelectedModalities(prev => 
      prev.includes(modId) ? prev.filter(mId => mId !== modId) : [...prev, modId]
    );
  };

  const handleBulkSubscribe = async () => {
    if (!user) {
      toast.error('Faça login para realizar inscrições.');
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
    const toastId = toast.loading(`Iniciando ${selectedModalities.length} inscrição(ões)...`);
    
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
      toast.success(`${successCount} modalidade(s) inscrita(s) com sucesso!`, { id: toastId });
      setSelectedModalities([]);
      setIsConfirmModalOpen(false);
      fetchMySubscriptions();
    } else {
      toast.error('Nenhuma inscrição concluída. Motivo: ' + (errors[0] || 'Erro interno'), { id: toastId });
    }
    
    setIsSubscribing(false);
  };

  const handleUnsubscribe = async (modId: string) => {
    const toastId = toast.loading('Cancelando inscrição...');
    try {
      await apiClient.post(`/championships/${modId}/unenroll`, {});
      toast.success('Inscrição cancelada com sucesso!', { id: toastId });
      fetchMySubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar inscrição.', { id: toastId });
    }
  };

  const handleAddToRoster = async (subId: string, athleteId: string) => {
    const toastId = toast.loading('Adicionando atleta ao elenco...');
    try {
      const data = await apiClient.post<any>(`/championships/subscription/${subId}/roster/${athleteId}`, {});
      toast.success('Atleta adicionado ao elenco!', { id: toastId });
      setSelectedSubscription(data);
      fetchMySubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar ao elenco.', { id: toastId });
    }
  };

  const handleRemoveFromRoster = async (subId: string, athleteId: string) => {
    const toastId = toast.loading('Removendo do elenco...');
    try {
      const data = await apiClient.delete<any>(`/championships/subscription/${subId}/roster/${athleteId}`);
      toast.success('Atleta removido do elenco!', { id: toastId });
      setSelectedSubscription(data);
      fetchMySubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover do elenco.', { id: toastId });
    }
  };

  const getDocStatusBadge = (status?: string) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          <CheckCircle2 size={14} /> Aprovado
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
          <XCircle size={14} /> Rejeitado
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
          <Clock size={14} /> Em Análise
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
        Pendente
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-600 mx-auto" size={48} />
          <p className="text-slate-500 font-medium text-sm">Carregando detalhes do campeonato...</p>
        </div>
      </div>
    );
  }

  if (!champ) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20 px-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Campeonato Não Encontrado</h2>
          <p className="text-slate-500 text-sm mb-6">O campeonato solicitado não existe ou foi removido.</p>
          <Link 
            to="/campeonatos" 
            className="inline-flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-orange-600/20 text-sm"
          >
            <ArrowLeft size={18} /> Voltar para a lista
          </Link>
        </div>
      </div>
    );
  }

  const isEnrollmentOpen = champ.status === 'OPEN' && (!champ.enrollmentDeadline || new Date(champ.enrollmentDeadline) >= new Date());
  const isPresident = athleteProfile?.teamRole === 'PRESIDENT' || (user as any)?.userType === 'ATHLETICA_PRESIDENT' || (user as any)?.role === 'ADMIN';
  const isAthlete = !!user && (!isPresident || !!athleteProfile);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-inter text-slate-900 pt-20">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white py-8 md:py-12 px-4 sm:px-6 shadow-md relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Trophy size={450} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Link 
            to="/campeonatos" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-wider bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60"
          >
            <ArrowLeft size={14} /> Voltar para Campeonatos
          </Link>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Banner/Logo Card */}
            <div className="w-full md:w-56 lg:w-64 max-w-xs mx-auto md:mx-0 shrink-0">
              <div className="aspect-square bg-slate-800 rounded-3xl overflow-hidden relative group shadow-xl border-2 border-slate-700/80">
                {champ.bannerUrl ? (
                  <img 
                    src={`${API_URL}${champ.bannerUrl}`} 
                    alt={champ.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800 p-6 text-center">
                    <Trophy size={56} className="mb-3 opacity-40 text-orange-500" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Federada Sports</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className={`px-3 py-1 text-xs font-black tracking-wider uppercase rounded-full border ${
                  isEnrollmentOpen 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {isEnrollmentOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas'}
                </span>

                {(champ.settings?.requireRg || champ.settings?.requireEnrollment) && (
                  <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1.5">
                    <AlertCircle size={14} /> Exige Documentação
                  </span>
                )}

                {champ.audienceFocus && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                    {champ.audienceFocus}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-3">
                {champ.name}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed font-normal mb-6 line-clamp-3">
                {champ.description || 'Campeonato oficial organizado na plataforma Federada. Confira abaixo todas as regras, modalidades e prazos para participar.'}
              </p>

              {/* Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Período</p>
                    <p className="font-semibold text-slate-200 text-xs sm:text-sm">
                      {champ.startDate ? new Date(champ.startDate).toLocaleDateString('pt-BR') : 'A definir'}
                      {champ.endDate ? ` a ${new Date(champ.endDate).toLocaleDateString('pt-BR')}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Prazo Inscrições</p>
                    <p className="font-semibold text-slate-200 text-xs sm:text-sm">
                      {champ.enrollmentDeadline ? new Date(champ.enrollmentDeadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Local</p>
                    <p className="font-semibold text-slate-200 text-xs sm:text-sm truncate max-w-[120px]">
                      {champ.settings?.locations?.join(', ') || 'A definir'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Modalidades</p>
                    <p className="font-semibold text-slate-200 text-xs sm:text-sm">
                      {champ.modalities?.length || 0} categorias
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. ROLE CONTEXT BANNER */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 -mt-3 relative z-20">
        {isPresident && (
          <div className="bg-white border-l-4 border-l-orange-500 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 shadow-sm">
                <Shield size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Painel da Atlética Ativo
                  </span>
                  <span className="text-slate-800 font-black text-sm">
                    {athleteProfile?.team?.name || 'Sua Atlética'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {joinRequests.length > 0 
                    ? `⚠️ ${joinRequests.length} solicitação(ões) de atletas aguardando sua aprovação.` 
                    : 'Gerencie inscrições, membros e elenco da sua atlética neste campeonato.'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('painel-atletica')}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
            >
              <span>Ir para Painel da Atlética</span>
              {joinRequests.length > 0 && (
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">
                  {joinRequests.length}
                </span>
              )}
            </button>
          </div>
        )}

        {!isPresident && user && athleteProfile?.team && (
          <div className="bg-white border-l-4 border-l-orange-500 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 shadow-sm">
                <UserCheck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sua Atlética:</span>
                  <span className="text-slate-900 font-black text-sm">{athleteProfile.team.name}</span>
                  {isAvailable && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 size={10} /> Disponível
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isAvailable 
                    ? 'Você está marcado como disponível para os jogos. Seu presidente pode adicioná-lo ao elenco.'
                    : 'Confirme sua disponibilidade para informar seu presidente que deseja competir.'}
                </p>
              </div>
            </div>

            {isEnrollmentOpen && (
              <button
                onClick={toggleAvailability}
                disabled={loadingAvailability}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 ${
                  isAvailable 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
                }`}
              >
                {loadingAvailability ? <Loader2 className="animate-spin" size={14} /> : null}
                <span>{isAvailable ? 'Disponibilidade Ativa ✓' : 'Estou Disponível para Convocação'}</span>
              </button>
            )}
          </div>
        )}

        {!user && (
          <div className="bg-white border-l-4 border-l-blue-500 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <Info size={22} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Deseja participar deste campeonato?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Faça login e vincule-se a uma atlética para se inscrever nas modalidades disponíveis.
                </p>
              </div>
            </div>
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm text-center shrink-0"
            >
              Fazer Login / Cadastrar
            </Link>
          </div>
        )}

        {user && !athleteProfile?.team && (
          <div className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Vínculo de Atlética Necessário</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Para participar e se inscrever, é necessário estar vinculado a uma Atlética cadastrada.
                </p>
              </div>
            </div>
            <Link 
              to="/perfil" 
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm text-center shrink-0"
            >
              Vincular à minha Atlética
            </Link>
          </div>
        )}
      </div>

      {/* 3. MAIN NAVIGATION & CONTENT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Navigation Sidebar (Desktop) / Fixed Bottom Bar (Mobile) */}
        <aside className="w-full lg:w-64 shrink-0">
          <ChampionshipDetailNav
            modalitiesCount={champ.modalities?.length || 0}
            activeSection={activeTab}
            onSelectSection={setActiveTab}
            isPresident={isPresident}
            isAthlete={isAthlete}
          />
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 space-y-6 min-w-0">

          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'visao-geral' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Event Description Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sobre o Campeonato</h3>
                    <p className="text-xs text-slate-500 font-medium">Informações gerais e apresentação da competição</p>
                  </div>
                </div>
                
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {champ.description || 'Nenhuma descrição detalhada fornecida para este campeonato.'}
                </p>
              </div>

              {/* Event Quick Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <Calendar className="text-orange-500 mb-3" size={28} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Datas Oficiais</h4>
                  <p className="text-slate-900 font-extrabold text-base mt-1">
                    {champ.startDate ? new Date(champ.startDate).toLocaleDateString('pt-BR') : 'A definir'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {champ.endDate ? `Até ${new Date(champ.endDate).toLocaleDateString('pt-BR')}` : 'Encerramento a definir'}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <MapPin className="text-emerald-500 mb-3" size={28} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Sede dos Jogos</h4>
                  <p className="text-slate-900 font-extrabold text-base mt-1 truncate">
                    {champ.settings?.locations?.join(', ') || 'A definir'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Locais oficiais das partidas</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <Trophy className="text-blue-500 mb-3" size={28} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Total Modalidades</h4>
                  <p className="text-slate-900 font-extrabold text-base mt-1">
                    {champ.modalities?.length || 0} disputas ativas
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Masculino, Feminino e Misto</p>
                </div>
              </div>

              {/* Regulamento Quick Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Regulamento Oficial</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Consulte as diretrizes técnicas, normas disciplinares e formato dos jogos.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('regulamento')}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors border border-slate-300 text-center shrink-0"
                >
                  Ver Regulamento
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: REGULAMENTO */}
          {activeTab === 'regulamento' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Regulamento Geral do Campeonato</h3>
                    <p className="text-xs text-slate-500 font-medium">Normas gerais, elegibilidade de atletas e código disciplinar</p>
                  </div>
                </div>

                {champ.rulesUrl ? (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-4">
                    <FileCheck2 className="mx-auto text-emerald-600" size={48} />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg">Documento Disponível</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        O regulamento oficial foi homologado pela comissão organizadora e está disponível para download.
                      </p>
                    </div>
                    <a 
                      href={`${API_URL}${champ.rulesUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/20"
                    >
                      <ExternalLink size={16} /> Baixar PDF do Regulamento
                    </a>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center">
                    <Info className="mx-auto text-slate-400 mb-3" size={40} />
                    <h4 className="font-extrabold text-slate-800 text-base">Documentação em Fase de Homologação</h4>
                    <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                      O regulamento específico deste campeonato será publicado em breve pela organização. As regras gerais da federação permanecem válidas.
                    </p>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Principais Diretrizes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-1">1. Elegibilidade</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Todos os atletas devem estar regularmente matriculados e com documentação verificada no sistema.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-1">2. Prazos de Inscrição</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Inscrições e alterações no elenco devem ser realizadas impreterivelmente até a data limite estipulada.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: MODALIDADES */}
          {activeTab === 'modalidades' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header & Filter Controls */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Trophy className="text-orange-500" size={22} /> Modalidades Disponíveis
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selecione as modalidades desejadas para inscrever sua equipe ou atleta
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200 shrink-0 self-start sm:self-auto">
                    {champ.modalities?.length || 0} disputas cadastradas
                  </span>
                </div>

                {champ.modalities && champ.modalities.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Buscar modalidade por nome..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select 
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="ALL">Todos os Tipos</option>
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="COLETIVO">Coletivo</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <select 
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors cursor-pointer"
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

              {/* Modality Cards Grid */}
              {(() => {
                const filteredModalities = champ.modalities?.filter((mod: any) => {
                  const matchesText = mod.name.toLowerCase().includes(filterText.toLowerCase());
                  const matchesType = filterType === 'ALL' || mod.type === filterType;
                  const matchesGender = filterGender === 'ALL' || (mod.gender || 'MISTO') === filterGender;
                  return matchesText && matchesType && matchesGender;
                }) || [];

                if (!champ.modalities || champ.modalities.length === 0) {
                  return (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                      <Trophy size={48} className="mx-auto text-slate-300 mb-3" />
                      <h4 className="text-lg font-black text-slate-800">Nenhuma Modalidade Cadastrada</h4>
                      <p className="text-slate-500 text-xs mt-1">A organização ainda não registrou as modalidades para este campeonato.</p>
                    </div>
                  );
                }

                if (filteredModalities.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
                      <Filter size={32} className="mx-auto text-slate-400 mb-3" />
                      <h4 className="font-extrabold text-slate-800 text-base">Nenhuma modalidade encontrada</h4>
                      <p className="text-slate-500 text-xs mt-1">Tente alterar os termos de busca ou filtros selecionados.</p>
                      <button 
                        onClick={() => { setFilterText(''); setFilterType('ALL'); setFilterGender('ALL'); }}
                        className="mt-4 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                            if (athleteProfile?.team?.id) fetchTeamMembers(athleteProfile.team.id);
                            setShowRosterModal(true); 
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB 4: JOGOS */}
          {activeTab === 'jogos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
                <Swords className="mx-auto text-slate-300 mb-4" size={56} />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tabela de Jogos & Confrontos</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                  A tabela oficial das partidas será divulgada após o encerramento das inscrições e a realização do sorteio dos grupos.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                  <Clock size={16} /> Aguardando encerramento das inscrições
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EQUIPES */}
          {activeTab === 'equipes' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
                <Shield className="mx-auto text-slate-300 mb-4" size={56} />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Equipes Confirmadas</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                  A lista de atléticas e equipes homologadas será atualizada em tempo real conforme a validação das documentações.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: MEUS DOCUMENTOS (Athlete view) */}
          {activeTab === 'documentos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Section Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3.5 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Meus Documentos de Inscrição</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Envie a documentação exigida para homologar sua elegibilidade nas partidas
                    </p>
                  </div>
                </div>

                {athleteProfile && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-black flex items-center justify-center text-sm">
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">CPF: {athleteProfile.cpf || 'Não cadastrado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocStatusBadge(athleteProfile.documentRgStatus)}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Documento de Identidade (RG / CNH) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">1. RG ou CNH (Frente e Verso)</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Comprovante oficial de identidade com foto</p>
                      </div>
                      {getDocStatusBadge(athleteProfile?.documentRgStatus)}
                    </div>

                    {athleteProfile?.documentRgStatus === 'REJECTED' && athleteProfile?.documentRgRejectionReason && (
                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4 text-xs text-rose-800">
                        <strong className="block font-bold">Motivo da Rejeição:</strong>
                        {athleteProfile.documentRgRejectionReason}
                      </div>
                    )}

                    {athleteProfile?.documentRgUrl && (
                      <div className="mb-4">
                        <a 
                          href={`${API_URL}${athleteProfile.documentRgUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 transition-colors"
                        >
                          <ExternalLink size={14} /> Visualizar Documento Enviado
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      {athleteProfile?.documentRgUrl ? 'Substituir Documento' : 'Enviar Documento'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        id="rg-upload-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDocument('rg', file);
                        }}
                      />
                      <label 
                        htmlFor="rg-upload-input"
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed text-xs font-bold cursor-pointer transition-all ${
                          uploadingRg 
                            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-50 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-500'
                        }`}
                      >
                        {uploadingRg ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Enviando arquivo...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>Selecionar PDF ou Imagem</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. Comprovante de Matrícula */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">2. Comprovante de Matrícula</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Declaração da instituição de ensino ou carteirinha</p>
                      </div>
                      {getDocStatusBadge(athleteProfile?.documentEnrollmentStatus)}
                    </div>

                    {athleteProfile?.documentEnrollmentStatus === 'REJECTED' && athleteProfile?.documentEnrollmentRejectionReason && (
                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4 text-xs text-rose-800">
                        <strong className="block font-bold">Motivo da Rejeição:</strong>
                        {athleteProfile.documentEnrollmentRejectionReason}
                      </div>
                    )}

                    {athleteProfile?.documentEnrollmentUrl && (
                      <div className="mb-4">
                        <a 
                          href={`${API_URL}${athleteProfile.documentEnrollmentUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 transition-colors"
                        >
                          <ExternalLink size={14} /> Visualizar Documento Enviado
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      {athleteProfile?.documentEnrollmentUrl ? 'Substituir Documento' : 'Enviar Documento'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        id="enrollment-upload-input"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDocument('enrollment', file);
                        }}
                      />
                      <label 
                        htmlFor="enrollment-upload-input"
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed text-xs font-bold cursor-pointer transition-all ${
                          uploadingEnrollment 
                            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-50 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-500'
                        }`}
                      >
                        {uploadingEnrollment ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Enviando arquivo...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>Selecionar PDF ou Imagem</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: PAINEL DA ATLÉTICA (President view) */}
          {activeTab === 'painel-atletica' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* President Dashboard Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white font-black flex items-center justify-center text-2xl shadow-lg shadow-orange-600/20 shrink-0">
                      {athleteProfile?.team?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {athleteProfile?.team?.name || 'Painel da Atlética'}
                        </h3>
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                          Presidente
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Gestão da atlética e controle de atletas no campeonato</p>
                    </div>
                  </div>

                  {/* Invite Link Button */}
                  {athleteProfile?.team?.inviteCode && (
                    <button 
                      onClick={() => {
                        const link = `${window.location.origin}/invite/${athleteProfile.team?.inviteCode}`;
                        navigator.clipboard.writeText(link);
                        setCopiedInvite(true);
                        toast.success('Link de convite copiado!');
                        setTimeout(() => setCopiedInvite(false), 2500);
                      }}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
                    >
                      {copiedInvite ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      <span>{copiedInvite ? 'Link Copiado!' : 'Copiar Convite Atletas'}</span>
                    </button>
                  )}
                </div>

                {/* Dashboard Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total no Elenco</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{teamMembers.length}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Atletas vinculados</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aprovações Pendentes</p>
                    <p className="text-2xl font-black text-orange-600 mt-1">{joinRequests.length}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Solicitações de entrada</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inscrições Ativas</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{mySubscriptions.length}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Modalidades no campeonato</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Disponíveis p/ Jogar</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{teamAvailabilities.filter(a => a.status === 'AVAILABLE').length}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sinalizaram disponibilidade</p>
                  </div>
                </div>
              </div>

              {/* Solicitações de Vínculo (Pending Approvals) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">Solicitações de Vínculo Pendentes</h4>
                      <p className="text-xs text-slate-500">Atletas que pediram entrada na sua atlética</p>
                    </div>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs font-black px-3 py-1 rounded-full">
                    {joinRequests.length} pendente(s)
                  </span>
                </div>

                {loadingJoinRequests ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-600" size={32} /></div>
                ) : joinRequests.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-300">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Nenhuma solicitação pendente</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Todos os novos atletas foram processados.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {joinRequests.map(req => (
                      <div key={req.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{req.user?.name}</span>
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              Aguardando Aprovação
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            CPF: {req.cpf || 'Não informado'} • Gênero: {req.gender || 'Não informado'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => handleJoinRequest(req.id, 'REJECTED')} 
                            className="flex-1 sm:flex-initial px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors border border-rose-200"
                          >
                            Recusar
                          </button>
                          <button 
                            onClick={() => handleJoinRequest(req.id, 'APPROVED')} 
                            className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                          >
                            Aprovar Atleta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Members Roster & Documents Verification */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">Atletas Cadastrados na Atlética</h4>
                      <p className="text-xs text-slate-500">Membros oficiais da equipe e status de documentação</p>
                    </div>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-xs font-black px-3 py-1 rounded-full">
                    {teamMembers.length} atleta(s)
                  </span>
                </div>

                {loadingMembers ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                ) : teamMembers.length === 0 ? (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-300">
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Nenhum atleta cadastrado ainda</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Use o botão de convite para adicionar membros.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-black">
                          <th className="px-4 py-3">Atleta</th>
                          <th className="px-4 py-3">Cargo</th>
                          <th className="px-4 py-3">RG / Identidade</th>
                          <th className="px-4 py-3">Matrícula</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {teamMembers.map(member => (
                          <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                {member.user?.name || 'Sem nome'}
                                {member.user?.id === user?.id && (
                                  <span className="bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded text-[9px] font-black">(Você)</span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">CPF: {member.cpf || 'N/A'}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                member.teamRole === 'PRESIDENT' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {member.teamRole === 'PRESIDENT' ? 'Presidente' : 'Atleta'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {getDocStatusBadge(member.documentRgStatus)}
                            </td>
                            <td className="px-4 py-3.5">
                              {getDocStatusBadge(member.documentEnrollmentStatus)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* FLOATING DOCK FOR BULK REGISTRATION */}
      {selectedModalities.length > 0 && user && athleteProfile?.team && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] p-4 px-6 z-40 animate-in slide-in-from-bottom-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
                {selectedModalities.length}
              </div>
              <div className="flex-1">
                <p className="font-black text-white text-sm leading-tight">Modalidades Selecionadas</p>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {selectedModalities.map(id => champ.modalities?.find((m: any) => m.id === id)?.name).join(', ')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsConfirmModalOpen(true)}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 disabled:opacity-70 flex items-center justify-center gap-2"
              disabled={isSubscribing}
            >
              {isSubscribing ? <Loader2 className="animate-spin" size={16} /> : null}
              <span>{isSubscribing ? 'Processando Inscrição...' : 'Confirmar Inscrições'}</span>
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
          handleBulkSubscribe();
        }}
      />
    </div>
  );
}
