import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTeam() {
  const { token } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-mono">DIRETORIA (CMS)</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> NOVO DIRETOR
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">MEMBRO</th>
              <th className="p-3">CARGO</th>
              <th className="p-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {team.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 overflow-hidden rounded-full">
                    {t.imageUrl && <img src={t.imageUrl.startsWith('http') ? t.imageUrl : `${API_URL}${t.imageUrl}`} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="font-bold">{t.name}</div>
                </td>
                <td className="p-3 font-mono">{t.role}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openModal(t)} className="p-2 bg-gray-100 hover:bg-gray-200 mr-2"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6">
            <h2 className="text-xl font-bold font-mono mb-4">{editingId ? 'Editar Diretor' : 'Novo Diretor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cargo</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="mt-1 block w-full border p-2 bg-white">
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
                <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                <input type="text" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="mt-1 block w-full border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Foto</label>
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="mt-1 block w-full" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-black text-white">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
