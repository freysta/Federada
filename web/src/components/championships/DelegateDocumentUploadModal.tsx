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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Enviar Documento</h3>
            <p className="text-sm text-slate-500 line-clamp-1">Procuração para: {athleteName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 text-center">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3 text-blue-500">
              <FileText size={24} />
            </div>
            <h4 className="font-bold text-slate-900">{docTitle}</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Faça o upload do documento em PDF, JPG ou PNG (Máx 5MB).
            </p>
            
            <input
              type="file"
              id="file-upload"
              accept=".pdf,image/*"
              className="hidden"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-colors shadow-sm"
            >
              <UploadCloud size={18} />
              Escolher Arquivo
            </label>

            {selectedFile && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100 flex items-center justify-between">
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-blue-500 hover:text-blue-800">
                  <X size={16} />
                </button>
              </div>
            )}
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
              disabled={submitting || !selectedFile}
              className="px-6 py-2.5 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70"
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
