import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { IChampionship, IAthleteProfile, ISubscription } from '../types';
import { API_URL } from '../config';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Shield, CheckCircle2, Info, ArrowLeft, Calendar, MapPin, AlertCircle, Clock, Search, Filter, FileText } from 'lucide-react';
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
      const data = await apiClient.put<any>(`/teams/my/profile`, {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'modalities' | 'teams' | 'brackets' | 'documentos' | 'painel-atletica'>('overview');

  // Dashboard & Documents State
  const [teamDashboard, setTeamDashboard] = useState<{subscriptions: any[], documents: any[]} | null>(null);
  const [athleteDocument, setAthleteDocument] = useState<any>(null);

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

  const fetchTeamDashboard = () => {
    if (!token || !id) return;
    apiClient.get(`/championships/${id}/team-dashboard`)
      .then((data: any) => setTeamDashboard(data))
      .catch((err) => console.error('Erro ao buscar dashboard da equipe', err));
  };

  const fetchAthleteDocument = () => {
    if (!token || !id) return;
    apiClient.get(`/championships/${id}/athlete-document`)
      .then((data: any) => setAthleteDocument(data))
      .catch((err) => console.error('Erro ao buscar documentos do atleta', err));
  };

  useEffect(() => {
    fetchChampionship();
    if (token) {
      fetchProfile();
      fetchMySubscriptions();
      fetchAthleteDocument();
    }
  }, [id, token]);

  useEffect(() => {
    if (athleteProfile?.teamRole === 'PRESIDENT') {
      fetchTeamDashboard();
    }
  }, [athleteProfile?.teamRole]);

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
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border-2 border-neutral-800 hover:border-[#00f0ff] transition-all mb-8 text-sm font-bold tracking-widest uppercase font-mono"
            >
              <ArrowLeft size={16} /> Voltar
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0 shrink-0">
                <div className="aspect-[4/5] bg-neutral-900 rounded-none shadow-[6px_6px_0_0_#00f0ff] border-2 border-neutral-800 overflow-hidden relative group">
                  {champ.bannerUrl ? (
                    <img 
                      src={`${API_URL}${champ.bannerUrl}`} 
                      alt={champ.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700 bg-neutral-950 p-6 text-center" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                      <Trophy size={64} className="mb-4 opacity-50" />
                      <span className="font-mono font-bold tracking-widest uppercase">Sem Imagem</span>
                    </div>
                  )}
                  <div className="absolute inset-0 border-4 border-black/10 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="flex-1 w-full pt-4">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase border-2 border-black ${isEnrollmentOpen ? 'bg-[#00f0ff] text-black' : 'bg-red-500 text-white'}`}>
                    {isEnrollmentOpen ? 'INSCRIÇÕES ABERTAS' : 'INSCRIÇÕES ENCERRADAS'}
                  </span>
                  {champ.settings?.requireRg && (
                    <span className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest bg-yellow-400 text-black border-2 border-black flex items-center gap-1">
                      <AlertCircle size={12} /> EXIGE DOC
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-tighter mb-4 text-white">
                  {champ.name}
                </h1>
                
                <p className="text-neutral-400 text-base max-w-2xl leading-relaxed font-sans">
                  {champ.description || 'Nenhuma descrição fornecida para este campeonato.'}
                </p>
              </div>
            </div>
            
            {/* Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t-2 border-neutral-800 pt-8 font-mono">
              <div className="flex items-start gap-3 p-4 bg-neutral-900 border-2 border-neutral-800">
                <Calendar className="text-[#00f0ff] mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Período</p>
                  <p className="font-bold text-white text-sm">
                    {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}
                    {champ.endDate ? ` até ${new Date(champ.endDate).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-neutral-900 border-2 border-neutral-800">
                <Clock className="text-[#00f0ff] mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Prazo de Inscrição</p>
                  <p className="font-bold text-white text-sm">
                    {champ.enrollmentDeadline ? new Date(champ.enrollmentDeadline).toLocaleDateString() : 'Sem prazo'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-neutral-900 border-2 border-neutral-800">
                <MapPin className="text-[#00f0ff] mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Local(is)</p>
                  <p className="font-bold text-white text-sm">
                    {champ.settings?.locations?.join(', ') || 'A definir'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-neutral-900 border-2 border-neutral-800">
                <Trophy className="text-[#00f0ff] mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Modalidades</p>
                  <p className="font-bold text-white text-sm">
                    {champ.modalities?.length || 0} disputas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="bg-black border-b-2 border-neutral-800 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-6 flex gap-8 overflow-x-auto no-scrollbar font-mono text-sm uppercase tracking-widest font-bold">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-4 whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('modalities')}
              className={`py-4 border-b-4 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'modalities' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}`}
            >
              Modalidades
              {champ.modalities && champ.modalities.length > 0 && (
                <span className="bg-neutral-800 text-white py-0.5 px-2 rounded-none text-xs border border-neutral-700">{champ.modalities.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('teams')}
              className={`py-4 border-b-4 whitespace-nowrap transition-colors ${activeTab === 'teams' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}`}
            >
              Equipes
            </button>
            <button 
              onClick={() => setActiveTab('brackets')}
              className={`py-4 border-b-4 whitespace-nowrap transition-colors ${activeTab === 'brackets' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}`}
            >
              Tabela
            </button>
            {athleteProfile && champ.settings && (champ.settings.requireRg || champ.settings.requireEnrollment) && (
              <button 
                onClick={() => setActiveTab('documentos')}
                className={`py-4 border-b-4 whitespace-nowrap transition-colors ${activeTab === 'documentos' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}`}
              >
                Meus Documentos
              </button>
            )}
            {athleteProfile?.teamRole === 'PRESIDENT' && teamDashboard && (
              <button 
                onClick={() => setActiveTab('painel-atletica')}
                className={`py-4 border-b-4 whitespace-nowrap transition-colors ${activeTab === 'painel-atletica' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-neutral-500 hover:text-white hover:border-neutral-700'}`}
              >
                Painel da Atlética
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Sobre o Evento</h3>
                <p className="text-slate-600 font-sans whitespace-pre-wrap">{champ.description || 'Nenhuma descrição detalhada fornecida para este campeonato.'}</p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Regulamento</h3>
                <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 text-center">
                  <Info className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">Documento pendente.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="animate-in fade-in duration-500 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
              <Shield className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-800">Equipes Inscritas</h3>
              <p className="text-gray-500 mt-2 text-sm">Disponível em breve.</p>
            </div>
          )}

          {activeTab === 'brackets' && (
            <div className="animate-in fade-in duration-500 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
              <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-800">Tabela de Jogos</h3>
              <p className="text-gray-500 mt-2 text-sm">Será gerada após encerramento.</p>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-blue-500" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Meus Documentos</h2>
                  <p className="text-sm text-slate-500">Envie os documentos exigidos para participar do campeonato.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {champ.settings?.requireRg && (
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-2">RG / Doc. Oficial</h3>
                      {athleteDocument?.rgUrl ? (
                        <div>
                          <div className={`mb-4 inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg uppercase ${
                            athleteDocument.rgStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                            athleteDocument.rgStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                            'bg-orange-50 text-orange-700'
                          }`}>
                            {athleteDocument.rgStatus === 'APPROVED' ? 'Aprovado' : athleteDocument.rgStatus === 'REJECTED' ? 'Rejeitado' : 'Em Análise'}
                          </div>
                          {athleteDocument.rgStatus === 'REJECTED' && (
                            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mb-4">{athleteDocument.rgRejectionReason}</p>
                          )}
                          <a href={`${API_URL}${athleteDocument.rgUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                            Visualizar Arquivo
                          </a>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-slate-600 mb-4">Você ainda não enviou seu documento.</p>
                          <label className="cursor-pointer inline-flex items-center bg-blue-50 text-blue-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              try {
                                const res = await apiClient.post<{url: string}>('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                await apiClient.post(`/championships/${id}/athlete-document`, { type: 'rg', url: res.url });
                                toast.success('RG enviado com sucesso!');
                                fetchAthleteDocument();
                              } catch (err: any) { toast.error(err.message || 'Erro ao enviar RG'); }
                            }} />
                            Enviar RG
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {champ.settings?.requireEnrollment && (
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-2">Comprovante de Matrícula</h3>
                      {athleteDocument?.enrollmentUrl ? (
                        <div>
                          <div className={`mb-4 inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg uppercase ${
                            athleteDocument.enrollmentStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                            athleteDocument.enrollmentStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                            'bg-orange-50 text-orange-700'
                          }`}>
                            {athleteDocument.enrollmentStatus === 'APPROVED' ? 'Aprovado' : athleteDocument.enrollmentStatus === 'REJECTED' ? 'Rejeitado' : 'Em Análise'}
                          </div>
                          {athleteDocument.enrollmentStatus === 'REJECTED' && (
                            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mb-4">{athleteDocument.enrollmentRejectionReason}</p>
                          )}
                          <a href={`${API_URL}${athleteDocument.enrollmentUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                            Visualizar Arquivo
                          </a>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-slate-600 mb-4">Você ainda não enviou seu comprovante.</p>
                          <label className="cursor-pointer inline-flex items-center bg-blue-50 text-blue-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              try {
                                const res = await apiClient.post<{url: string}>('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                await apiClient.post(`/championships/${id}/athlete-document`, { type: 'enrollment', url: res.url });
                                toast.success('Matrícula enviada com sucesso!');
                                fetchAthleteDocument();
                              } catch (err: any) { toast.error(err.message || 'Erro ao enviar matrícula'); }
                            }} />
                            Enviar Matrícula
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>
          )}

          {activeTab === 'painel-atletica' && athleteProfile?.teamRole === 'PRESIDENT' && teamDashboard && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-indigo-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Gestão da Equipe</h2>
                  <p className="text-sm text-slate-500">Valide as modalidades que seus atletas se inscreveram.</p>
                </div>
              </div>
              
              {teamDashboard.subscriptions.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-gray-200">
                    <p className="text-slate-500">Nenhum atleta da sua equipe se inscreveu ainda.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                          <tr>
                            <th className="px-6 py-4">Atleta</th>
                            <th className="px-6 py-4">Modalidade</th>
                            <th className="px-6 py-4">Documentos</th>
                            <th className="px-6 py-4 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {teamDashboard.subscriptions.map((sub: any) => {
                            const doc = teamDashboard.documents.find((d: any) => d.athlete?.id === sub.athlete?.id);
                            return (
                              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-900">{sub.athlete?.user?.name}</div>
                                  <div className="text-xs text-slate-500">{sub.athlete?.cpf || 'Sem CPF'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-800">{sub.modality?.name}</div>
                                  <div className="text-[10px] uppercase font-bold text-slate-500">{sub.modality?.type} - {sub.modality?.gender}</div>
                                </td>
                                <td className="px-6 py-4">
                                  {champ.settings?.requireRg || champ.settings?.requireEnrollment ? (
                                    <div className="flex flex-col gap-1 text-[10px] font-bold uppercase">
                                      {champ.settings.requireRg && (
                                        <div className={`flex items-center gap-1 ${doc?.rgStatus === 'APPROVED' ? 'text-emerald-600' : doc?.rgStatus === 'PENDING' ? 'text-amber-500' : 'text-red-500'}`}>
                                          RG: {doc?.rgStatus === 'APPROVED' ? 'OK' : doc?.rgStatus === 'PENDING' ? 'Pendente' : doc?.rgStatus === 'REJECTED' ? 'Rejeitado' : 'Faltante'}
                                        </div>
                                      )}
                                      {champ.settings.requireEnrollment && (
                                        <div className={`flex items-center gap-1 ${doc?.enrollmentStatus === 'APPROVED' ? 'text-emerald-600' : doc?.enrollmentStatus === 'PENDING' ? 'text-amber-500' : 'text-red-500'}`}>
                                          MATR: {doc?.enrollmentStatus === 'APPROVED' ? 'OK' : doc?.enrollmentStatus === 'PENDING' ? 'Pendente' : doc?.enrollmentStatus === 'REJECTED' ? 'Rejeitada' : 'Faltante'}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400">Não exigido</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {sub.status === 'PENDING_TEAM_APPROVAL' ? (
                                    <button
                                      onClick={async () => {
                                        if (window.confirm(`Aprovar inscrição de ${sub.athlete?.user?.name}?`)) {
                                          try {
                                            await apiClient.post(`/championships/${id}/subscriptions/${sub.id}/approve`);
                                            toast.success('Inscrição aprovada pela Atlética!');
                                            fetchTeamDashboard();
                                            fetchMySubscriptions();
                                          } catch (err: any) {
                                            toast.error(err.message || 'Erro ao aprovar.');
                                          }
                                        }
                                      }}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase transition-colors"
                                    >
                                      Aprovar Atleta
                                    </button>
                                  ) : (
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">
                                      {sub.status === 'PENDING_DOCS' ? 'Docs Pendentes' :
                                       sub.status === 'PENDING_PAYMENT' ? 'Aguardando Pagto' :
                                       sub.status === 'CONFIRMED' ? 'Confirmado' :
                                       sub.status === 'REJECTED' ? 'Rejeitado' : 'Em Andamento'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}

          {activeTab === 'modalities' && (
            <div className="animate-in fade-in duration-500 space-y-10">
              {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600 rounded-full shrink-0">
                  <Info size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-lg text-slate-900">Quer participar?</h3>
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
                 <div className="w-12 h-12 bg-orange-100 flex items-center justify-center text-orange-600 rounded-full shrink-0">
                   <Shield size={24} />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-slate-900">Quase lá!</h3>
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
            <div className={`p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-300 border shadow-sm ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                  {isAvailable ? <CheckCircle2 size={24} /> : <Info size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Sua Disponibilidade</h3>
                  <p className={`text-sm mt-1 ${isAvailable ? 'text-green-800' : 'text-gray-600'}`}>
                    {isAvailable 
                      ? "Você está marcado como DISPONÍVEL para jogar. Seu presidente será notificado!"
                      : "Confirme sua disponibilidade para sinalizar ao seu presidente que você quer ser convocado."}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleAvailability}
                disabled={loadingAvailability}
                className={`font-bold py-2.5 px-6 rounded-xl transition-all whitespace-nowrap disabled:opacity-50 shadow-sm ${isAvailable ? 'bg-white text-green-700 border border-green-200 hover:bg-green-50' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {loadingAvailability ? 'Atualizando...' : (isAvailable ? 'Remover Disponibilidade' : 'Estou Disponível!')}
              </button>
            </div>
          )}

          {/* Modalities Section */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <CheckCircle2 className="text-blue-500" /> 
                Modalidades
              </h2>
              
              {/* Filter Bar */}
              {champ.modalities && champ.modalities.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar modalidade..." 
                      className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="ALL">Todos os Tipos</option>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="COLETIVO">Coletivo</option>
                    </select>
                    <select 
                      className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer"
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
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Nenhuma modalidade disponível</h3>
                    <p className="text-gray-500 mt-2">A organização ainda não cadastrou modalidades para este campeonato.</p>
                  </div>
                );
              }

              if (filteredModalities.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Filter size={32} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="font-bold text-slate-800">Nenhuma modalidade encontrada</h3>
                    <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros de busca para encontrar outras modalidades.</p>
                    <button 
                      onClick={() => { setFilterText(''); setFilterType('ALL'); setFilterGender('ALL'); }}
                      className="mt-4 px-4 py-2 text-sm font-bold text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
