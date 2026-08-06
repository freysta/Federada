import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, Loader2, MapPin, Users, AlertCircle } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

export default function TeamsDirectoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [teams, setTeams] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  
  // Form state
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
    if (user) {
      apiClient.get<any>('/teams/my/profile')
        .then(data => setMyProfile(data || null))
        .catch(() => setMyProfile(null));
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      // Endpoint is GET /teams (returns all teams)
      const data = await apiClient.get<any[]>('/teams');
      setTeams(data);
    } catch (err: any) {
      toast.error('Erro ao carregar atléticas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (team: any) => {
    if (!user) {
      toast.error('Você precisa fazer login para solicitar vínculo.');
      navigate('/login');
      return;
    }
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !birthDate || !gender) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    
    setSubmitting(true);
    try {
      await apiClient.post(`/teams/${selectedTeam.id}/request-join`, {
        cpf,
        birthDate,
        gender,
        course,
        period
      });
      toast.success('Solicitação enviada com sucesso! Aguarde a aprovação do presidente.');
      setIsModalOpen(false);
      apiClient.get<any>('/teams/my/profile').then(data => setMyProfile(data || null));
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.university && t.university.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [teams, searchTerm]);

  const hasActiveOrPendingTeam = !!myProfile?.team;
  const myTeamId = myProfile?.team?.id;
  const myJoinStatus = myProfile?.teamJoinStatus;

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">Catálogo de Equipes</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Encontre a sua atlética ou equipe, solicite vínculo e prepare-se para as competições.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou universidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm text-lg"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-600" size={48} /></div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Shield size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-slate-700">Nenhuma atlética encontrada</h3>
            <p className="text-slate-500 mt-2">Tente buscar com outros termos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => {
              const isThisMyTeam = myTeamId === team.id;

              return (
                <div key={team.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                        {team.logoUrl ? (
                          <img src={`${API_URL}${team.logoUrl}`} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield size={28} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">{team.name}</h3>
                        {team.university && <p className="text-sm text-slate-500 mt-1">{team.university}</p>}
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {team.city && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <MapPin size={14} className="text-orange-500" /> {team.city}{team.state ? ` - ${team.state}` : ''}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Users size={14} className="text-orange-500" /> {isThisMyTeam ? (myJoinStatus === 'PENDING' ? 'Solicitação Pendente' : 'Sua Equipe Atual') : 'Solicitar Vínculo'}
                      </div>
                    </div>
                  </div>
                  
                  {isThisMyTeam ? (
                    myJoinStatus === 'PENDING' ? (
                      <button disabled className="w-full py-3 bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed">
                        Solicitação Enviada
                      </button>
                    ) : (
                      <button disabled className="w-full py-3 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed">
                        Sua Equipe Atual
                      </button>
                    )
                  ) : hasActiveOrPendingTeam ? (
                    <button 
                      onClick={() => toast.error(`Você já possui solicitação ou vínculo com a equipe ${myProfile.team.name}. Cancele no seu perfil antes de pedir em outra.`)}
                      className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
                    >
                      Já possui vínculo / solicitação
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenModal(team)}
                      className="w-full py-3 bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      Pedir para Entrar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {isModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-orange-50 p-6 border-b border-orange-100 text-center">
              <h3 className="font-bold text-orange-900 text-xl mb-1">Solicitar Vínculo</h3>
              <p className="text-sm text-orange-700">Preencha seus dados para entrar na equipe <strong>{selectedTeam.name}</strong></p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">CPF <span className="text-red-500">*</span></label>
                  <input type="text" required value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data Nasc. <span className="text-red-500">*</span></label>
                  <input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Gênero <span className="text-red-500">*</span></label>
                  <select required value={gender} onChange={e => setGender(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white">
                    <option value="">Selecione...</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Curso <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <input type="text" value={course} onChange={e => setCourse(e.target.value)} placeholder="Ex: Engenharia" className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Período <span className="text-slate-400 font-normal">(Opcional)</span></label>
                  <input type="text" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Ex: 5º Semestre" className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-start gap-2 mt-4">
                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-orange-800">Sua solicitação será enviada ao presidente da atlética para aprovação.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {submitting && <Loader2 className="animate-spin" size={16} />} Enviar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
