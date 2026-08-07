import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Plus,
  Search,
  Filter,
  FileText,
  Shield,
  Copy,
  Check,
  QrCode,
  UserCheck,
  Info,
  Sparkles,
  FileCheck2,
  Swords,
  Users,
  X,
  Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/apiClient';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import ConfirmSubscriptionModal from '../components/championships/ConfirmSubscriptionModal';
import DelegateSubscriptionModal from '../components/championships/DelegateSubscriptionModal';
import DelegateDocumentUploadModal from '../components/championships/DelegateDocumentUploadModal';
import ModalityCard from '../components/championships/ModalityCard';
import ChampionshipDetailNav from '../components/championships/ChampionshipDetailNav';
import FloatingCheckoutDock from '../components/championships/FloatingCheckoutDock';
import MatchesView from './championships/MatchesView';
import TeamsView from './championships/TeamsView';
import RosterModal from '../components/championships/RosterModal';

function InviteQrCodeModal({ isOpen, onClose, inviteLink }: { isOpen: boolean, onClose: () => void, inviteLink: string }) {
  if (!isOpen || !inviteLink) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 font-inter">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight">Convite da Atlética</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 active:scale-95">
            <X size={20} />
          </button>
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl flex justify-center border border-slate-200 mb-4 shadow-inner">
          <QRCodeSVG value={inviteLink} size={180} />
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">
          Mostre este QR Code aos seus atletas para ingressarem na atlética instantaneamente.
        </p>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(inviteLink);
            toast.success('Link de convite copiado!');
          }}
          className="w-full bg-orange-600 text-white font-black py-3 rounded-xl hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 min-h-[44px]"
        >
          <Copy size={16} /> Copiar Link de Convite
        </button>
      </div>
    </div>
  );
}

interface IChampionship {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  enrollmentDeadline?: string;
  bannerUrl?: string;
  rulesUrl?: string;
  status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  audienceFocus?: string;
  modalities?: any[];
  settings?: {
    locations?: string[];
    requireRg?: boolean;
    requireEnrollment?: boolean;
  };
}

interface IAthleteProfile {
  id: string;
  teamRole: string;
  gender?: string;
  cpf?: string;
  documentRgStatus?: string;
  documentRgUrl?: string;
  documentRgRejectionReason?: string;
  documentEnrollmentStatus?: string;
  documentEnrollmentUrl?: string;
  documentEnrollmentRejectionReason?: string;
  user?: { id: string; name: string; email: string };
  team?: { id: string; name: string; logoUrl?: string; inviteCode?: string; owner?: { id: string } };
}

interface ISubscription {
  id: string;
  status: string;
  createdAt: string;
  modality: any;
  team?: any;
  athlete?: any;
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

  // Delegate Management State
  const [teamDashboard, setTeamDashboard] = useState<any>(null);
  const [isDelegateSubModalOpen, setIsDelegateSubModalOpen] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [delegateDocModalState, setDelegateDocModalState] = useState<{isOpen: boolean, athleteId: string, athleteName: string, docType: 'rg'|'enrollment'}>({
    isOpen: false, athleteId: '', athleteName: '', docType: 'rg'
  });

  // Filters State
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');

