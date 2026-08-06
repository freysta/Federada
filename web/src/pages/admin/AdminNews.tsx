import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Loader2, Plus, Edit, Trash2, Search, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminNews() {
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
      const data = await apiClient.get<any[]>('/cms/news');
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
    try {
      const data = await apiClient.post<any>('/upload', formData);
      return data.url;
    } catch (err) {
      throw new Error('Falha no upload');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingId ? news.find(n => n.id === editingId)?.imageUrl : '';
      if (selectedFile) imageUrl = await uploadImage(selectedFile);

      const payload = { ...formData, imageUrl };
      
      if (editingId) {
        await apiClient.put(`/cms/news/${editingId}`, payload);
      } else {
        await apiClient.post('/cms/news', payload);
      }

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
      await apiClient.delete(`/cms/news/${id}`);
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
    <div className="space-y-6 font-sans">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={28} /> Fórum & Notícias
          </h1>
          <p className="text-slate-500 text-sm mt-1">Publique notícias, comunicados e atualizações da plataforma.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Plus size={18} /> Nova Postagem
        </button>
      </div>

      {/* Standard Card & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar notícias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>
          <div className="text-xs font-mono font-bold text-slate-500">
            Total: {filteredNews.length} postagens
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">DATA</th>
                <th className="px-6 py-4">TÍTULO / PREVIEW</th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedNews.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-slate-500 font-medium">Nenhuma notícia encontrada.</td>
                </tr>
              ) : (
                paginatedNews.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div className="font-mono text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 leading-tight">{n.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-md">{n.content}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(n)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h2 className="font-black text-lg uppercase tracking-wide">{editingId ? 'Editar Postagem' : 'Nova Postagem'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Título</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Data e Hora de Publicação</label>
                    <input required type="datetime-local" value={formData.dateLabel} onChange={e => setFormData({...formData, dateLabel: e.target.value})} className="block w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-600 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Imagem da Capa</label>
                    <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="block w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-600 transition-all bg-white text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Conteúdo</label>
                    <textarea required rows={8} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="block w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-mono text-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-colors shadow-md">Salvar Postagem</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
