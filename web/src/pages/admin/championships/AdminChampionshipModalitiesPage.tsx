import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import toast from 'react-hot-toast';
import { Loader2, Plus, Edit2, Trash2, Save, X, Activity } from 'lucide-react';

export default function AdminChampionshipModalitiesPage() {
  const { champ } = useOutletContext<{ champ: any }>();
  
  const [modalities, setModalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultModality = { name: '', type: 'INDIVIDUAL', price: 0, minAthletes: 1, maxAthletes: 99, minAge: 0, maxAge: 99, gender: 'MISTO', maxSpots: 10 };
  const [formData, setFormData] = useState<any>(defaultModality);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (champ?.modalities) {
      setModalities(champ.modalities);
    }
  }, [champ]);

  const fetchModalities = async () => {
    try {
      const data = await apiClient.get<any>(`/championships/${champ.id}`);
      setModalities(data.modalities || []);
    } catch (err) {
      toast.error('Erro ao atualizar modalidades');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(`/championships/${champ.id}/modalities`, formData);
      toast.success('Modalidade adicionada com sucesso!');
      setIsAdding(false);
      setFormData(defaultModality);
      fetchModalities();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar modalidade');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent, modId: string) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.patch(`/championships/${champ.id}/modalities/${modId}`, formData);
      toast.success('Modalidade atualizada com sucesso!');
      setEditingId(null);
      setFormData(defaultModality);
      fetchModalities();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar modalidade');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta modalidade? Esta ação não pode ser desfeita e falhará se houver inscrições ativas.')) return;
    
    try {
      await apiClient.delete(`/championships/${champ.id}/modalities/${modId}`);
      toast.success('Modalidade removida!');
      fetchModalities();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover modalidade. Verifique se há inscrições.');
    }
  };

  const startEdit = (mod: any) => {
    setEditingId(mod.id);
    setIsAdding(false);
    setFormData({
      name: mod.name,
      type: mod.type,
      gender: mod.gender,
      price: mod.price,
      maxSpots: mod.maxSpots || 0,
      minAthletes: mod.minAthletes || 1,
      maxAthletes: mod.maxAthletes || 99,
      minAge: mod.minAge || 0,
      maxAge: mod.maxAge || 99,
    });
  };

  const cancelForm = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData(defaultModality);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Activity className="text-blue-600" size={22} /> Gerenciar Modalidades
          </h2>
          <p className="text-slate-500 text-sm mt-1">Adicione, edite ou remova as categorias do seu evento.</p>
        </div>
        
        {!isAdding && !editingId && (
          <button 
            onClick={() => { setIsAdding(true); setFormData(defaultModality); }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Nova Modalidade
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={(e) => editingId ? handleEdit(e, editingId) : handleAdd(e)} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
              {isAdding ? 'Criar Nova Modalidade' : 'Editar Modalidade'}
            </h3>
            <button type="button" onClick={cancelForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Nome</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Ex: Futsal Masculino Série A" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Tipo</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer font-medium">
                <option value="INDIVIDUAL">Individual</option>
                <option value="COLETIVO">Coletivo (Equipe)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Gênero</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer font-medium">
                <option value="MISTO">Misto</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Preço (R$)</label>
              <input type="number" step="0.01" min="0" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Mín. Atletas</label>
              <input type="number" min="1" required value={formData.minAthletes} onChange={e => setFormData({...formData, minAthletes: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Máx. Atletas</label>
              <input type="number" min="1" required value={formData.maxAthletes} onChange={e => setFormData({...formData, maxAthletes: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Idade Mín.</label>
              <input type="number" min="0" required value={formData.minAge} onChange={e => setFormData({...formData, minAge: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Idade Máx.</label>
              <input type="number" min="0" required value={formData.maxAge} onChange={e => setFormData({...formData, maxAge: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Vagas Máx. (Equipes/Atletas)</label>
              <input type="number" min="0" required value={formData.maxSpots} onChange={e => setFormData({...formData, maxSpots: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="0 = Ilimitado" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={cancelForm} className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-300 text-sm hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
              {isAdding ? 'Salvar Modalidade' : 'Atualizar Modalidade'}
            </button>
          </div>
        </form>
      )}

      {modalities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Activity size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nenhuma modalidade encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modalities.map((mod) => (
            <div key={mod.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-extrabold text-base text-slate-900 pr-12 leading-tight">{mod.name}</h3>
                  <div className="flex gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(mod)} className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(mod.id)} className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Tipo</span>
                    <span className="font-bold text-slate-700">{mod.type === 'COLETIVO' ? 'Equipe' : 'Individual'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Gênero</span>
                    <span className="font-bold text-slate-700 capitalize">{mod.gender?.toLowerCase() || 'Misto'}</span>
                  </div>
                  {mod.maxSpots > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Vagas Totais</span>
                      <span className="font-bold text-slate-700">{mod.maxSpots}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Inscrição</span>
                <span className={`font-black text-base ${Number(mod.price) === 0 ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100' : 'text-blue-600'}`}>
                  {Number(mod.price) === 0 ? 'GRÁTIS' : `R$ ${Number(mod.price).toFixed(2)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
