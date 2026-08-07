import { useState, useEffect } from 'react';
import { X, Loader2, UploadCloud, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../utils/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  championshipId: string;
  athleteId: string;
  athleteName: string;
  docType: 'rg' | 'enrollment';
  onSuccess: () => void;
}

export default function DelegateDocumentUploadModal({
  isOpen,
  onClose,
  championshipId,
  athleteId,
  athleteName,
  docType,
  onSuccess,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await apiClient.post<any>('/upload', formData);
      return data.url;
    } catch (err) {
      throw new Error('Falha no upload do arquivo para o servidor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Selecione um arquivo.');
      return;
    }

    setSubmitting(true);
    try {
      const fileUrl = await uploadFile(selectedFile);

      await apiClient.post(`/championships/${championshipId}/athlete-document`, {
        type: docType,
        url: fileUrl,
        athleteId: athleteId,
      });

      toast.success('Documento enviado com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar documento.');
    } finally {
      setSubmitting(false);
    }
  };

  const docTitle = docType === 'rg' ? 'RG / Documento de Identidade' : 'Comprovante de Matrícula';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Enviar Documento</h3>
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">Procuração para: {athleteName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors active:scale-95 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border-2 border-dashed border-slate-200 text-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3 text-blue-600">
              <FileText size={24} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{docTitle}</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Faça o upload do documento em PDF, JPG ou PNG (Máx 5MB).
            </p>
            
            <input
              type="file"
              id="file-upload-delegate"
              accept=".pdf,image/*"
              className="hidden"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload-delegate"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition-colors shadow-sm min-h-[44px] active:scale-95"
            >
              <UploadCloud size={18} className="text-blue-600" />
              Escolher Arquivo
            </label>

            {selectedFile && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold border border-blue-200 flex items-center justify-between">
                <span className="truncate max-w-[200px] font-mono">{selectedFile.name}</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-blue-500 hover:text-blue-800 p-1">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2 border-t border-slate-100">
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
              disabled={submitting || !selectedFile}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 active:scale-95 order-1 sm:order-2 min-h-[44px]"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
              Enviar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