  // Consolidated Tabs State
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'competicao' | 'painel'>('visao-geral');
  const [competitionSubTab, setCompetitionSubTab] = useState<'jogos' | 'equipes'>('jogos');

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
          fetchTeamDashboard();
        }
      }
    })
    .catch(err => console.error('Erro ao buscar perfil:', err));
  };

  const fetchAvailabilities = (teamId: string) => {
    if (!token || !id) return;
    apiClient.get<any[]>(`/championships/${id}/availabilities?teamId=${teamId}`)
    .then(data => {
      setTeamAvailabilities(data || []);
      if (user?.id) {
        const myAvail = (data || []).find((a: any) => a.athlete?.user?.id === user.id);
        if (myAvail) {
          setIsAvailable(myAvail.status === 'AVAILABLE');
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

  const fetchTeamDashboard = () => {
    if (!token || !id) return;
    apiClient.get<any>(`/championships/${id}/team-dashboard`)
      .then(data => setTeamDashboard(data))
      .catch(err => console.error('Erro ao buscar team dashboard:', err));
  };

  const getAthleteDocument = (athleteId: string) => {
    return teamDashboard?.documents?.find((doc: any) => doc.athlete?.id === athleteId);
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

  const handleToggleModality = (modId: string) => {
    setSelectedModalities(prev => 
      prev.includes(modId) ? prev.filter(i => i !== modId) : [...prev, modId]
    );
  };

  const handleConfirmEnrollment = async () => {
    if (selectedModalities.length === 0) return;
    setIsSubscribing(true);
    const toastId = toast.loading('Processando inscrições...');

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

  const handleShowRoster = (sub: any) => {
    setSelectedSubscription(sub);
    setShowRosterModal(true);
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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
          <CheckCircle2 size={13} /> Aprovado
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase">
          <X size={13} /> Rejeitado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
        <Clock size={13} /> Pendente
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <p className="font-bold text-sm uppercase tracking-wider text-slate-400">Carregando detalhes do campeonato...</p>
      </div>
    );
  }

  if (!champ) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center shadow-lg space-y-4">
          <AlertCircle size={48} className="mx-auto text-orange-500" />
          <h2 className="text-2xl font-black text-slate-900 uppercase">Campeonato Não Encontrado</h2>
          <p className="text-slate-600 text-sm">O campeonato solicitado não existe ou foi removido pela administração.</p>
          <Link to="/campeonatos" className="inline-flex items-center gap-2 bg-orange-600 text-white font-black px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors uppercase tracking-wider text-xs">
            <ArrowLeft size={16} /> Voltar para a lista
          </Link>
        </div>
      </div>
    );
  }

  const isEnrollmentOpen = champ.status === 'OPEN' && (!champ.enrollmentDeadline || new Date(champ.enrollmentDeadline) >= new Date());
  const isPresident = athleteProfile?.teamRole === 'PRESIDENT' || (user as any)?.userType === 'ATHLETICA_PRESIDENT' || (user as any)?.role === 'ADMIN';
  const isAthlete = !!user && (!isPresident || !!athleteProfile);

  return (
    <div className="min-h-screen bg-slate-50 pb-48 font-inter text-slate-900">
      
      {/* 1. HERO HEADER WITH INTEGRATED ROLE NOTICE */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white py-5 sm:py-8 md:py-10 px-4 sm:px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Trophy size={450} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <Link 
            to="/campeonatos" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60"
          >
            <ArrowLeft size={14} /> Voltar para Campeonatos
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Banner/Logo Card */}
            <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 shrink-0 mx-auto md:mx-0">
              <div className="aspect-square bg-slate-800 rounded-3xl overflow-hidden relative group shadow-xl border-2 border-slate-700/80">
                {champ.bannerUrl ? (
                  <img 
                    src={`${API_URL}${champ.bannerUrl}`} 
                    alt={champ.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800 p-4 text-center">
                    <Trophy size={44} className="mb-2 opacity-40 text-orange-500" />
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Federada Sports</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase rounded-full border ${
                  isEnrollmentOpen 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {isEnrollmentOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas'}
                </span>

                {(champ.settings?.requireRg || champ.settings?.requireEnrollment) && (
                  <span className="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1">
                    <AlertCircle size={13} /> Exige Documentos
                  </span>
                )}

                {champ.audienceFocus && (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                    {champ.audienceFocus}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">
                {champ.name}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed font-normal mb-5 line-clamp-2">
                {champ.description || 'Campeonato oficial organizado na plataforma Federada. Confira abaixo todas as regras e modalidades disponíveis.'}
              </p>

              {/* Metadata Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Período</p>
                    <p className="font-semibold text-slate-200 text-xs truncate">
                      {champ.startDate ? new Date(champ.startDate).toLocaleDateString('pt-BR') : 'A definir'}
                      {champ.endDate ? ` a ${new Date(champ.endDate).toLocaleDateString('pt-BR')}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Prazo Inscrições</p>
                    <p className="font-semibold text-slate-200 text-xs truncate">
                      {champ.enrollmentDeadline ? new Date(champ.enrollmentDeadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Local</p>
                    <p className="font-semibold text-slate-200 text-xs truncate">
                      {champ.settings?.locations?.join(', ') || 'A definir'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Trophy size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Modalidades</p>
                    <p className="font-semibold text-slate-200 text-xs truncate">
                      {champ.modalities?.length || 0} disputas
                    </p>
                  </div>
                </div>
              </div>

              {/* Sleek Integrated President Notice (NO overlapping white card!) */}
              {isPresident && (
                <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
                      <Shield size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                          Presidente da Atlética
                        </span>
                        <span className="text-white font-bold text-xs">
                          {athleteProfile?.team?.name || 'Sua Atlética'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {joinRequests.length > 0 
                          ? `⚠️ ${joinRequests.length} solicitação(ões) de atletas aguardando sua aprovação.` 
                          : 'Gerencie inscrições, membros e elenco da sua atlética neste campeonato.'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('painel')}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 shrink-0 min-h-[38px] active:scale-95"
                  >
                    <span>Abrir Painel da Atlética</span>
                    {joinRequests.length > 0 && (
                      <span className="bg-white text-orange-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                        {joinRequests.length}
                      </span>
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* 2. STICKY 3-TAB NAVIGATION BAR */}
      <ChampionshipDetailNav
        modalitiesCount={champ.modalities?.length || 0}
        activeSection={activeTab}
        onSelectSection={(tabId: any) => setActiveTab(tabId)}
        isPresident={isPresident}
        isAthlete={isAthlete}
        pendingRequestsCount={joinRequests.length}
      />

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* TAB 1: VISÃO GERAL & INSCRIÇÃO (EVERYTHING ON MAIN PAGE) */}
        {activeTab === 'visao-geral' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Championship Description & Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sobre o Campeonato</h3>
                  <p className="text-xs text-slate-500 font-medium">Informações gerais e apresentação da competição</p>
                </div>
              </div>
              
              <p className="text-slate-700 text-sm leading-relaxed font-normal">
                {champ.description || 'Campeonato oficial organizado na plataforma Federada. Confira abaixo todas as modalidades disponíveis para inscrição.'}
              </p>

              {champ.rulesUrl && (
                <div className="pt-2">
                  <a 
                    href={`${API_URL}${champ.rulesUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3.5 py-2 rounded-xl border border-orange-200 transition-colors"
                  >
                    <ExternalLink size={14} /> Baixar PDF do Regulamento Oficial
                  </a>
                </div>
              )}
            </div>

            {/* MODALITIES SECTION DIRECTLY ON MAIN TAB */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Trophy className="text-orange-500" size={22} /> Modalidades para Inscrição
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecione as modalidades desejadas e confirme sua inscrição no final da tela
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200 shrink-0 self-start sm:self-auto">
                  {champ.modalities?.length || 0} disputas
                </span>
              </div>

              {/* Category Filter Controls */}
              {champ.modalities && champ.modalities.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type="text" 
                      placeholder="Buscar modalidade por nome..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors cursor-pointer"
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors cursor-pointer"
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

              {/* Modalities List */}
              {(() => {
                const filteredModalities = champ.modalities?.filter((mod: any) => {
                  const matchesText = mod.name.toLowerCase().includes(filterText.toLowerCase());
                  const matchesType = filterType === 'ALL' || mod.type === filterType;
                  const matchesGender = filterGender === 'ALL' || (mod.gender || 'MISTO') === filterGender;
                  return matchesText && matchesType && matchesGender;
                }) || [];

                if (!champ.modalities || champ.modalities.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                      <Trophy size={40} className="mx-auto text-slate-300 mb-2" />
                      <h4 className="text-base font-black text-slate-800">Nenhuma Modalidade Cadastrada</h4>
                      <p className="text-slate-500 text-xs mt-1">A organização ainda não registrou as modalidades para este campeonato.</p>
                    </div>
                  );
                }

                if (filteredModalities.length === 0) {
                  return (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
                      <Filter size={28} className="mx-auto text-slate-400 mb-2" />
                      <h4 className="font-extrabold text-slate-800 text-sm">Nenhuma modalidade encontrada</h4>
                      <p className="text-slate-500 text-xs mt-1">Tente alterar os filtros de busca selecionados.</p>
                      <button 
                        onClick={() => { setFilterText(''); setFilterType('ALL'); setFilterGender('ALL'); }}
                        className="mt-3 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                    {filteredModalities.map((mod: any) => {
                      const sub = mySubscriptions.find(s => s.modality?.id === mod.id);
                      const isSelected = selectedModalities.includes(mod.id);
                      return (
                        <ModalityCard
                          key={mod.id}
                          mod={mod}
                          subscription={sub}
                          isSelected={isSelected}
                          isEnrollmentOpen={isEnrollmentOpen}
                          athleteProfile={athleteProfile}
                          onToggle={handleToggleModality}
                          onUnsubscribe={handleUnsubscribe}
                          onShowRoster={handleShowRoster}
                        />
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* TAB 2: COMPETIÇÃO (JOGOS & EQUIPES CONFIRMADAS) */}
        {activeTab === 'competicao' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Sub-toggle selector */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center justify-center gap-2 max-w-md mx-auto">
              <button
                onClick={() => setCompetitionSubTab('jogos')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  competitionSubTab === 'jogos'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Swords size={16} /> Jogos & Tabela
              </button>
              <button
                onClick={() => setCompetitionSubTab('equipes')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  competitionSubTab === 'equipes'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield size={16} /> Equipes Confirmadas
              </button>
            </div>

            {competitionSubTab === 'jogos' ? (
              <MatchesView />
            ) : (
              <TeamsView />
            )}
          </div>
        )}

        {/* TAB 3: PAINEL DA ATLÉTICA / GESTÃO DO PRESIDENTE & ATLETA */}
        {activeTab === 'painel' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isPresident ? (
              /* PRESIDENT CONTROL DASHBOARD */
              <div className="space-y-6">
                
                {/* Header Actions Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Shield className="text-orange-500" size={22} /> Painel de Gestão da Atlética
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gerencie atletas, convites e inscrições da sua equipe neste campeonato
                      </p>
                    </div>

                    {athleteProfile?.team?.inviteCode && (
                      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => setIsQrCodeModalOpen(true)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 border border-slate-300 shadow-sm min-h-[42px] active:scale-95"
                        >
                          <QrCode size={16} className="text-slate-600" />
                          <span>QR Code</span>
                        </button>
                        <button 
                          onClick={() => {
                            const link = `${window.location.origin}/invite/${athleteProfile.team?.inviteCode}`;
                            navigator.clipboard.writeText(link);
                            setCopiedInvite(true);
                            toast.success('Link de convite copiado!');
                            setTimeout(() => setCopiedInvite(false), 2500);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm min-h-[42px] active:scale-95"
                        >
                          {copiedInvite ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                          <span>{copiedInvite ? 'Copiado!' : 'Convite'}</span>
                        </button>
                        <button 
                          onClick={() => setIsDelegateSubModalOpen(true)}
                          className="col-span-2 sm:col-span-1 bg-orange-600 hover:bg-orange-700 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-orange-600/20 min-h-[42px] active:scale-95"
                        >
                          <Plus size={16} />
                          <span>Inscrever Atleta</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dashboard Quick Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total no Elenco</p>
                      <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{teamMembers.length}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">Atletas vinculados</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aprovações</p>
                      <p className="text-xl sm:text-2xl font-black text-orange-600 mt-1">{joinRequests.length}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">Pendentes</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inscrições</p>
                      <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{mySubscriptions.length}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">Modalidades ativas</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Disponíveis</p>
                      <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">{teamAvailabilities.filter(a => a.status === 'AVAILABLE').length}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">Para convocação</p>
                    </div>
                  </div>
                </div>

                {/* Join Requests List */}
                {joinRequests.length > 0 && (
                  <div className="bg-orange-50/60 rounded-3xl p-6 border border-orange-200 shadow-sm space-y-4">
                    <h4 className="font-black text-orange-950 uppercase tracking-tight text-base flex items-center gap-2">
                      <AlertCircle className="text-orange-600" size={18} /> Solicitações Pendentes de Vínculo ({joinRequests.length})
                    </h4>

                    <div className="space-y-2">
                      {joinRequests.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{req.user?.name || 'Atleta sem nome'}</p>
                            <p className="text-xs text-slate-500">{req.user?.email}</p>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleJoinRequest(req.id, 'APPROVED')}
                              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors min-h-[38px]"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleJoinRequest(req.id, 'REJECTED')}
                              className="flex-1 sm:flex-initial bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors min-h-[38px]"
                            >
                              Recusar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Members List */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-base flex items-center gap-2">
                      <Users className="text-orange-500" size={20} /> Elenco da Atlética ({teamMembers.length})
                    </h4>
                  </div>

                  {loadingMembers ? (
                    <div className="py-8 text-center"><Loader2 className="animate-spin text-orange-600 mx-auto" size={24} /></div>
                  ) : teamMembers.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">Nenhum membro cadastrado na sua atlética ainda.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {teamMembers.map(member => {
                        const doc = getAthleteDocument(member.id);
                        return (
                          <div key={member.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="font-extrabold text-slate-900 text-sm">{member.user?.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                                  {member.teamRole === 'PRESIDENT' ? 'Presidente' : 'Atleta'}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                                CPF: {member.cpf || 'S/ CPF'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-500">RG:</span>
                                {getDocStatusBadge(doc?.rgStatus)}
                              </div>
                              <button
                                onClick={() => setDelegateDocModalState({
                                  isOpen: true,
                                  athleteId: member.id,
                                  athleteName: member.user?.name || 'Atleta',
                                  docType: 'rg'
                                })}
                                className="text-[11px] font-bold text-orange-600 hover:underline"
                              >
                                {doc?.rgUrl ? 'Reenviar' : 'Enviar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* ATHLETE PERSONAL DOCUMENTS DASHBOARD */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <FileText className="text-orange-600" size={24} /> Seus Documentos Pessoais
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Envie seus documentos exigidos para liberação nos jogos deste campeonato
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-900 text-sm">RG / Documento com Foto</h4>
                      {getDocStatusBadge(athleteProfile?.documentRgStatus)}
                    </div>
                    <p className="text-xs text-slate-500">Foto legível da frente e verso do RG ou CNH.</p>

                    <label className="block cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all text-center min-h-[40px] shadow-sm">
                      {uploadingRg ? 'Enviando...' : athleteProfile?.documentRgUrl ? 'Reenviar RG' : 'Enviar RG'}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleUploadDocument('rg', e.target.files[0])}
                        disabled={uploadingRg}
                      />
                    </label>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-900 text-sm">Comprovante de Matrícula</h4>
                      {getDocStatusBadge(athleteProfile?.documentEnrollmentStatus)}
                    </div>
                    <p className="text-xs text-slate-500">Declaração ou comprovante da universidade.</p>

                    <label className="block cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all text-center min-h-[40px] shadow-sm">
                      {uploadingEnrollment ? 'Enviando...' : athleteProfile?.documentEnrollmentUrl ? 'Reenviar Matrícula' : 'Enviar Matrícula'}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleUploadDocument('enrollment', e.target.files[0])}
                        disabled={uploadingEnrollment}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* FLOATING DOCK FOR BULK REGISTRATION */}
      {selectedModalities.length > 0 && user && athleteProfile?.team && (
        <FloatingCheckoutDock
          selectedModalities={champ.modalities?.filter((m: any) => selectedModalities.includes(m.id)) || []}
          onConfirm={() => setIsConfirmModalOpen(true)}
          onClear={() => setSelectedModalities([])}
          isSubscribing={isSubscribing}
        />
      )}

      {/* MODALS */}
      <InviteQrCodeModal
        isOpen={isQrCodeModalOpen}
        onClose={() => setIsQrCodeModalOpen(false)}
        inviteLink={athleteProfile?.team?.inviteCode ? `${window.location.origin}/invite/${athleteProfile.team.inviteCode}` : ''}
      />

      <ConfirmSubscriptionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmEnrollment}
        selectedModalities={champ.modalities?.filter((m: any) => selectedModalities.includes(m.id)) || []}
        championshipSettings={champ.settings}
        isSubscribing={isSubscribing}
      />

      <DelegateSubscriptionModal
        isOpen={isDelegateSubModalOpen}
        onClose={() => setIsDelegateSubModalOpen(false)}
        championshipId={id || ''}
        teamMembers={teamMembers}
        modalities={champ.modalities || []}
        onSuccess={() => {
          fetchMySubscriptions();
          fetchTeamDashboard();
        }}
      />

      <DelegateDocumentUploadModal
        isOpen={delegateDocModalState.isOpen}
        onClose={() => setDelegateDocModalState(prev => ({ ...prev, isOpen: false }))}
        championshipId={id || ''}
        athleteId={delegateDocModalState.athleteId}
        athleteName={delegateDocModalState.athleteName}
        docType={delegateDocModalState.docType}
        onSuccess={() => fetchTeamDashboard()}
      />

      {showRosterModal && selectedSubscription && (
        <RosterModal
          isOpen={showRosterModal}
          onClose={() => setShowRosterModal(false)}
          subscription={selectedSubscription}
          teamMembers={teamMembers}
          onAddToRoster={(athleteId) => handleAddToRoster(selectedSubscription.id, athleteId)}
          onRemoveFromRoster={(athleteId) => handleRemoveFromRoster(selectedSubscription.id, athleteId)}
        />
      )}

    </div>
  );
}
