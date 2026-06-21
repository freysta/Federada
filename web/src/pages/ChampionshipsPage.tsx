import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Users, Shield, ArrowRight, Info, Plus, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChampionshipsPage() {
  const { token, user } = useAuth();
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CAMPEONATOS' | 'ATLETICA'>('CAMPEONATOS');

  // Atlética State
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // Create Team State
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamUniversity, setNewTeamUniversity] = useState('');
  
  // President Admin State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
    if (!token) return;
    setLoadingProfile(true);
    fetch(`${API_URL}/teams/my/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setAthleteProfile(data || null);
      setLoadingProfile(false);
      
      // Se for o dono, busca os membros do time
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

  useEffect(() => {
    if (activeTab === 'CAMPEONATOS') fetchChampionships();
    if (activeTab === 'ATLETICA' && token) fetchProfile();
  }, [activeTab, token]);

  const handleSubscribe = async (modalityId: string) => {
    if (!user) {
      toast.error('Faça login para se inscrever!');
      return;
    }

    const toastId = toast.loading('Processando inscrição...');
    try {
      const res = await fetch(`${API_URL}/championships/${modalityId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Erro ao se inscrever. Verifique se você já tem um Perfil de Atleta.');
      }

      toast.success('Inscrição realizada com sucesso!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode, cpf, birthDate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao entrar na Atlética');
      
      toast.success('Entrou na Atlética com sucesso!');
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      toast.success('Atlética criada! O código de convite é: ' + data.inviteCode, { duration: 10000 });
      setIsCreatingTeam(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Trophy className="mx-auto mb-6 text-yellow-400" size={64} />
          <h1 className="text-4xl md:text-6xl font-bold font-mono tracking-widest uppercase mb-4">
            HUB ESPORTIVO
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
            A arena oficial das Atléticas. Inscreva-se, defenda as cores da sua equipe e conquiste a glória universitária.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => setActiveTab('CAMPEONATOS')}
              className={`px-8 py-3 font-mono font-bold transition-colors border-2 ${activeTab === 'CAMPEONATOS' ? 'bg-white text-black border-white' : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'}`}
            >
              CAMPEONATOS ABERTOS
            </button>
            <button 
              onClick={() => setActiveTab('ATLETICA')}
              className={`px-8 py-3 font-mono font-bold transition-colors border-2 ${activeTab === 'ATLETICA' ? 'bg-[#00f0ff] text-black border-[#00f0ff]' : 'border-gray-600 text-gray-300 hover:border-[#00f0ff] hover:text-[#00f0ff]'}`}
            >
              MINHA ATLÉTICA / PERFIL
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'CAMPEONATOS' && (
          <>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black" size={48} /></div>
            ) : championships.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-300">
                <h3 className="text-xl font-bold font-mono text-gray-500">NENHUM CAMPEONATO ABERTO NO MOMENTO</h3>
              </div>
            ) : (
              <div className="space-y-12">
                {championships.map(champ => (
                  <div key={champ.id} className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 pb-6 border-b border-gray-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 text-xs font-bold font-mono ${champ.status === 'OPEN' ? 'bg-green-100 text-green-700 border border-green-700' : 'bg-gray-100 text-gray-700 border border-gray-700'}`}>
                            {champ.status === 'OPEN' ? 'INSCRIÇÕES ABERTAS' : 'ENCERRADO'}
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold uppercase">{champ.name}</h2>
                        <p className="text-gray-600 mt-2">{champ.description}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-left md:text-right font-mono text-sm">
                        <div><strong>Início:</strong> {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}</div>
                        <div><strong>Término:</strong> {champ.endDate ? new Date(champ.endDate).toLocaleDateString() : 'A definir'}</div>
                      </div>
                    </div>

                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                      <Shield size={24} /> MODALIDADES
                    </h3>

                    {champ.modalities && champ.modalities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {champ.modalities.map((mod: any) => (
                          <div key={mod.id} className="border border-gray-300 p-6 hover:border-black transition-colors flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-bold text-lg uppercase">{mod.name}</h4>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 font-mono">{mod.type}</span>
                            </div>
                            <div className="mt-auto pt-6 flex items-center justify-between">
                              <span className="font-mono font-bold text-lg">
                                {Number(mod.price) === 0 ? 'GRÁTIS' : `R$ ${Number(mod.price).toFixed(2).replace('.', ',')}`}
                              </span>
                              <button 
                                onClick={() => handleSubscribe(mod.id)}
                                disabled={champ.status !== 'OPEN'}
                                className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                INSCREVER-SE <ArrowRight size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Nenhuma modalidade cadastrada ainda.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'ATLETICA' && (
          <div className="max-w-4xl mx-auto">
            {!user ? (
              <div className="bg-yellow-50 border border-yellow-400 p-8 text-center flex flex-col items-center">
                <Info size={48} className="text-yellow-600 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Faça Login Primeiro</h3>
                <p className="text-gray-700">Você precisa estar logado na Federada para acessar seu perfil esportivo e se inscrever em campeonatos.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Instruções */}
                <div className="bg-white border-2 border-black p-6 flex flex-col md:flex-row gap-6 items-start">
                  <div className="bg-black text-white p-4 shrink-0 flex items-center justify-center">
                    <Info size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-2">Como funciona as inscrições?</h3>
                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                      <li>O Presidente da sua Atlética cria o time no sistema e gera um <strong>Código de Convite</strong>.</li>
                      <li>Você (atleta) utiliza o código no formulário abaixo para se vincular oficialmente.</li>
                      <li>Depois de vinculado, basta ir na aba "Campeonatos Abertos" e clicar em Inscrever-se nas suas modalidades!</li>
                    </ol>
                  </div>
                </div>

                {loadingProfile ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black" size={48} /></div>
                ) : athleteProfile && athleteProfile.team ? (
                  <div className="space-y-8">
                    {/* Perfil do Atleta (Já vinculado) */}
                    <div className="bg-white border-2 border-black p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#00f0ff] text-black font-bold font-mono text-xs px-4 py-1 border-b border-l border-black">
                        STATUS DOC: {athleteProfile.status}
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center font-bold text-4xl border-4 border-black overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          {athleteProfile.team.logoUrl ? <img src={athleteProfile.team.logoUrl} className="w-full h-full object-cover" /> : athleteProfile.team.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h2 className="text-3xl font-bold uppercase">{athleteProfile.team.name}</h2>
                            {athleteProfile.team.owner?.id === user?.id && (
                              <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-widest">
                                PRESIDENTE
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-lg mb-6 flex items-center justify-center md:justify-start gap-2">
                            <Users size={18} /> {athleteProfile.team.university || 'Universidade não informada'}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 border border-gray-200 p-4">
                              <span className="block text-xs font-mono font-bold text-gray-400 mb-1">ATLETA</span>
                              <span className="font-bold">{user?.name}</span>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 p-4">
                              <span className="block text-xs font-mono font-bold text-gray-400 mb-1">CPF</span>
                              <span className="font-bold font-mono">{athleteProfile.cpf}</span>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 p-4">
                              <span className="block text-xs font-mono font-bold text-gray-400 mb-1">DATA DE NASCIMENTO</span>
                              <span className="font-bold">{athleteProfile.birthDate}</span>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 p-4">
                              <span className="block text-xs font-mono font-bold text-gray-400 mb-1">PRESIDENTE RESPONSÁVEL</span>
                              <span className="font-bold">{athleteProfile.team.owner?.name || 'Desconhecido'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PAINEL DO PRESIDENTE */}
                    {athleteProfile.team.owner?.id === user?.id && (
                      <div className="bg-neutral-100 border-2 border-black p-8">
                        <h3 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
                          <Shield size={28} /> Painel Administrativo da Atlética
                        </h3>

                        <div className="bg-white border border-black p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div>
                            <h4 className="font-bold text-gray-600 uppercase text-sm mb-1">CÓDIGO DE CONVITE (COMPARTILHE COM OS ATLETAS)</h4>
                            <p className="font-mono text-3xl font-bold">{athleteProfile.team.inviteCode}</p>
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(athleteProfile.team.inviteCode);
                              setCopiedCode(true);
                              toast.success('Código copiado!');
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            className="bg-black text-white px-6 py-3 font-bold uppercase hover:bg-neutral-800 flex items-center gap-2"
                          >
                            {copiedCode ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                            {copiedCode ? 'COPIADO!' : 'COPIAR CÓDIGO'}
                          </button>
                        </div>

                        <h4 className="font-bold text-xl mb-4 border-b border-gray-300 pb-2">Elenco de Atletas</h4>
                        
                        {loadingMembers ? (
                          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-black" size={32} /></div>
                        ) : teamMembers.length === 0 ? (
                          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-400 bg-white">
                            Nenhum atleta se vinculou ainda. Compartilhe o código!
                          </div>
                        ) : (
                          <div className="overflow-x-auto bg-white border border-black">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-gray-100 border-b border-black text-sm uppercase font-mono">
                                  <th className="p-4 border-r border-gray-200">Nome do Atleta</th>
                                  <th className="p-4 border-r border-gray-200">E-mail</th>
                                  <th className="p-4 border-r border-gray-200">CPF</th>
                                  <th className="p-4 border-r border-gray-200">Nascimento</th>
                                  <th className="p-4">Status Doc</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teamMembers.map((member: any) => (
                                  <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-4 border-r border-gray-200 font-bold">{member.user?.name || '---'}</td>
                                    <td className="p-4 border-r border-gray-200 text-sm text-gray-600">{member.user?.email || '---'}</td>
                                    <td className="p-4 border-r border-gray-200 font-mono text-sm">{member.cpf}</td>
                                    <td className="p-4 border-r border-gray-200">{member.birthDate}</td>
                                    <td className="p-4">
                                      <span className="bg-green-100 text-green-800 border border-green-300 text-xs px-2 py-1 font-mono font-bold">
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
                    )}
                  </div>
                ) : (
                  /* Formulários de Vinculação / Criação */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Entrar em Atlética */}
                    <div className="bg-white border border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3 mb-6">
                        <Users size={24} className="text-[#00f0ff]" />
                        <h3 className="text-xl font-bold uppercase">Sou um Atleta</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-6">Utilize o código de convite fornecido pelo seu presidente para se juntar à delegação.</p>
                      
                      <form onSubmit={handleJoinTeam} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold font-mono mb-1">CÓDIGO DE CONVITE</label>
                          <input 
                            required type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                            placeholder="Ex: FEDE-1234"
                            className="w-full border border-black p-3 font-mono focus:ring-2 focus:ring-[#00f0ff] outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold font-mono mb-1">SEU CPF</label>
                          <input 
                            required type="text" value={cpf} onChange={e => setCpf(e.target.value)}
                            placeholder="000.000.000-00"
                            className="w-full border border-black p-3 font-mono focus:ring-2 focus:ring-[#00f0ff] outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold font-mono mb-1">DATA DE NASCIMENTO</label>
                          <input 
                            required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                            className="w-full border border-black p-3 font-mono focus:ring-2 focus:ring-[#00f0ff] outline-none" 
                          />
                        </div>
                        <button type="submit" className="w-full bg-black text-white font-bold py-4 mt-2 hover:bg-neutral-800 transition-colors uppercase tracking-wide">
                          Entrar na Atlética
                        </button>
                      </form>
                    </div>

                    {/* Criar Atlética */}
                    <div className="bg-neutral-100 border border-neutral-300 p-8 flex flex-col">
                      <div className="flex items-center gap-3 mb-6 opacity-80">
                        <Shield size={24} />
                        <h3 className="text-xl font-bold uppercase">Sou Presidente</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-6">Cadastre sua Atlética no sistema para gerar o código de convite para os seus atletas.</p>
                      
                      {isCreatingTeam ? (
                        <form onSubmit={handleCreateTeam} className="space-y-4 mt-auto">
                          <div>
                            <label className="block text-xs font-bold font-mono mb-1">NOME DA ATLÉTICA</label>
                            <input 
                              required type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                              placeholder="A.A.A. Exemplo"
                              className="w-full border border-black p-3 font-mono focus:ring-2 focus:ring-black outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold font-mono mb-1">UNIVERSIDADE / INSTITUIÇÃO</label>
                            <input 
                              required type="text" value={newTeamUniversity} onChange={e => setNewTeamUniversity(e.target.value)}
                              placeholder="Ex: IFRO - Campus Cacoal"
                              className="w-full border border-black p-3 font-mono focus:ring-2 focus:ring-black outline-none" 
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => setIsCreatingTeam(false)} className="flex-1 border border-black py-3 font-bold hover:bg-gray-200">
                              CANCELAR
                            </button>
                            <button type="submit" className="flex-1 bg-black text-white font-bold py-3 hover:bg-neutral-800">
                              CRIAR TIME
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setIsCreatingTeam(true)}
                          className="mt-auto w-full border-2 border-black border-dashed py-10 flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-solid transition-all text-gray-500 hover:text-black font-bold uppercase tracking-widest"
                        >
                          <Plus size={32} />
                          Cadastrar Nova Atlética
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
