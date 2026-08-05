import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChampionshipSettingsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [champ, setChamp] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    fetchChampionship();
  }, [id]);

  const fetchChampionship = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any>(`/championships/${id}`);
      setChamp(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        startDate: data.startDate?.split('T')[0] || '',
        endDate: data.endDate?.split('T')[0] || '',
        status: data.status || 'DRAFT'
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // First update generic details
      await apiClient.patch(`/championships/${id}`, {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate
      });

      // Then update status if changed
      if (formData.status !== champ.status) {
        await apiClient.patch(`/championships/${id}/status`, { status: formData.status });
      }

      toast.success('Configurações salvas com sucesso!');
      fetchChampionship();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!champ) return <div className="p-10 text-center text-slate-500">Campeonato não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-heading font-bold text-slate-800 border-b border-slate-100 pb-4">Configurações Gerais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Nome do Campeonato</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" required />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Descrição</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" required />
          </div>
          
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Data de Início</label>
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" required />
          </div>
          
          <div>
            <label className="block text-xs uppercase font-bold text-slate-500 mb-2">Data de Término</label>
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" required />
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-lg font-heading font-bold text-slate-800 mb-4">Status do Campeonato</h3>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 font-bold text-slate-700 outline-none focus:border-blue-500">
              <option value="DRAFT">Rascunho (Invisível para o público)</option>
              <option value="PUBLISHED">Publicado (Visível, inscrições fechadas)</option>
              <option value="OPEN">Inscrições Abertas</option>
              <option value="CLOSED">Inscrições Encerradas</option>
              <option value="GENERATING_BRACKET">Gerando Chaves</option>
              <option value="ONGOING">Em Andamento (Partidas ocorrendo)</option>
              <option value="FINISHED">Finalizado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
            <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
              <AlertTriangle size={14} /> Alterar o status afeta a visibilidade e as permissões de inscrição.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
