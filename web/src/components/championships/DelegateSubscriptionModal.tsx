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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Inscrever Atleta</h3>
            <p className="text-sm text-slate-500">Inscrição delegada pelo Presidente</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Selecione o Atleta do Elenco
            </label>
            <select
              value={selectedAthlete}
              onChange={e => setSelectedAthlete(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
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
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Selecione a Modalidade
            </label>
            <select
              value={selectedModality}
              onChange={e => setSelectedModality(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
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

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-black bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20 disabled:opacity-70"
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
