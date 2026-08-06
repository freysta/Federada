import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Loader2, Plus, Edit, Trash2, Search, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminEvents() {
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
      const data = await apiClient.get<any[]>('/cms/events');
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
      if (editingId) {
        await apiClient.put(`/cms/events/${editingId}`, formData);
      } else {
        await apiClient.post('/cms/events', formData);
      }

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
      await apiClient.delete(`/cms/events/${id}`);
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

  const filteredEvents = events.filter((e: any) => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="space-y-6 font-sans">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-600" size={28} /> Roadmap & Eventos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os eventos e o roadmap público da plataforma.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Plus size={18} /> Novo Evento
        </button>
      </div>

      {/* Standard Card & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>
          <div className="text-xs font-mono font-bold text-slate-500">
            Total: {filteredEvents.length} eventos
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">DATA</th>
                <th className="px-6 py-4">TÍTULO / DESCRIÇÃO</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-medium">Nenhum evento encontrado.</td>
                </tr>
              ) : (
                paginatedEvents.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{e.date}</div>
                      <div className="font-mono text-[10px] text-slate-500">{e.version}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 leading-tight">{e.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{e.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        e.status === 'CONFIRMADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(e)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center" title="Excluir">
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
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h2 className="font-black text-lg uppercase tracking-wide">{editingId ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
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
              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-colors shadow-md">Salvar Evento</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
