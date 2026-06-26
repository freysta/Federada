import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminNews() {
  const { token } = useAuth();
  const [news, setNews] = useState<any[]>([]);
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
      if (Array.isArray(data)) setNews(data);
      else setNews([]);
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

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-mono">FÓRUM / NOTÍCIAS (CMS)</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> NOVA POSTAGEM
        </button>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar notícias..." 
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
                <th className="px-4 py-3">DATA</th>
                <th className="px-4 py-3">TÍTULO / PREVIEW</th>
                <th className="px-4 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {paginatedNews.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">Nenhuma notícia encontrada.</td>
              </tr>
            ) : (
              paginatedNews.map(n => (
              <tr key={n.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openModal(n)}>
                <td className="px-4 py-2">
                  <div className="font-bold text-gray-800">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</div>
                  <div className="font-mono text-[10px] text-gray-500">{new Date(n.createdAt).toLocaleTimeString('pt-BR')}</div>
                </td>
                <td className="px-4 py-2">
                  <div className="font-bold text-gray-800 leading-tight">{n.title}</div>
                  <div className="text-[11px] text-gray-500 truncate max-w-md">{n.content}</div>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={(e) => { e.stopPropagation(); openModal(n); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mr-1 transition-colors"><Edit size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredNews.length}
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
          <div className="bg-white w-full max-w-3xl p-6 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <h2 className="text-2xl font-bold font-mono text-gray-800 mb-6 border-b pb-3">{editingId ? 'Editar Postagem' : 'Nova Postagem'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora de Publicação</label>
                  <input required type="datetime-local" value={formData.dateLabel} onChange={e => setFormData({...formData, dateLabel: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem da Capa</label>
                  <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                  <textarea required rows={8} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white font-mono text-sm" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md">Salvar Postagem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
