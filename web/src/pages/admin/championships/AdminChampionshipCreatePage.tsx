import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChampionshipCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [champId, setChampId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    organizer: '',
    audienceFocus: 'GENERAL'
  });

  const [settings, setSettings] = useState({
    requireRg: false,
    requireEnrollment: false,
    customDocuments: '',
    locations: ''
  });

  const [modalities, setModalities] = useState<any[]>([]);
  const [modalityData, setModalityData] = useState({
    name: '', type: 'INDIVIDUAL', price: 0, minAthletes: 1, maxAthletes: 99, minAge: 0, maxAge: 99, gender: 'MISTO', maxSpots: 10
  });

  const handleCreateDraft = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.post<any>('/championships', formData);
      setChampId(data.id);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!champId) return;
    setLoading(true);
    try {
      const data = await apiClient.post<any>(`/championships/${champId}/modalities`, modalityData);
      setModalities([...modalities, data]);
      setModalityData({ name: '', type: 'INDIVIDUAL', price: 0, minAthletes: 1, maxAthletes: 99, minAge: 0, maxAge: 99, gender: 'MISTO', maxSpots: 10 });
      toast.success('Modalidade adicionada!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettingsAndPublish = async () => {
    if (modalities.length === 0) {
      toast.error('Adicione pelo menos uma modalidade antes de publicar.');
      return;
    }
    setLoading(true);
    try {
      // 1. Salvar Configurações
      const settingsPayload = {
        settings: {
          ...settings,
          customDocuments: settings.customDocuments.split(',').map(s => s.trim()).filter(s => s),
          locations: settings.locations.split(',').map(s => s.trim()).filter(s => s)
        }
      };
      await apiClient.patch(`/championships/${champId}`, settingsPayload);

      // 2. Publicar (Mudar status para PUBLISHED)
      await apiClient.patch(`/championships/${champId}/status`, { status: 'PUBLISHED' });

      toast.success('Campeonato publicado com sucesso!');
      navigate('/campeonatos');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans">
      
      {/* Header Modal/Wizard Style */}
      <div className="bg-white px-8 py-6 border-b border-slate-200">
        <button onClick={() => navigate('/admin/championships')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider mb-4 transition-colors">
          <ArrowLeft size={16} /> Voltar para Campeonatos
        </button>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Criar Novo Campeonato</h1>
        <p className="text-slate-500 text-sm mt-1">Siga os passos abaixo para configurar seu evento esportivo.</p>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6 pb-20 pt-8 px-4 sm:px-6">

        {/* Stepper Header Modernized */}
        <div className="relative flex items-center justify-between mb-12">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500 ease-in-out" 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>
          
          <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${step >= 1 ? 'bg-blue-600 text-white border-blue-200 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>
              1
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Dados Básicos</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${step >= 2 ? 'bg-blue-600 text-white border-blue-200 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>
              2
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>Modalidades</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${step >= 3 ? 'bg-blue-600 text-white border-blue-200 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>
              3
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>Publicação</span>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Informações Gerais</h2>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Nome do Campeonato</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Ex: Copa Inter-Atléticas" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Organizador (Opcional)</label>
                <input type="text" value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Ex: Liga, Prefeitura" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Foco do Público</label>
                <select value={formData.audienceFocus} onChange={e => setFormData({...formData, audienceFocus: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer font-medium">
                  <option value="GENERAL">Geral</option>
                  <option value="UNIVERSITY">Universitário</option>
                  <option value="SCHOOL">Escolar</option>
                  <option value="CITY">Cidades</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Data de Início</label>
                <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Data de Término</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Descrição Curta</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Descreva brevemente o evento..."></textarea>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button onClick={handleCreateDraft} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-blue-600/20 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Salvar & Avançar'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Modalidades Esportivas</h2>
            
            <form onSubmit={handleAddModality} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">Nova Modalidade</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Nome</label>
                  <input type="text" required value={modalityData.name} onChange={e => setModalityData({...modalityData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Tipo</label>
                  <select value={modalityData.type} onChange={e => setModalityData({...modalityData, type: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer font-medium">
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COLETIVO">Coletivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Gênero</label>
                  <select value={modalityData.gender} onChange={e => setModalityData({...modalityData, gender: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer font-medium">
                    <option value="MISTO">Misto</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Preço (R$)</label>
                  <input type="number" required value={modalityData.price} onChange={e => setModalityData({...modalityData, price: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Vagas (Max)</label>
                  <input type="number" value={modalityData.maxSpots || ''} onChange={e => setModalityData({...modalityData, maxSpots: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Sem limite" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                + Adicionar Modalidade
              </button>
            </form>

            <div>
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 mb-3">Modalidades Adicionadas ({modalities.length})</h3>
              <div className="space-y-2.5">
                {modalities.map(mod => (
                  <div key={mod.id} className="p-3 border border-slate-200 rounded-xl flex justify-between items-center bg-white shadow-sm">
                    <span className="font-bold text-slate-900 text-sm">{mod.name} <span className="text-slate-500 font-medium text-xs ml-2">({mod.type === 'COLETIVO' ? 'Coletivo' : 'Individual'} • {mod.gender})</span></span>
                    <span className="font-black text-xs uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">R$ {Number(mod.price).toFixed(2)}</span>
                  </div>
                ))}
                {modalities.length === 0 && <p className="text-slate-400 text-xs font-medium italic">Nenhuma modalidade adicionada ainda.</p>}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button onClick={() => setStep(1)} className="text-slate-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <ArrowLeft size={16} /> Voltar
              </button>
              <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-600/10">
                Avançar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">Regras e Publicação</h2>
            
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={settings.requireRg} onChange={e => setSettings({...settings, requireRg: e.target.checked})} className="w-4 h-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500" />
                  <span>Exigir RG (Identidade)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={settings.requireEnrollment} onChange={e => setSettings({...settings, requireEnrollment: e.target.checked})} className="w-4 h-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500" />
                  <span>Exigir Matrícula (Comprovante Escolar)</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Documentos Adicionais (separados por vírgula)</label>
                <input type="text" value={settings.customDocuments} onChange={e => setSettings({...settings, customDocuments: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Ex: Atestado Médico, Termo de Responsabilidade" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Locais de Competição (separados por vírgula)</label>
                <input type="text" value={settings.locations} onChange={e => setSettings({...settings, locations: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white" placeholder="Ex: Ginásio Central, Quadra 2" />
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 mt-6">
              <CheckCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-blue-800 font-medium">
                Ao publicar, o campeonato ficará visível na plataforma e você poderá abrir as inscrições. Seus rascunhos podem ser editados posteriormente.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button onClick={() => setStep(2)} className="text-slate-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <ArrowLeft size={16} /> Voltar
              </button>
              <button onClick={handleSaveSettingsAndPublish} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-emerald-600/20 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} PUBLICAR CAMPEONATO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
