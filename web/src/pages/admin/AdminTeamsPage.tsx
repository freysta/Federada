import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { API_URL } from '../../config';
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Loader2, 
  Building2, 
  MapPin, 
  ExternalLink,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [users, setUsers] = useState<any[]>([]);

  // Modal Create / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    cnpj: '',
    city: '',
    state: '',
    instagram: '',
    ownerId: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Roster / Members
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedTeamRoster, setSelectedTeamRoster] = useState<any>(null);
  const [rosterMembers, setRosterMembers] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any[]>('/teams/admin/all');
      setTeams(data || []);
    } catch (err: any) {
      toast.error('Erro ao carregar atléticas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get<any[]>('/users');
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await apiClient.post<any>('/upload', formData);
      return data.url;
    } catch (err) {
      throw new Error('Falha ao fazer upload da logo');
    }
  };

  const handleOpenForm = (team?: any) => {
    if (team) {
      setEditingId(team.id);
      setFormData({
        name: team.name || '',
        university: team.university || '',
        cnpj: team.cnpj || '',
        city: team.city || '',
        state: team.state || '',
        instagram: team.instagram || '',
        ownerId: team.owner?.id || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        university: '',
        cnpj: '',
        city: '',
        state: '',
        instagram: '',
        ownerId: '',
      });
    }
    setSelectedFile(null);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('O nome da atlética é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      let logoUrl = editingId ? teams.find(t => t.id === editingId)?.logoUrl : '';
      if (selectedFile) {
        logoUrl = await uploadLogo(selectedFile);
      }

      const payload = { ...formData, logoUrl };

      if (editingId) {
        await apiClient.put(`/teams/${editingId}`, payload);
        toast.success('Atlética atualizada com sucesso!');
      } else {
        await apiClient.post('/teams/admin', payload);
        toast.success('Atlética criada com sucesso!');
      }

      setIsFormModalOpen(false);
      fetchTeams();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar atlética.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a atlética "${name}"? Esta ação removerá o vínculo dos atletas.`)) return;
    try {
      await apiClient.delete(`/teams/${id}`);
      toast.success('Atlética excluída.');
      fetchTeams();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir.');
    }
  };

  const handleOpenRoster = async (team: any) => {
    setSelectedTeamRoster(team);
    setIsRosterModalOpen(true);
    setLoadingRoster(true);
    try {
      const data = await apiClient.get<any[]>(`/teams/${team.id}/members`);
      setRosterMembers(data || []);
    } catch (err) {
      toast.error('Erro ao carregar elenco.');
    } finally {
      setLoadingRoster(false);
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.university && t.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Building2 className="text-blue-600" size={28} /> Gerenciamento de Atléticas & Equipes
            </h1>
            <p className="text-slate-500 text-sm mt-1">Cadastre, edite e gerencie o elenco de todas as atléticas registradas.</p>
          </div>

          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Plus size={18} /> Nova Atlética
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome, universidade ou cidade..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              />
            </div>
            <div className="text-xs font-mono font-bold text-slate-500">
              Total: {filteredTeams.length} equipes
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center p-16"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">EQUIPE / ATLÉTICA</th>
                    <th className="px-6 py-4">UNIVERSIDADE</th>
                    <th className="px-6 py-4">LOCALIDADE</th>
                    <th className="px-6 py-4">PRESIDENTE / DONO</th>
                    <th className="px-6 py-4 text-center">ATLETAS</th>
                    <th className="px-6 py-4 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedTeams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">Nenhuma atlética encontrada.</td>
                    </tr>
                  ) : (
                    paginatedTeams.map(team => (
                      <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Name & Logo */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {team.logoUrl ? (
                                <img src={`${API_URL}${team.logoUrl}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Shield size={24} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">{team.name}</div>
                              {team.inviteCode && (
                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {team.inviteCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* University */}
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {team.university || <span className="text-slate-400 italic">Não informada</span>}
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {team.city ? (
                            <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {team.city}{team.state ? ` - ${team.state}` : ''}</span>
                          ) : (
                            <span className="text-slate-400 italic">N/D</span>
                          )}
                        </td>

                        {/* President */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-xs">{team.president?.name || 'Sem Presidente'}</div>
                          <div className="text-[10px] text-slate-400">{team.president?.email}</div>
                        </td>

                        {/* Athletes Count */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-mono font-bold text-xs">
                            <Users size={14} /> {team.athleteCount || 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleOpenRoster(team)} 
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-bold text-xs inline-flex items-center gap-1"
                            title="Ver Elenco de Atletas"
                          >
                            <Users size={16} /> Elenco
                          </button>

                          <button 
                            onClick={() => handleOpenForm(team)} 
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors inline-flex items-center"
                            title="Editar Atlética"
                          >
                            <Edit size={16} />
                          </button>

                          <button 
                            onClick={() => handleDelete(team.id, team.name)} 
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center"
                            title="Excluir Atlética"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTeams.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }}
          />
        </div>

      </div>

      {/* MODAL CRIAR / EDITAR */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h3 className="font-black text-lg uppercase tracking-wide">{editingId ? 'Editar Atlética' : 'Nova Atlética'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Nome da Atlética / Equipe <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: Atlética Engenharia UFPR" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Universidade / Instituição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Universidade Federal do Paraná" 
                  value={formData.university} 
                  onChange={e => setFormData({...formData, university: e.target.value})} 
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Presidente / Dono da Equipe</label>
                <select
                  value={formData.ownerId}
                  onChange={e => setFormData({...formData, ownerId: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-blue-600 bg-white"
                >
                  <option value="">Selecione um usuário...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  O usuário selecionado se tornará o Presidente e terá acesso para gerenciar o elenco.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Curitiba" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Estado (UF)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: PR" 
                    maxLength={2} 
                    value={formData.state} 
                    onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} 
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold outline-none focus:border-blue-600 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Logo / Escudo da Equipe</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md">
                  {submitting ? 'Salvando...' : 'Salvar Atlética'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELENCO DE ATLETAS */}
      {isRosterModalOpen && selectedTeamRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-500" size={24} />
                <div>
                  <h3 className="font-black text-lg uppercase tracking-wide">{selectedTeamRoster.name}</h3>
                  <p className="text-xs text-slate-400">Elenco cadastrado ({rosterMembers.length} atletas)</p>
                </div>
              </div>
              <button onClick={() => setIsRosterModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingRoster ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
              ) : rosterMembers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold text-sm border border-dashed border-slate-300 rounded-2xl">
                  Nenhum atleta cadastrado nesta equipe ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {rosterMembers.map(member => (
                    <div key={member.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {member.user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{member.user?.name}</div>
                          <div className="text-xs text-slate-500 font-mono">CPF: {member.cpf || 'N/D'} • {member.course || 'Sem Curso'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-slate-200 text-slate-700">
                          {member.teamRole === 'PRESIDENT' ? 'Presidente' : 'Atleta'}
                        </span>
                        {member.documentRgUrl && (
                          <a href={`${API_URL}${member.documentRgUrl}`} target="_blank" rel="noreferrer" className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1">
                            <ExternalLink size={14} /> RG
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button onClick={() => setIsRosterModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300">
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
