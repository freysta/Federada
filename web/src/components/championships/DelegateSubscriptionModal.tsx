import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../utils/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  championshipId: string;
  teamMembers: any[];
  modalities: any[];
  onSuccess: () => void;
}

export default function DelegateSubscriptionModal({
  isOpen,
  onClose,
  championshipId,
  teamMembers,
  modalities,
  onSuccess,
}: Props) {
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAthlete('');
      setSelectedModality('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !selectedModality) {
      toast.error('Selecione o atleta e a modalidade.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/championships/${selectedModality}/enroll`, {
        athleteId: selectedAthlete,
      });
      toast.success('Atleta inscrito com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao inscrever atleta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Inscrever Atleta</h3>
            <p className="text-xs sm:text-sm text-slate-500">Inscrição delegada pelo Presidente da Atlética</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors active:scale-95 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Selecione o Atleta do Elenco <span className="text-orange-600">*</span>
            </label>
            <select
              value={selectedAthlete}
              onChange={e => setSelectedAthlete(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 min-h-[44px] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer"
              required
            >
              <option value="">-- Escolha um atleta --</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.user?.name} (CPF: {member.cpf || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Selecione a Modalidade <span className="text-orange-600">*</span>
            </label>
            <select
              value={selectedModality}
              onChange={e => setSelectedModality(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 min-h-[44px] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer"
              required
            >
              <option value="">-- Escolha a modalidade --</option>
              {modalities.map(mod => (
                <option key={mod.id} value={mod.id}>
                  {mod.name} - {mod.gender} ({mod.category || 'Geral'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors order-2 sm:order-1 min-h-[44px]"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-70 active:scale-95 order-1 sm:order-2 min-h-[44px]"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Inscrever Atleta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
