import { X, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface ConfirmSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedModalities: any[];
  championshipSettings: any;
  isSubscribing: boolean;
}

export default function ConfirmSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  selectedModalities,
  championshipSettings,
  isSubscribing
}: ConfirmSubscriptionModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const totalPrice = selectedModalities.reduce((sum, mod) => sum + Number(mod.price || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm font-inter">
      <div className="bg-white p-6 max-w-lg w-full rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" />
            Revisar Inscrições
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-600 mb-6">
          Você está prestes a inscrever sua atlética nas seguintes modalidades. Verifique se os dados estão corretos:
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-6">
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-200">
            {selectedModalities.map(mod => (
              <div key={mod.id} className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800">{mod.name}</h4>
                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">{mod.type} - {mod.gender || 'MISTO'}</span>
                </div>
                <div className="font-bold text-green-700">
                  {Number(mod.price) > 0 ? `R$ ${Number(mod.price).toFixed(2)}` : 'Grátis'}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-100 p-4 flex justify-between items-center border-t border-slate-200">
            <span className="font-bold text-slate-600 uppercase text-sm tracking-wider">Total</span>
            <span className="font-black text-xl text-slate-800">R$ {totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {(championshipSettings?.requireRg || championshipSettings?.requireEnrollment) && (
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3 mb-6">
            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-orange-800">
              <strong className="block mb-1">Atenção aos Requisitos:</strong>
              Este campeonato exige que os atletas do elenco tenham 
              {championshipSettings.requireRg && ' RG '}
              {championshipSettings.requireRg && championshipSettings.requireEnrollment && ' e '}
              {championshipSettings.requireEnrollment && ' Atestado de Matrícula '}
              aprovados pela organização. A inscrição só será validada após a conferência dos documentos.
            </div>
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer group mb-6 p-4 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="relative flex items-center justify-center mt-0.5">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={e => setAgreed(e.target.checked)} 
              className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" 
            />
            <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none pb-0.5">&#10003;</div>
          </div>
          <span className="text-sm text-slate-700 font-medium leading-tight">
            Li e concordo com o regulamento do campeonato e entendo que serei responsável por montar o elenco no prazo estabelecido.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={!agreed || isSubscribing}
            className={`w-full sm:w-auto justify-center px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-2 order-1 sm:order-2 ${
              agreed && !isSubscribing ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubscribing ? 'Processando...' : 'Confirmar Inscrições'}
          </button>
        </div>
      </div>
    </div>
  );
}
