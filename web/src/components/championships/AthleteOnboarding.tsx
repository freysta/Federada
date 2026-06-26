import { useState } from 'react';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Users, Trophy, Plus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface AthleteOnboardingProps {
  onSuccess: () => void;
}

export default function AthleteOnboarding({ onSuccess }: AthleteOnboardingProps) {
  const { token } = useAuth();
  
  // Athlete Form
  const [inviteCode, setInviteCode] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [gender, setGender] = useState('MASCULINO');
  const [isJoining, setIsJoining] = useState(false);
  
  // President Form
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamUniversity, setNewTeamUniversity] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    const toastId = toast.loading('Entrando na equipe...');
    try {
      const res = await fetch(`${API_URL}/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode, cpf, birthDate, course, period, gender })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao entrar na Atlética. Verifique os dados.');
      
      toast.success('Bem-vindo à equipe!', { id: toastId });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
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
      onSuccess();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 flex justify-center items-center pointer-events-none">
          <Shield size={200} />
        </div>
        <div className="relative z-10 text-white">
          <h2 className="text-3xl font-extrabold mb-2">Vincule-se a uma Equipe</h2>
          <p className="text-blue-100 max-w-lg mx-auto">
            Para competir nos campeonatos e gerenciar suas inscrições, você precisa fazer parte de uma atlética oficial.
          </p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form de Atleta */}
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users size={80} />
          </div>
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-800">
            <Users size={24} className="text-blue-600" /> Sou um Atleta
          </h3>
          <p className="text-sm text-slate-500 mb-6">Recebeu o código de convite do presidente da sua atlética? Insira abaixo para entrar no plantel.</p>
          
          <form onSubmit={handleJoinTeam} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">CÓDIGO DA EQUIPE</label>
              <input 
                required type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                placeholder="Ex: FEDE-1234"
                className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-mono uppercase" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">CPF</label>
              <input 
                required type="text" value={cpf} onChange={e => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-mono" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">NASCIMENTO</label>
                <input 
                  required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">GÊNERO</label>
                <select 
                  required value={gender} onChange={e => setGender(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">CURSO (Opcional)</label>
                <input 
                  type="text" value={course} onChange={e => setCourse(e.target.value)}
                  placeholder="Ex: Direito"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">PERÍODO (Opcional)</label>
                <input 
                  type="text" value={period} onChange={e => setPeriod(e.target.value)}
                  placeholder="Ex: 4º Sem"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                />
              </div>
            </div>
            <button disabled={isJoining} type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all mt-4 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
              {isJoining ? <Loader2 className="animate-spin" size={20} /> : null}
              Entrar na Equipe
            </button>
          </form>
        </div>

        {/* Form de Presidente */}
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={80} />
          </div>
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-800">
            <Trophy size={24} className="text-yellow-500" /> Sou o Presidente
          </h3>
          
          {!isCreatingTeam ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
              <p className="text-slate-600 mb-8 max-w-sm">
                Sua atlética ainda não está na plataforma? Crie a delegação agora, receba o código de convite e traga seus atletas.
              </p>
              <button 
                onClick={() => setIsCreatingTeam(true)}
                className="w-full sm:w-auto border-2 border-dashed border-slate-300 text-slate-600 font-bold px-10 py-8 rounded-2xl hover:bg-white hover:border-slate-400 hover:text-slate-800 hover:shadow-md transition-all flex flex-col items-center gap-3"
              >
                <div className="bg-slate-100 p-3 rounded-full">
                  <Plus size={32} />
                </div>
                Registrar Nova Atlética
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-5 flex-1 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">NOME DA ATLÉTICA</label>
                <input 
                  required type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                  placeholder="Ex: A.A.A. Exemplo"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-bold text-lg" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">UNIVERSIDADE / INSTITUIÇÃO</label>
                <input 
                  required type="text" value={newTeamUniversity} onChange={e => setNewTeamUniversity(e.target.value)}
                  placeholder="Ex: IFRO - Campus Cacoal"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" 
                />
              </div>
              
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 text-sm mt-6">
                <strong>Atenção:</strong> Ao criar a atlética, você se tornará o <strong>Presidente</strong> e será o único responsável por inscrever a equipe em modalidades coletivas.
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsCreatingTeam(false)} className="flex-1 text-slate-600 font-bold hover:bg-slate-200 rounded-xl py-3 transition-colors">
                  Cancelar
                </button>
                <button disabled={isCreating} type="submit" className="flex-[2] bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                  {isCreating ? <Loader2 className="animate-spin" size={20} /> : null}
                  Confirmar Criação
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
