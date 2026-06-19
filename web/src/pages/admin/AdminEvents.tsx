import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-black" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-mono">ROADMAP / EVENTOS (CMS)</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
          <Plus size={16} /> NOVO EVENTO
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">VERSÃO</th>
              <th className="p-3">DATA</th>
              <th className="p-3">TÍTULO</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-gray-500">{e.version}</td>
                <td className="p-3 font-bold">{e.date}</td>
                <td className="p-3">
                  <div className="font-bold">{e.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{e.description}</div>
                </td>
                <td className="p-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${e.status === 'CONFIRMADO' ? 'bg-black text-white' : 'border border-gray-300 text-gray-500'}`}>
                    {e.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openModal(e)} className="p-2 bg-gray-100 hover:bg-gray-200 mr-2"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(e.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold font-mono mb-4">{editingId ? 'Editar Evento' : 'Novo Evento'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Versão (Ex: 2026.1)</label>
                  <input required type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="mt-1 block w-full border p-2 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data (Ex: MARÇO)</label>
                  <input required type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border p-2 uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Título do Evento</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full border p-2 uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border p-2 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 block w-full border p-2">
                  <option value="CONFIRMADO">CONFIRMADO</option>
                  <option value="EM BREVE">EM BREVE</option>
                  <option value="CANCELADO">CANCELADO</option>
                  <option value="ADIADO">ADIADO</option>
                </select>
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
