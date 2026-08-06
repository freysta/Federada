import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { Loader2, Save, AlertTriangle, Upload, CheckCircle2, Play, Archive, Lock, Unlock, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../../config';

export default function AdminChampionshipSettingsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [champ, setChamp] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    organizer: '',
    audienceFocus: 'GENERAL'
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
        status: data.status || 'DRAFT',
        organizer: data.organizer || '',
        audienceFocus: data.audienceFocus || 'GENERAL'
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
      await apiClient.patch(`/championships/${id}`, {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        organizer: formData.organizer,
        audienceFocus: formData.audienceFocus
      });
      toast.success('Configurações salvas com sucesso!');
      fetchChampionship();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingBanner(true);
    const toastId = toast.loading('Enviando banner...');
    try {
      await apiClient.post(`/championships/${id}/banner`, formData);
      toast.success('Banner atualizado com sucesso!', { id: toastId });
      fetchChampionship();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar banner', { id: toastId });
    } finally {
      setUploadingBanner(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!window.confirm(`Tem certeza que deseja mudar o status para ${newStatus}?`)) return;
    
    const toastId = toast.loading('Alterando status...');
    try {
      await apiClient.patch(`/championships/${id}/status`, { status: newStatus });
      toast.success('Status alterado com sucesso!', { id: toastId });
      fetchChampionship();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao mudar status', { id: toastId });
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!champ) return <div className="p-10 text-center text-slate-500">Campeonato não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Banner Upload Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-4 w-full mb-6 flex items-center gap-2">
          <Upload className="text-blue-600" size={16} /> Capa / Banner do Campeonato
        </h2>
        
        <div className="w-full relative h-48 md:h-64 bg-slate-50 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center group">
          {champ.bannerUrl ? (
            <img src={`${API_URL}${champ.bannerUrl}`} alt="Banner" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
          ) : (
            <div className="text-slate-400 flex flex-col items-center">
              <Upload size={32} className="mb-2 text-slate-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Nenhum banner cadastrado</span>
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingBanner}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-blue-600/10"
            >
              {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Alterar Imagem
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleBannerUpload}
              accept="image/*"
              className="hidden" 
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
          <Settings2 className="text-blue-600" size={16} /> Configurações Gerais
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Nome do Campeonato</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" required />
          </div>
          
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Organizador (Opcional)</label>
            <input type="text" value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Ex: Liga, Federação" />
          </div>
          
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Foco do Público</label>
            <select value={formData.audienceFocus} onChange={e => setFormData({...formData, audienceFocus: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer font-medium">
              <option value="GENERAL">Geral</option>
              <option value="UNIVERSITY">Universitário</option>
              <option value="SCHOOL">Escolar</option>
              <option value="CITY">Cidades</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Descrição</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" required />
          </div>
          
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Data de Início</label>
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" required />
          </div>
          
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Data de Término</label>
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" required />
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4">Ciclo de Vida do Evento</h3>
          
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex items-center">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-3">Status Atual:</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                champ.status === 'PUBLISHED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                champ.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                champ.status === 'ONGOING' ? 'bg-amber-50 text-amber-700 border-amber-250' :
                champ.status === 'FINISHED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>{champ.status}</span>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {champ.status === 'DRAFT' && (
                <button type="button" onClick={() => handleStatusChange('PUBLISHED')} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-200 transition-all active:scale-95 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Publicar Campeonato
                </button>
              )}
              {champ.status === 'PUBLISHED' && (
                <>
                  <button type="button" onClick={() => handleStatusChange('OPEN')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-250 transition-all active:scale-95 flex items-center gap-1.5">
                    <Unlock size={14} /> Abrir Inscrições
                  </button>
                  <button type="button" onClick={() => handleStatusChange('DRAFT')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-300 transition-all active:scale-95">
                    Voltar para Rascunho
                  </button>
                </>
              )}
              {champ.status === 'OPEN' && (
                <button type="button" onClick={() => handleStatusChange('CLOSED')} className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-rose-200 transition-all active:scale-95 flex items-center gap-1.5">
                  <Lock size={14} /> Encerrar Inscrições
                </button>
              )}
              {champ.status === 'CLOSED' && (
                <>
                  <button type="button" onClick={() => handleStatusChange('OPEN')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-250 transition-all active:scale-95 flex items-center gap-1.5">
                    <Unlock size={14} /> Reabrir Inscrições
                  </button>
                  <button type="button" onClick={() => handleStatusChange('GENERATING_BRACKET')} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-200 transition-all active:scale-95 flex items-center gap-1.5">
                    <Settings2 size={14} /> Gerar Chaves
                  </button>
                </>
              )}
              {champ.status === 'GENERATING_BRACKET' && (
                <>
                  <button type="button" onClick={() => handleStatusChange('ONGOING')} className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-amber-250 transition-all active:scale-95 flex items-center gap-1.5">
                    <Play size={14} /> Iniciar Competição
                  </button>
                  <button type="button" onClick={() => handleStatusChange('CLOSED')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-300 transition-all active:scale-95">
                    Reverter para Fechado
                  </button>
                </>
              )}
              {champ.status === 'ONGOING' && (
                <button type="button" onClick={() => handleStatusChange('FINISHED')} className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-purple-250 transition-all active:scale-95 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Finalizar Campeonato
                </button>
              )}
              {champ.status === 'FINISHED' && (
                <button type="button" onClick={() => handleStatusChange('ARCHIVED')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-300 transition-all active:scale-95 flex items-center gap-1.5">
                  <Archive size={14} /> Arquivar
                </button>
              )}
            </div>
            
            <p className="text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-200 pt-4">
              <AlertTriangle size={14} className="text-amber-500" /> Somente ações válidas para o status atual estão disponíveis.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-blue-600/10 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
