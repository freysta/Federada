import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';
import Navbar from '../../components/Navbar';

export default function TeamPage() {
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
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Diretoria</h1>
              <p className="text-sm text-gray-500 mt-1">Gerencie os membros da equipe que aparecem no site principal.</p>
            </div>
            <button 
              onClick={() => { setEditingId(null); setFormData({ name: '', role: '', instagramUrl: '' }); setSelectedFile(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} /> Novo Diretor
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
              <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-4 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 overflow-hidden rounded-full shrink-0">
                    {t.imageUrl && <img src={t.imageUrl.startsWith('http') ? t.imageUrl : `${API_URL}${t.imageUrl}`} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="font-bold text-gray-800 leading-tight">{t.name}</div>
                </td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-600">{t.role}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(t.id); setFormData({ name: t.name, role: t.role, instagramUrl: t.instagramUrl || '' }); setIsModalOpen(true); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mr-1 transition-colors"><Edit size={16} /></button>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-md rounded-2xl p-6">
                <h3 className="font-bold text-xl mb-4">{editingId ? 'Editar Diretor' : 'Novo Diretor'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Cargo</label>
                    <input type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border p-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Instagram URL (opcional)</label>
                    <input type="url" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="w-full border p-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Foto (opcional)</label>
                    <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded-lg" />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Salvar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
