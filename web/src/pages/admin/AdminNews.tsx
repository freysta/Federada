import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AdminNews() {
  const { token } = useAuth();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    dateLabel: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cms/news`);
      if (!res.ok) throw new Error('Falha ao carregar noticias');
      const data = await res.json();
      setNews(data);
    } catch (err) {
      toast.error('Erro ao carregar fórum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
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
      let imageUrl = editingId ? news.find(n => n.id === editingId)?.imageUrl : '';
      if (selectedFile) imageUrl = await uploadImage(selectedFile);

      const payload = { ...formData, imageUrl };
      const url = editingId ? `${API_URL}/cms/news/${editingId}` : `${API_URL}/cms/news`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      toast.success('Salvo com sucesso!');
      setIsModalOpen(false);
      fetchNews();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta notícia?')) return;
    try {
      const res = await fetch(`${API_URL}/cms/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      toast.success('Excluído');
      fetchNews();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({ title: item.title, content: item.content, dateLabel: item.dateLabel || '' });
      setEditingId(item.id);
    } else {
      setFormData({ title: '', content: '', dateLabel: '' });
      setEditingId(null);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-mono">FÓRUM / NOTÍCIAS (CMS)</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> NOVA POSTAGEM
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">TÍTULO</th>
              <th className="p-3">DATA</th>
              <th className="p-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {news.map(n => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 overflow-hidden">
                    {n.imageUrl && <img src={n.imageUrl.startsWith('http') ? n.imageUrl : `${API_URL}${n.imageUrl}`} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <div className="font-bold">{n.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs" dangerouslySetInnerHTML={{ __html: n.content }} />
                  </div>
                </td>
                <td className="p-3 font-mono">{n.dateLabel}</td>
                <td className="p-3 text-right">
                  <button onClick={() => openModal(n)} className="p-2 bg-gray-100 hover:bg-gray-200 mr-2"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(n.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold font-mono mb-4">{editingId ? 'Editar Postagem' : 'Nova Postagem'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data e Hora de Publicação</label>
                <input required type="datetime-local" value={formData.dateLabel} onChange={e => setFormData({...formData, dateLabel: e.target.value})} className="mt-1 block w-full border p-2" />
              </div>
              <div className="mb-12">
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData({...formData, content: val})} className="bg-white h-48" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem da Capa</label>
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
