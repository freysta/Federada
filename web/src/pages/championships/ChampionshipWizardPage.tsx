import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, ArrowRight, ArrowLeft, Trophy, Users, Settings, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function ChampionshipWizardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [champId, setChampId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [settings, setSettings] = useState({
    requireRg: false,
    requireEnrollment: false,
    customDocuments: '',
    locations: ''
  });

  const [modalities, setModalities] = useState<any[]>([]);
  const [modalityData, setModalityData] = useState({
    name: '', type: 'INDIVIDUAL', price: 0, minAthletes: 1, maxAthletes: 99, minAge: 0, maxAge: 99, gender: 'MISTO'
  });

  const handleCreateDraft = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/championships`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Erro ao criar rascunho.');
      const data = await res.json();
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
      const res = await fetch(`${API_URL}/championships/${champId}/modalities`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modalityData)
      });
      if (!res.ok) throw new Error('Erro ao adicionar modalidade.');
      const data = await res.json();
      setModalities([...modalities, data]);
      setModalityData({ name: '', type: 'INDIVIDUAL', price: 0, minAthletes: 1, maxAthletes: 99, minAge: 0, maxAge: 99, gender: 'MISTO' });
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
      await fetch(`${API_URL}/championships/${champId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsPayload)
      });

      // 2. Publicar (Mudar status para PUBLISHED)
      const res = await fetch(`${API_URL}/championships/${champId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao publicar campeonato.');
      }

      toast.success('Campeonato publicado com sucesso!');
      navigate('/campeonatos');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-28 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-mono tracking-tight uppercase text-slate-800">Criar Campeonato</h1>
          <button onClick={() => navigate('/campeonatos')} className="text-gray-500 hover:text-black">Cancelar</button>
        </div>

      {/* Stepper Header Modernized */}
      <div className="relative flex items-center justify-between mb-12">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500 ease-in-out" 
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        ></div>
        
        <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 ${step >= 1 ? 'bg-blue-600 text-white border-blue-200' : 'bg-white text-gray-400 border-gray-200'}`}>
            1
          </div>
          <span className={`font-mono text-xs uppercase font-bold tracking-wider ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Dados Básicos</span>
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 ${step >= 2 ? 'bg-blue-600 text-white border-blue-200' : 'bg-white text-gray-400 border-gray-200'}`}>
            2
          </div>
          <span className={`font-mono text-xs uppercase font-bold tracking-wider ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Modalidades</span>
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 ${step >= 3 ? 'bg-blue-600 text-white border-blue-200' : 'bg-white text-gray-400 border-gray-200'}`}>
            3
          </div>
          <span className={`font-mono text-xs uppercase font-bold tracking-wider ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Publicação</span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-mono font-bold uppercase tracking-tight text-slate-800 border-b border-gray-100 pb-4">Informações Gerais</h2>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide font-bold text-gray-500 mb-2">Nome do Campeonato</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 font-sans border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800" placeholder="Ex: Copa Inter-Atléticas" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide font-bold text-gray-500 mb-2">Data de Início</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-50 font-sans border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800" />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide font-bold text-gray-500 mb-2">Data de Término</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-50 font-sans border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800" />
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide font-bold text-gray-500 mb-2">Descrição Curta</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 font-sans border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800" placeholder="Descreva brevemente o evento..."></textarea>
          </div>
          
          <div className="flex justify-end pt-4">
            <button onClick={handleCreateDraft} disabled={loading} className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar & Avançar'} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-mono font-bold uppercase tracking-tight text-slate-800 border-b border-gray-100 pb-4">Modalidades Esportivas</h2>
          
          <form onSubmit={handleAddModality} className="bg-slate-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-mono text-sm uppercase font-bold text-slate-800 mb-4">Nova Modalidade</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block font-mono text-[10px] uppercase tracking-wide font-bold text-gray-500 mb-1">Nome</label>
                <input type="text" required value={modalityData.name} onChange={e => setModalityData({...modalityData, name: e.target.value})} className="w-full font-sans bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide font-bold text-gray-500 mb-1">Tipo</label>
                <select value={modalityData.type} onChange={e => setModalityData({...modalityData, type: e.target.value})} className="w-full font-sans bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500">
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="COLETIVO">Coletivo</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide font-bold text-gray-500 mb-1">Gênero</label>
                <select value={modalityData.gender} onChange={e => setModalityData({...modalityData, gender: e.target.value})} className="w-full font-sans bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500">
                  <option value="MISTO">Misto</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide font-bold text-gray-500 mb-1">Preço (R$)</label>
                <input type="number" required value={modalityData.price} onChange={e => setModalityData({...modalityData, price: Number(e.target.value)})} className="w-full font-sans bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700">
              + Adicionar Modalidade
            </button>
          </form>

          <div>
            <h3 className="font-bold mb-3 text-sm">Modalidades Adicionadas ({modalities.length})</h3>
            <div className="space-y-2">
              {modalities.map(mod => (
                <div key={mod.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center bg-white">
                  <span className="font-bold">{mod.name} <span className="text-gray-500 font-normal text-sm ml-2">({mod.type} - {mod.gender})</span></span>
                  <span className="font-mono text-green-700 bg-green-50 px-2 py-1 rounded">R$ {Number(mod.price).toFixed(2)}</span>
                </div>
              ))}
              {modalities.length === 0 && <p className="text-gray-400 text-sm">Nenhuma modalidade adicionada ainda.</p>}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button onClick={() => setStep(1)} className="text-gray-600 font-bold flex items-center gap-2 hover:text-black">
              <ArrowLeft size={20} /> Voltar
            </button>
            <button onClick={() => setStep(3)} className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800">
              Avançar <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-mono font-bold uppercase tracking-tight text-slate-800 border-b border-gray-100 pb-4">Regras e Publicação</h2>
          
          <div className="space-y-6">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.requireRg} onChange={e => setSettings({...settings, requireRg: e.target.checked})} className="w-5 h-5" />
                <span className="font-medium">Exigir RG (Identidade)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.requireEnrollment} onChange={e => setSettings({...settings, requireEnrollment: e.target.checked})} className="w-5 h-5" />
                <span className="font-medium">Exigir Matrícula (Comprovante Escolar)</span>
              </label>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide font-bold text-gray-500 mb-2">Documentos Adicionais (separados por vírgula)</label>
              <input type="text" value={settings.customDocuments} onChange={e => setSettings({...settings, customDocuments: e.target.value})} className="w-full bg-slate-50 font-sans border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800" placeholder="Ex: Atestado Médico, Termo de Responsabilidade" />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide font-bold text-gray-500 mb-2">Locais de Competição (separados por vírgula)</label>
              <input type="text" value={settings.locations} onChange={e => setSettings({...settings, locations: e.target.value})} className="w-full bg-slate-50 font-sans border border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800" placeholder="Ex: Ginásio Central, Quadra 2" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 mt-6">
            <CheckCircle className="text-blue-600 shrink-0" />
            <p className="text-sm text-blue-900">
              Ao publicar, o campeonato ficará visível na plataforma e você poderá abrir as inscrições. Seus rascunhos podem ser editados posteriormente.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button onClick={() => setStep(2)} className="text-gray-600 font-bold flex items-center gap-2 hover:text-black">
              <ArrowLeft size={20} /> Voltar
            </button>
            <button onClick={handleSaveSettingsAndPublish} disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />} PUBLICAR CAMPEONATO
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
