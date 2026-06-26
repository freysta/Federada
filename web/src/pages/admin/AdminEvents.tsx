import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
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
    version: '',
    date: '',
    title: '',
    description: '',
    status: 'CONFIRMADO',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cms/events`);
      if (!res.ok) throw new Error('Falha ao carregar eventos');
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
      else setEvents([]);
    } catch (err) {
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/cms/events/${editingId}` : `${API_URL}/cms/events`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      toast.success('Salvo com sucesso!');
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este evento?')) return;
    try {
      const res = await fetch(`${API_URL}/cms/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      toast.success('Excluído');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({ version: item.version, date: item.date, title: item.title, description: item.description, status: item.status });
      setEditingId(item.id);
    } else {
      setFormData({ version: '2026.', date: '', title: '', description: '', status: 'CONFIRMADO' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-mono">ROADMAP / EVENTOS (CMS)</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> NOVO EVENTO
        </button>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar eventos..." 
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
                <th className="px-4 py-3">TÍTULO / DESCRIÇÃO</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">Nenhum evento encontrado.</td>
              </tr>
              ) : (
                paginatedEvents.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openModal(e)}>
                <td className="px-4 py-2">
                  <div className="font-bold text-gray-800">{e.date}</div>
                  <div className="font-mono text-[10px] text-gray-500">{e.version}</div>
                </td>
                <td className="px-4 py-2">
                  <div className="font-bold text-gray-800 leading-tight">{e.title}</div>
                  <div className="text-[11px] text-gray-500 truncate max-w-xs">{e.description}</div>
                </td>
                <td className="px-4 py-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${e.status === 'CONFIRMADO' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={(ev) => { ev.stopPropagation(); openModal(e); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mr-1 transition-colors"><Edit size={16} /></button>
                  <button onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredEvents.length}
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
            <h2 className="text-2xl font-bold font-mono text-gray-800 mb-6 border-b pb-3">{editingId ? 'Editar Evento' : 'Novo Evento'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Versão (Ex: 2026.1)</label>
                  <input required type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data (Ex: MARÇO)</label>
                  <input required type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all uppercase" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all uppercase" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
                  <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white">
                    <option value="CONFIRMADO">CONFIRMADO</option>
                    <option value="EM BREVE">EM BREVE</option>
                    <option value="CANCELADO">CANCELADO</option>
                    <option value="ADIADO">ADIADO</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md">Salvar Evento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
