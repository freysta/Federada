import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { 
  User as UserIcon, 
  Shield, 
  FileText, 
  Package, 
  LogOut, 
  KeyRound, 
  Loader2, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  UserCheck, 
  UserX, 
  ExternalLink,
  Trash2,
  Building2,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface OrderItem {
  productName: string;
  productSize?: string;
  quantity: number;
  price: number;
  customName?: string;
  customNumber?: string;
  playerType?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  amount: number;
  status: string;
  createdAt: string;
  pixCopyPaste?: string;
  paymentId?: string;
}

interface AthleteProfilePageProps {
  defaultTab?: 'perfil' | 'atletica' | 'documentos' | 'pedidos';
}

export default function AthleteProfilePage({ defaultTab }: AthleteProfilePageProps = {}) {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State
  const initialTab = defaultTab || searchParams.get('tab') || 'perfil';
  const [activeTab, setActiveTab] = useState<'perfil' | 'atletica' | 'documentos' | 'pedidos'>(
    (initialTab as any) || 'perfil'
  );

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: '',
    userType: 'ALUNO',
    period: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Athlete & Team State
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingAthlete, setLoadingAthlete] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Document Upload State
  const [uploadingRg, setUploadingRg] = useState(false);
  const [uploadingEnrollment, setUploadingEnrollment] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (token) {
      fetchAthleteProfile();
      fetchOrders();
    }
  }, [token]);

  const fetchAthleteProfile = async () => {
    setLoadingAthlete(true);
    try {
      const data = await apiClient.get<any>('/teams/my/profile');
      setAthleteProfile(data || null);
      if (data?.team) {
        if (data.teamRole === 'PRESIDENT' || data.team?.owner?.id === user?.id) {
          fetchJoinRequests();
        }
        fetchTeamMembers(data.team.id);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil de atleta', err);
    } finally {
      setLoadingAthlete(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const data = await apiClient.get<any[]>(`/teams/${teamId}/members`);
      setTeamMembers(data || []);
    } catch (err) {
      console.error('Erro ao buscar membros', err);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const data = await apiClient.get<any[]>('/teams/my-team/join-requests');
      setJoinRequests(data || []);
    } catch (err) {
      console.error('Erro ao buscar solicitações', err);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await apiClient.get<Order[]>('/orders/me');
      setOrders(data || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await apiClient.put('/users/me', {
        name: profileData.name || undefined,
        phone: profileData.phone || undefined,
        userType: profileData.userType,
        period: profileData.userType === 'ALUNO' ? profileData.period : undefined
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoadingPassword(true);
    try {
      await apiClient.put('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLeaveOrCancelTeam = async () => {
    const isPending = athleteProfile?.teamJoinStatus === 'PENDING';
    const isRejected = athleteProfile?.teamJoinStatus === 'REJECTED';
    const msg = isPending 
      ? 'Deseja cancelar sua solicitação de vínculo?' 
      : isRejected 
      ? 'Deseja limpar este status e tentar se vincular a outra equipe?' 
      : 'Tem certeza que deseja se desvincular desta equipe?';

    if (!window.confirm(msg)) return;

    try {
      await apiClient.delete('/teams/my/membership');
      toast.success('Vínculo removido com sucesso!');
      fetchAthleteProfile();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar ação.');
    }
  };

  const handleApproveRejectRequest = async (profileId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/teams/my-team/requests/${profileId}/status`, { status });
      toast.success(status === 'APPROVED' ? 'Atleta aprovado!' : 'Solicitação recusada.');
      fetchJoinRequests();
      if (athleteProfile?.team) fetchTeamMembers(athleteProfile.team.id);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar solicitação.');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`ATENÇÃO! Deseja remover o atleta ${memberName} da sua atlética? Ele perderá acesso ao painel da equipe.`)) return;
    try {
      await apiClient.delete(`/teams/my-team/members/${memberId}`);
      toast.success(`${memberName} foi removido da equipe.`);
      if (athleteProfile?.team) fetchTeamMembers(athleteProfile.team.id);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover atleta.');
    }
  };

  const handleChangeMemberRole = async (memberId: string, memberName: string, newRole: 'PRESIDENT' | 'MEMBER') => {
    const action = newRole === 'PRESIDENT' ? 'promover a PRESIDENTE' : 'rebaixar a ATLETA';
    if (!window.confirm(`Deseja ${action} o membro ${memberName}?`)) return;
    try {
      await apiClient.patch(`/teams/my-team/members/${memberId}/role`, { role: newRole });
      toast.success(`Cargo de ${memberName} atualizado para ${newRole === 'PRESIDENT' ? 'Presidente' : 'Atleta'}.`);
      if (athleteProfile?.team) fetchTeamMembers(athleteProfile.team.id);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar cargo.');
    }
  };

  const handleUploadDocument = async (type: 'rg' | 'enrollment', file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (type === 'rg') setUploadingRg(true);
    else setUploadingEnrollment(true);

    try {
      await apiClient.post(`/teams/my/documents/${type}`, formData);
      toast.success('Documento enviado com sucesso!');
      fetchAthleteProfile();
    } catch (err: any) {
      toast.error(err.message || 'Falha no envio.');
    } finally {
      if (type === 'rg') setUploadingRg(false);
      else setUploadingEnrollment(false);
    }
  };

  const getDocBadge = (status?: string) => {
    if (status === 'APPROVED') return <span className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={14} /> Aprovado</span>;
    if (status === 'REJECTED') return <span className="bg-rose-500/15 text-rose-600 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><XCircle size={14} /> Rejeitado</span>;
    if (status === 'PENDING') return <span className="bg-amber-500/15 text-amber-600 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Clock size={14} /> Em Análise</span>;
    return <span className="bg-slate-200 text-slate-600 border border-slate-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Pendente</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4 pb-24 font-inter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">

        {/* 1. HERO HEADER COM LOGOUT EM DESTAQUE */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-purple-500/10 pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 border-white/20 shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Atleta'}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">{user?.email}</p>
              
              {athleteProfile?.team && (
                <div className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                  <Shield size={14} className="text-orange-500" />
                  <span>{athleteProfile.team.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({athleteProfile.teamRole || 'Membro'})</span>
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO DE LOGOUT VISÍVEL E FORTE */}
          <div className="relative z-10 shrink-0 flex items-center gap-3">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full md:w-auto px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 border border-rose-500 active:scale-95"
            >
              <LogOut size={18} />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>

        {/* 2. SUB-NAV PILLS FOR TABS */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <button
            onClick={() => { setActiveTab('perfil'); setSearchParams({ tab: 'perfil' }); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'perfil'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserIcon size={16} /> Meu Perfil
          </button>

          <button
            onClick={() => { setActiveTab('atletica'); setSearchParams({ tab: 'atletica' }); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all relative whitespace-nowrap ${
              activeTab === 'atletica'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield size={16} /> Minha Atlética
            {joinRequests.length > 0 && (
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('documentos'); setSearchParams({ tab: 'documentos' }); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText size={16} /> Documentos
          </button>

          <button
            onClick={() => { setActiveTab('pedidos'); setSearchParams({ tab: 'pedidos' }); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'pedidos'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package size={16} /> Meus Pedidos
          </button>
        </div>

        {/* 3. CONTEÚDO DAS ABAS */}

        {/* TAB 1: MEU PERFIL */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dados Pessoais */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <UserIcon className="text-orange-600" size={20} /> Dados Pessoais
              </h3>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={profileData.phone}
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-600 mb-1">Vínculo</label>
                    <select
                      value={profileData.userType}
                      onChange={e => setProfileData({...profileData, userType: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold bg-white outline-none focus:border-orange-500"
                    >
                      <option value="ALUNO">Aluno</option>
                      <option value="PROFESSOR">Professor</option>
                      <option value="FAMILIAR">Apoiador / Familiar</option>
                    </select>
                  </div>

                  {profileData.userType === 'ALUNO' && (
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-600 mb-1">Período / Semestre</label>
                      <input
                        type="text"
                        placeholder="Ex: 5º Semestre"
                        value={profileData.period}
                        onChange={e => setProfileData({...profileData, period: e.target.value})}
                        className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/20 disabled:opacity-50"
                  >
                    {loadingProfile ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>

            {/* Segurança / Alterar Senha */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <KeyRound className="text-orange-600" size={20} /> Segurança da Conta
              </h3>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Senha Atual</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {loadingPassword ? 'Alterando...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: MINHA ATLÉTICA */}
        {activeTab === 'atletica' && (
          <div className="space-y-6">
            {loadingAthlete ? (
              <div className="flex justify-center py-20 bg-white rounded-3xl border border-slate-200">
                <Loader2 className="animate-spin text-orange-600" size={40} />
              </div>
            ) : !athleteProfile?.team ? (
              /* CASO A: SEM EQUIPE */
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-sm max-w-2xl mx-auto space-y-4">
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
                  <Building2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase">Você não possui Atlética</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Para disputar os campeonatos e fazer parte das equipes, solicite o vínculo com a sua atlética ou crie uma nova.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => navigate('/atleticas')}
                    className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                  >
                    Ver Catálogo de Atléticas <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : athleteProfile.teamJoinStatus === 'PENDING' ? (
              /* CASO B: SOLICITAÇÃO PENDENTE DE APROVAÇÃO */
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Clock size={36} className="animate-pulse" />
                </div>
                <div>
                  <span className="bg-amber-200/60 text-amber-900 border border-amber-300 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    Solicitação em Análise
                  </span>
                  <h3 className="text-2xl font-black text-amber-950 uppercase mt-2">{athleteProfile.team.name}</h3>
                  <p className="text-amber-800 text-sm mt-2 max-w-lg mx-auto">
                    Seu pedido de vínculo foi enviado ao Presidente da equipe e está aguardando aprovação.
                  </p>
                </div>

                <div className="pt-4 border-t border-amber-200 flex justify-center">
                  <button
                    onClick={handleLeaveOrCancelTeam}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Cancelar Solicitação
                  </button>
                </div>
              </div>
            ) : athleteProfile.teamJoinStatus === 'REJECTED' ? (
              /* CASO C: SOLICITAÇÃO REJEITADA */
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                  <XCircle size={36} />
                </div>
                <div>
                  <span className="bg-rose-200 text-rose-900 border border-rose-300 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    Solicitação Recusada
                  </span>
                  <h3 className="text-2xl font-black text-rose-950 uppercase mt-2">{athleteProfile.team.name}</h3>
                  <p className="text-rose-800 text-sm mt-2 max-w-lg mx-auto">
                    Infelizmente sua solicitação de vínculo para esta equipe não foi aprovada pelo presidente.
                  </p>
                </div>

                <div className="pt-4 border-t border-rose-200 flex justify-center">
                  <button
                    onClick={handleLeaveOrCancelTeam}
                    className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    Limpar e Escolher Outra Atlética
                  </button>
                </div>
              </div>
            ) : (
              /* CASO D: ATLETA APROVADO OU PRESIDENTE */
              <div className="space-y-6">
                
                {/* Banner do Time */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {athleteProfile.team.logoUrl ? (
                        <img src={`${API_URL}${athleteProfile.team.logoUrl}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Shield size={36} className="text-orange-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-900 uppercase">{athleteProfile.team.name}</h2>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                          Vínculo Ativo
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{athleteProfile.team.university || 'Sem universidade associada'}</p>
                      <div className="mt-2 text-xs font-bold text-slate-700">
                        Função: <span className="text-orange-600 uppercase font-black">{athleteProfile.teamRole === 'PRESIDENT' ? 'Presidente da Atlética' : 'Atleta do Elenco'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ação de Desvincular-se (se não for presidente) */}
                  {athleteProfile.teamRole !== 'PRESIDENT' && (
                    <button
                      onClick={handleLeaveOrCancelTeam}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                    >
                      <LogOut size={16} /> Desvincular-se
                    </button>
                  )}
                </div>

                {/* Bloco do Presidente: Convite + Solicitações Pendentes */}
                {(athleteProfile.teamRole === 'PRESIDENT' || athleteProfile.team?.owner?.id === user?.id) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Link de Convite Direto */}
                    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-4">
                      <h4 className="font-black text-lg uppercase flex items-center gap-2">
                        <Copy className="text-orange-500" size={20} /> Link de Convite Rápido
                      </h4>
                      <p className="text-xs text-slate-400">
                        Compartilhe este link com novos atletas. Quem entrar por ele terá aprovação instantânea.
                      </p>
                      <div className="bg-black/60 p-3 rounded-xl border border-slate-700 font-mono text-xs text-orange-400 break-all select-all">
                        {window.location.origin}/invite/{athleteProfile.team?.inviteCode}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/invite/${athleteProfile.team?.inviteCode}`);
                          setCopiedCode(true);
                          toast.success('Link copiado!');
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {copiedCode ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copiedCode ? 'Copiado para a área de transferência!' : 'Copiar Link de Convite'}
                      </button>
                    </div>

                    {/* Solicitações Pendentes dos Alunos */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2">
                        <UserCheck className="text-orange-600" size={20} /> Pedidos Pendentes ({joinRequests.length})
                      </h4>

                      {joinRequests.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                          Nenhum aluno aguardando aprovação no momento.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {joinRequests.map(req => (
                            <div key={req.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
                              <div>
                                <div className="font-bold text-slate-800 text-xs">{req.user?.name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{req.course || 'Curso N/D'} • {req.period || 'Período N/D'}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApproveRejectRequest(req.id, 'APPROVED')}
                                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-colors"
                                  title="Aprovar Atleta"
                                >
                                  <UserCheck size={16} />
                                </button>
                                <button
                                  onClick={() => handleApproveRejectRequest(req.id, 'REJECTED')}
                                  className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-colors"
                                  title="Recusar"
                                >
                                  <UserX size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Elenco de Membros */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-black text-slate-900 uppercase text-lg flex items-center gap-2">
                    <Shield className="text-orange-600" size={20} /> Elenco Oficial ({teamMembers.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {teamMembers.map(member => (
                      <div key={member.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {member.user?.name?.charAt(0) || 'A'}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-800 text-xs truncate">{member.user?.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">{member.teamRole === 'PRESIDENT' ? 'Presidente' : 'Atleta'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {member.teamRole === 'PRESIDENT' ? (
                            <button
                              onClick={() => handleChangeMemberRole(member.id, member.user?.name || '', 'MEMBER')}
                              className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"
                              title="Rebaixar a Atleta"
                            >
                              <ArrowDown size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChangeMemberRole(member.id, member.user?.name || '', 'PRESIDENT')}
                              className="p-1.5 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition-colors"
                              title="Promover a Presidente"
                            >
                              <ArrowUp size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.id, member.user?.name || '')}
                            className="p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors"
                            title="Remover da Equipe"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="text-orange-600" size={24} /> Documentação Pessoal
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Envie seus documentos para liberação nos campeonatos oficiais da federação.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Documento RG */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-slate-900 text-base">RG / Documento Oficial</h4>
                    {getDocBadge(athleteProfile?.documentRgStatus)}
                  </div>
                  <p className="text-xs text-slate-500">Foto nítida da frente e verso do RG ou CNH.</p>

                  {athleteProfile?.documentRgStatus === 'REJECTED' && athleteProfile?.documentRgRejectionReason && (
                    <div className="mt-3 bg-rose-100 text-rose-800 p-3 rounded-xl text-xs font-semibold border border-rose-200">
                      Motivo da rejeição: {athleteProfile.documentRgRejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {athleteProfile?.documentRgStatus === 'APPROVED' ? (
                    <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs p-3 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" /> Documento Aprovado (Sem alterações)
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase px-4 py-3 rounded-xl transition-all text-center shadow-md flex items-center justify-center gap-2">
                      {uploadingRg ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                      <span>
                        {uploadingRg 
                          ? 'Enviando...' 
                          : athleteProfile?.documentRgUrl 
                          ? 'Reenviar / Substituir RG' 
                          : 'Enviar RG'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={e => e.target.files?.[0] && handleUploadDocument('rg', e.target.files[0])}
                        disabled={uploadingRg}
                      />
                    </label>
                  )}

                  {athleteProfile?.documentRgUrl && (
                    <a
                      href={`${API_URL}${athleteProfile.documentRgUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink size={14} /> Ver Arquivo
                    </a>
                  )}
                </div>
              </div>

              {/* Comprovante de Matrícula */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-slate-900 text-base">Comprovante de Matrícula</h4>
                    {getDocBadge(athleteProfile?.documentEnrollmentStatus)}
                  </div>
                  <p className="text-xs text-slate-500">Declaração ou comprovante do semestre atual.</p>

                  {athleteProfile?.documentEnrollmentStatus === 'REJECTED' && athleteProfile?.documentEnrollmentRejectionReason && (
                    <div className="mt-3 bg-rose-100 text-rose-800 p-3 rounded-xl text-xs font-semibold border border-rose-200">
                      Motivo da rejeição: {athleteProfile.documentEnrollmentRejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {athleteProfile?.documentEnrollmentStatus === 'APPROVED' ? (
                    <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs p-3 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" /> Documento Aprovado (Sem alterações)
                    </div>
                  ) : (
                    <label className="flex-1 cursor-pointer bg-slate-900 hover:bg-black text-white font-black text-xs uppercase px-4 py-3 rounded-xl transition-all text-center shadow-md flex items-center justify-center gap-2">
                      {uploadingEnrollment ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                      <span>
                        {uploadingEnrollment 
                          ? 'Enviando...' 
                          : athleteProfile?.documentEnrollmentUrl 
                          ? 'Reenviar / Substituir Matrícula' 
                          : 'Enviar Matrícula'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={e => e.target.files?.[0] && handleUploadDocument('enrollment', e.target.files[0])}
                        disabled={uploadingEnrollment}
                      />
                    </label>
                  )}

                  {athleteProfile?.documentEnrollmentUrl && (
                    <a
                      href={`${API_URL}${athleteProfile.documentEnrollmentUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink size={14} /> Ver Arquivo
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: MEUS PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Package className="text-orange-600" size={24} /> Histórico de Pedidos da Loja
            </h3>

            {loadingOrders ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-orange-600" size={36} />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-sm border border-dashed border-slate-300 rounded-2xl">
                Você ainda não realizou nenhum pedido na loja.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-mono text-[10px] text-slate-400">ID: {order.id.slice(0, 8)}</div>
                        <div className="text-xs font-bold text-slate-700 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-slate-900 text-base">
                          R$ {Number(order.amount).toFixed(2).replace('.', ',')}
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 font-mono font-black uppercase rounded-full inline-block mt-1 ${
                          order.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          order.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {order.status === 'PAID' ? 'Pago' : order.status === 'PENDING' ? 'Pendente' : order.status}
                        </span>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-slate-200 pt-3 mt-1 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                            <span className="font-bold text-slate-800">{item.quantity}x {item.productName}</span>
                            {item.productSize && <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">{item.productSize}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
