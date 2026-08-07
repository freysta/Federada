import { X, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  isSubscribing,
}: ConfirmSubscriptionModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const totalPrice = selectedModalities.reduce(
    (sum, mod) => sum + Number(mod.price || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-3 sm:p-4 z-[60] backdrop-blur-md font-inter animate-in fade-in duration-200">
      <div className="bg-white p-5 sm:p-8 max-w-lg w-full rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Revisar Inscrições
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Confirme as modalidades selecionadas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2.5 rounded-full hover:bg-slate-100 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Modalities List */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden mb-5">
          <div className="p-3 bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between">
            <span>Modalidades ({selectedModalities.length})</span>
            <span>Valor</span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-200/60">
            {selectedModalities.map((mod) => (
              <div key={mod.id} className="p-3.5 sm:p-4 flex justify-between items-center bg-white/60 hover:bg-white transition-colors">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">{mod.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] sm:text-[10px] font-black bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">
                      {mod.type}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded uppercase">
                      {mod.gender || 'MISTO'}
                    </span>
                  </div>
                </div>
                <div className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                  {Number(mod.price) > 0 ? `R$ ${Number(mod.price).toFixed(2).replace('.', ',')}` : 'Grátis'}
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary Footer */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-t border-slate-800">
            <span className="font-bold uppercase text-xs tracking-wider text-slate-300">Total a Pagar</span>
            <span className="font-mono font-black text-xl text-white">
              {totalPrice === 0 ? 'GRÁTIS' : `R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
        </div>

        {/* Requirements Notice */}
        {(championshipSettings?.requireRg || championshipSettings?.requireEnrollment) && (
          <div className="bg-amber-50/90 border border-amber-200/90 p-3.5 sm:p-4 rounded-2xl flex gap-3 mb-5">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="block font-bold mb-0.5 text-amber-950">Atenção aos Requisitos:</strong>
              Este campeonato exige que os atletas do elenco tenham 
              {championshipSettings.requireRg && ' RG '}
              {championshipSettings.requireRg && championshipSettings.requireEnrollment && ' e '}
              {championshipSettings.requireEnrollment && ' Comprovante de Matrícula '}
              aprovados para liberação dos jogos.
            </div>
          </div>
        )}

        {/* Checkbox agreement */}
        <label className="flex items-start gap-3 cursor-pointer group mb-6 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors active:scale-[0.99]">
          <div className="relative flex items-center justify-center mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-lg checked:bg-orange-600 checked:border-orange-600 transition-all cursor-pointer"
            />
            <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-700 font-medium leading-normal select-none">
            Li e concordo com o regulamento do campeonato e declaro estarem corretos os dados da inscrição.
          </span>
        </label>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors order-2 sm:order-1 min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!agreed || isSubscribing}
            className={`w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-wider text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2 order-1 sm:order-2 min-h-[44px] ${
              agreed && !isSubscribing
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30 active:scale-95'
                : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubscribing ? 'Processando...' : 'Confirmar Inscrições'}
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
