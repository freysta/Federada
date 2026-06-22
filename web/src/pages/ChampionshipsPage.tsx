import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Users, Shield, Check, Info, Plus, Copy, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function ChampionshipsPage() {
  const { token, user } = useAuth();
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Atlética State
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Create Team State
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamUniversity, setNewTeamUniversity] = useState('');
  
  // President Admin State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Bulk Registration State
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [mySubscriptions, setMySubscriptions] = useState<string[]>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<'subscribe' | 'matches'>('subscribe');
  
  // Upload State
  const [uploadingRg, setUploadingRg] = useState(false);
  const [uploadingEnrollment, setUploadingEnrollment] = useState(false);

  const fetchChampionships = () => {
    setLoading(true);
    fetch(`${API_URL}/championships`)
      .then(res => res.json())
      .then(data => {
        setChampionships(data);
        setLoading(false);
      })
      .catch(err => {
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
      
      // Se for o dono, busca os membros do time para usar no Modal
      if (data?.team?.owner?.id === user?.id) {
        fetchTeamMembers(data.team.id);
      }
    })
    .catch(err => {
      console.error('Erro ao buscar perfil', err);
      setLoadingProfile(false);
    });
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

  const fetchMySubscriptions = () => {
    if (!token) return;
    fetch(`${API_URL}/championships/my-subscriptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      // data is an array of Subscription entities
      const subIds = data.map((sub: any) => sub.modality?.id);
      setMySubscriptions(subIds.filter(Boolean));
    })
    .catch(err => console.error('Erro ao buscar inscrições', err));
  };

  useEffect(() => {
    fetchChampionships();
    fetchProfile();
    fetchMySubscriptions();
  }, [token]);

  const toggleModality = (modId: string) => {
    setSelectedModalities(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleBulkSubscribe = async () => {
    if (!user) {
      toast.error('Faça login para se inscrever!');
      return;
    }
    if (selectedModalities.length === 0) return;

    setIsSubscribing(true);
    const toastId = toast.loading(`Processando ${selectedModalities.length} inscrição(ões)...`);
    
    let successCount = 0;
    let errors: string[] = [];

    // Loop through selected modalities to subscribe via individual endpoint
    for (const modId of selectedModalities) {
      try {
        const res = await fetch(`${API_URL}/championships/${modId}/subscribe`, {
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
      setSelectedModalities([]); // clear selection
      fetchMySubscriptions(); // refresh to show as INSCRITO
    } else {
      toast.error('Nenhuma inscrição foi concluída. Erro: ' + errors[0], { id: toastId });
    }
    
    setIsSubscribing(false);
  };

  const handleUnsubscribe = async (modId: string) => {
    const toastId = toast.loading('Cancelando inscrição...');
    try {
      const res = await fetch(`${API_URL}/championships/${modId}/unsubscribe`, {
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

  const handleUploadDocument = (type: 'rg' | 'enrollment', file: File) => {
    if (!token) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (type === 'rg') setUploadingRg(true);
    else setUploadingEnrollment(true);
    
    fetch(`${API_URL}/teams/my/documents/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    .then(res => {
      if (!res.ok) throw new Error('Falha no upload');
      return res.json();
    })
    .then(data => {
      toast.success('Documento enviado com sucesso!');
      setAthleteProfile(data);
    })
    .catch(err => toast.error(err.message))
    .finally(() => {
      if (type === 'rg') setUploadingRg(false);
      else setUploadingEnrollment(false);
    });
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Entrando na equipe...');
    try {
      const res = await fetch(`${API_URL}/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode, cpf, birthDate, course, period })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao entrar na Atlética. Verifique os dados.');
      
      toast.success('Bem-vindo à equipe!', { id: toastId });
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Criando a Atlética...');
    try {
      const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTeamName, university: newTeamUniversity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao criar Atlética');
      
      toast.success('Atlética criada com sucesso!', { id: toastId, duration: 5000 });
      setIsCreatingTeam(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loadingProfile && token) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
        
        {/* HEADER LIMPO E ELEGANTE */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white pt-24 pb-12 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Trophy size={400} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
              Hub de Campeonatos
            </h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Gerencie sua equipe, selecione suas modalidades e faça todas as suas inscrições em um só lugar.
            </p>
          </div>
          
          {/* USER TEAM BADGE OR LOGIN PROMPT */}
          {user && athleteProfile?.team ? (
            <div 
              onClick={() => setShowProfileModal(true)}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col gap-3 shadow-lg min-w-[280px] cursor-pointer hover:bg-white/20 transition-all"
            >
              <div className="flex items-center gap-4 border-b border-white/20 pb-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-800 font-bold text-xl shrink-0 overflow-hidden shadow-inner">
                  {athleteProfile.team.logoUrl ? <img src={athleteProfile.team.logoUrl} className="w-full h-full object-cover" /> : athleteProfile.team.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Sua Equipe</span>
                  <span className="font-bold text-lg leading-tight line-clamp-1">{athleteProfile.team.name}</span>
                </div>
                {athleteProfile.team.owner?.id === user.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowAdminModal(true); }}
                    className="bg-white text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm uppercase tracking-wide"
                  >
                    Admin
                  </button>
                )}
              </div>
              <div className="flex justify-between text-xs text-blue-100">
                <span><strong className="text-white">Atleta:</strong> {user.name}</span>
                <span><strong className="text-white">CPF:</strong> {athleteProfile.cpf}</span>
              </div>
            </div>
          ) : !user && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 flex flex-col gap-1">
              <p className="font-medium text-sm">Você não está logado.</p>
              <p className="text-xs text-blue-200">Crie sua conta no menu superior.</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* ONBOARDING SE NÃO ESTIVER EM UMA ATLÉTICA OU NÃO LOGADO */}
        {(!user || !athleteProfile || !athleteProfile.team) ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 max-w-3xl mx-auto mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={40} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Qual a sua Atlética?</h2>
              <p className="text-slate-500 text-lg">Para se inscrever nos campeonatos, você precisa estar vinculado a uma equipe oficial.</p>
            </div>

            {!user ? (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                <h3 className="font-bold text-xl mb-3 text-slate-800">Primeiro Passo</h3>
                <p className="text-slate-600 mb-6 max-w-md">Para se vincular a uma atlética e gerenciar suas inscrições, você precisa ter uma conta gratuita na plataforma.</p>
                <div className="bg-blue-100 text-blue-800 px-6 py-4 rounded-xl font-bold flex items-center gap-2 animate-pulse border border-blue-200">
                  <span>⬆️</span>
                  Clique em "ENTRAR / CADASTRAR" no menu superior
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form de Atleta */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users size={20} className="text-blue-500" /> Sou um Atleta
                </h3>
                <form onSubmit={handleJoinTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">CÓDIGO DA EQUIPE</label>
                    <input 
                      required type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                      placeholder="Ex: FEDE-1234"
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">CPF</label>
                    <input 
                      required type="text" value={cpf} onChange={e => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NASCIMENTO</label>
                    <input 
                      required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">CURSO</label>
                      <input 
                        required type="text" value={course} onChange={e => setCourse(e.target.value)}
                        placeholder="Ex: Direito"
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">PERÍODO</label>
                      <input 
                        required type="text" value={period} onChange={e => setPeriod(e.target.value)}
                        placeholder="Ex: 4º Semestre"
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-2 shadow-sm">
                    Entrar na Equipe
                  </button>
                </form>
              </div>

              {/* Form de Presidente */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" /> Sou o Presidente
                </h3>
                
                {isCreatingTeam ? (
                  <form onSubmit={handleCreateTeam} className="space-y-4 flex-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">NOME DA ATLÉTICA</label>
                      <input 
                        required type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                        placeholder="A.A.A. Exemplo"
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">UNIVERSIDADE / INSTITUIÇÃO</label>
                      <input 
                        required type="text" value={newTeamUniversity} onChange={e => setNewTeamUniversity(e.target.value)}
                        placeholder="Ex: IFRO - Campus Cacoal"
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setIsCreatingTeam(false)} className="flex-1 text-slate-500 font-medium hover:bg-slate-200 rounded-lg py-2 transition-colors">
                        Cancelar
                      </button>
                      <button type="submit" className="flex-1 bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm">
                        Criar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-slate-500 mb-6">Crie sua delegação agora para receber o código de convite e enviar aos seus atletas.</p>
                    <button 
                      onClick={() => setIsCreatingTeam(true)}
                      className="w-full border-2 border-dashed border-slate-300 text-slate-600 font-semibold py-8 rounded-xl hover:bg-white hover:border-slate-400 hover:text-slate-800 transition-all flex flex-col items-center gap-2"
                    >
                      <Plus size={24} />
                      Nova Atlética
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        ) : (
          /* DASHBOARD DE CAMPEONATOS (Quando já tem time) */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* TABS */}
            <div className="flex bg-slate-200 p-1 rounded-xl w-full sm:w-fit mx-auto sm:mx-0">
              <button 
                onClick={() => setActiveTab('subscribe')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'subscribe' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Inscrições Abertas
              </button>
              <button 
                onClick={() => setActiveTab('matches')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'matches' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tabela de Jogos
              </button>
            </div>

            {activeTab === 'matches' ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Tabela de Jogos</h3>
                <p className="text-slate-500">Os jogos ainda não foram gerados pela organização.<br/>Fique de olho nas novidades!</p>
              </div>
            ) : (
              <>
                {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
            ) : championships.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-200">
                <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-2xl font-bold text-slate-600">Nenhum campeonato aberto.</h3>
                <p className="text-slate-500 mt-2">A temporada está tranquila no momento. Volte em breve!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {championships.map(champ => (
                  <div key={champ.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Champ Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${champ.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {champ.status === 'OPEN' ? 'Inscrições Abertas' : 'Encerrado'}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{champ.name}</h2>
                        <p className="text-slate-500 text-sm mt-1">{champ.description}</p>
                      </div>
                      <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                        Início: {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}
                      </div>
                    </div>

                    {/* Champ Modalities Grid */}
                    <div className="p-8">
                      <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                        <Check size={20} className="text-blue-500" /> Escolha as Modalidades
                      </h3>

                      {champ.modalities && champ.modalities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {champ.modalities.map((mod: any) => {
                            const isSubscribed = mySubscriptions.includes(mod.id);
                            const isSelected = selectedModalities.includes(mod.id);
                            
                            if (isSubscribed) {
                              return (
                                <div key={mod.id} className="relative p-5 rounded-2xl border-2 border-green-500 bg-green-50/30 overflow-hidden flex flex-col">
                                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                                    <CheckCircle2 size={12} /> INSCRITO
                                  </div>
                                  <div className="pr-8 mb-4">
                                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">{mod.type}</span>
                                    <h4 className="font-bold text-slate-800 text-lg leading-tight">{mod.name}</h4>
                                  </div>
                                  <div className="mt-auto">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleUnsubscribe(mod.id); }}
                                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
                                    >
                                      Cancelar Inscrição
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div 
                                key={mod.id} 
                                onClick={() => champ.status === 'OPEN' && toggleModality(mod.id)}
                                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col ${
                                  champ.status !== 'OPEN' ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' :
                                  isSelected ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10 transform scale-[1.02]' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                                }`}
                              >
                                {/* Checkbox Circle */}
                                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'
                                }`}>
                                  {isSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                                
                                <div className="pr-8 mb-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{mod.type}</span>
                                  <h4 className="font-bold text-slate-800 text-lg leading-tight">{mod.name}</h4>
                                </div>
                                
                                <div className="mt-auto">
                                  <span className="font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 text-sm shadow-sm inline-block">
                                    {Number(mod.price) === 0 ? 'Grátis' : `R$ ${Number(mod.price).toFixed(2).replace('.', ',')}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">Nenhuma modalidade cadastrada ainda.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR FOR BULK SUBSCRIPTION */}
      {selectedModalities.length > 0 && user && athleteProfile?.team && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] p-4 px-6 z-40 transform transition-transform animate-in slide-in-from-bottom-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                {selectedModalities.length}
              </div>
              <div>
                <p className="font-bold text-slate-800 leading-tight">Modalidades selecionadas</p>
                <p className="text-xs text-slate-500">Revise suas escolhas antes de confirmar.</p>
              </div>
            </div>
            <button 
              onClick={handleBulkSubscribe}
              disabled={isSubscribing}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isSubscribing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              Confirmar Inscrições
            </button>
          </div>
        </div>
      )}

      {/* ADMIN MODAL */}
      {showAdminModal && athleteProfile?.team && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAdminModal(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                <h3 className="font-bold text-xl text-slate-800">
                  Painel de Gestão: {athleteProfile.team.name}
                </h3>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-2 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-white flex-1">
              
              {/* Invite Code Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 text-sm mb-1 uppercase tracking-wide">Código de Convite</h4>
                  <p className="font-mono text-2xl font-bold text-blue-900">{athleteProfile.team.inviteCode}</p>
                  <p className="text-xs text-blue-600 mt-1">Compartilhe isso com os alunos para que eles se juntem à equipe.</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(athleteProfile.team.inviteCode);
                    setCopiedCode(true);
                    toast.success('Código copiado!');
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  {copiedCode ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  {copiedCode ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>

              <h4 className="font-bold text-lg text-slate-800 mb-4">Elenco Ativo</h4>
              
              {loadingMembers ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Users size={32} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-500">Nenhum atleta se vinculou ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-4 font-semibold">Atleta</th>
                        <th className="p-4 font-semibold">E-mail</th>
                        <th className="p-4 font-semibold">CPF</th>
                        <th className="p-4 font-semibold">Nascimento</th>
                        <th className="p-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teamMembers.map((member: any) => (
                        <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-800">{member.user?.name || '---'}</td>
                          <td className="p-4 text-slate-500">{member.user?.email || '---'}</td>
                          <td className="p-4 text-slate-600 font-mono text-xs">{member.cpf}</td>
                          <td className="p-4 text-slate-600">{new Date(member.birthDate).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="bg-green-100 text-green-700 font-bold text-xs px-2.5 py-1 rounded-md">
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ATHLETE PROFILE MODAL */}
      {showProfileModal && athleteProfile?.team && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-8 flex justify-between items-start relative">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <Shield size={200} />
              </div>
              <div className="relative z-10">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Cartão do Atleta</span>
                <h3 className="font-bold text-3xl">{user?.name}</h3>
                <p className="text-blue-200 font-mono mt-1 flex gap-4">
                  <span>CPF: {athleteProfile.cpf}</span>
                  <span className="bg-blue-800 px-2 rounded">ID: {athleteProfile.athleteIdCode}</span>
                </p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-blue-200 hover:text-white transition-colors relative z-10">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-slate-100 pb-8 mb-8">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 mb-1">EQUIPE</span>
                  <span className="font-bold text-slate-800">{athleteProfile.team.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 mb-1">CURSO</span>
                  <span className="font-bold text-slate-800">{athleteProfile.course || '---'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 mb-1">PERÍODO</span>
                  <span className="font-bold text-slate-800">{athleteProfile.period || '---'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-8 mb-8">
                {/* Upload RG */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">Documento Pessoal (RG)</h5>
                    <p className="text-xs text-slate-500 mb-2">Status: <span className="font-bold">{athleteProfile.documentRgStatus}</span></p>
                    <label className="cursor-pointer bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition">
                      {uploadingRg ? 'Enviando...' : 'Fazer Upload'}
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => {
                        if (e.target.files && e.target.files[0]) handleUploadDocument('rg', e.target.files[0]);
                      }} disabled={uploadingRg} />
                    </label>
                  </div>
                  {athleteProfile.documentRgUrl && (
                    <a href={`${API_URL}${athleteProfile.documentRgUrl}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600">
                      Ver DOC
                    </a>
                  )}
                </div>

                {/* Upload Matricula */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">Atestado de Matrícula</h5>
                    <p className="text-xs text-slate-500 mb-2">Status: <span className="font-bold">{athleteProfile.documentEnrollmentStatus}</span></p>
                    <label className="cursor-pointer bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition">
                      {uploadingEnrollment ? 'Enviando...' : 'Fazer Upload'}
                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => {
                        if (e.target.files && e.target.files[0]) handleUploadDocument('enrollment', e.target.files[0]);
                      }} disabled={uploadingEnrollment} />
                    </label>
                  </div>
                  {athleteProfile.documentEnrollmentUrl && (
                    <a href={`${API_URL}${athleteProfile.documentEnrollmentUrl}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600">
                      Ver DOC
                    </a>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" /> Suas Inscrições
              </h4>
              
              {mySubscriptions.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500 text-sm">
                  Você ainda não se inscreveu em nenhuma modalidade.
                </div>
              ) : (
                <div className="space-y-3">
                  {mySubscriptions.map(modId => {
                    // find mod name from championships data
                    let modName = 'Modalidade ' + modId;
                    let champName = '';
                    championships.forEach(c => {
                      const m = c.modalities?.find((x: any) => x.id === modId);
                      if (m) {
                        modName = m.name + ' ' + m.type;
                        champName = c.name;
                      }
                    });
                    
                    return (
                      <div key={modId} className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800">{modName}</p>
                          <p className="text-xs text-slate-500">{champName}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 font-bold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} /> Confirmada
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
