import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminTeam() {
  const { token } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    instagramUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cms/team`);
      if (!res.ok) throw new Error('Falha ao carregar equipe');
      const data = await res.json();
      setTeam(data);
    } catch (err) {
      toast.error('Erro ao carregar diretoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload`, { 
      method: 'POST', 
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Falha no upload');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingId ? team.find(t => t.id === editingId)?.imageUrl : '';
      if (selectedFile) imageUrl = await uploadImage(selectedFile);

      const payload = { ...formData, imageUrl };
      const url = editingId ? `${API_URL}/cms/team/${editingId}` : `${API_URL}/cms/team`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      toast.success('Salvo com sucesso!');
      setIsModalOpen(false);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este diretor?')) return;
    try {
      const res = await fetch(`${API_URL}/cms/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      toast.success('Excluído');
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openModal = (member?: any) => {
    if (member) {
      setFormData({ name: member.name, role: member.role, instagramUrl: member.instagramUrl || '' });
      setEditingId(member.id);
    } else {
      setFormData({ name: '', role: '', instagramUrl: '' });
      setEditingId(null);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const filteredTeam = team.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);
  const paginatedTeam = filteredTeam.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-black" size={32} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-mono">DIRETORIA (CMS)</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> NOVO DIRETOR
        </button>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar diretores..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">MEMBRO</th>
                <th className="px-4 py-3">CARGO</th>
                <th className="px-4 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {paginatedTeam.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 text-sm">Nenhum membro encontrado.</td>
              </tr>
              ) : (
                paginatedTeam.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openModal(t)}>
                <td className="px-4 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 overflow-hidden rounded-full shrink-0">
                    {t.imageUrl && <img src={t.imageUrl.startsWith('http') ? t.imageUrl : `${API_URL}${t.imageUrl}`} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="font-bold text-gray-800 leading-tight">{t.name}</div>
                </td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{t.role}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={(e) => { e.stopPropagation(); openModal(t); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mr-1 transition-colors"><Edit size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTeam.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
      />
    </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h2 className="text-2xl font-bold font-mono text-gray-800 mb-6 border-b pb-3">{editingId ? 'Editar Diretor' : 'Novo Diretor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white">
                    <option value="" disabled>Selecione um Cargo</option>
                    <option value="Presidente">Presidente</option>
                    <option value="Vice-Presidente">Vice-Presidente</option>
                    <option value="Diretor(a) Financeiro">Diretor(a) Financeiro</option>
                    <option value="Diretor(a) de Esportes">Diretor(a) de Esportes</option>
                    <option value="Diretor(a) de Marketing">Diretor(a) de Marketing</option>
                    <option value="Diretor(a) de Eventos">Diretor(a) de Eventos</option>
                    <option value="Secretário(a)">Secretário(a)</option>
                    <option value="Assessor(a)">Assessor(a)</option>
                    <option value="Conselheiro(a)">Conselheiro(a)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input type="text" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Diretor</label>
                  <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md">Salvar Diretor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
