import { Loader2, ArrowRight, X, Trophy } from 'lucide-react';

interface FloatingCheckoutDockProps {
  selectedModalities: any[];
  onConfirm: () => void;
  onClear: () => void;
  isSubscribing: boolean;
}

export default function FloatingCheckoutDock({
  selectedModalities,
  onConfirm,
  onClear,
  isSubscribing,
}: FloatingCheckoutDockProps) {
  if (!selectedModalities || selectedModalities.length === 0) return null;

  const totalPrice = selectedModalities.reduce(
    (acc, mod) => acc + Number(mod.price || 0),
    0
  );

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl z-50 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-slate-900/98 border border-orange-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Badge + List Preview */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white flex items-center justify-center font-mono font-black text-xl shadow-lg shadow-orange-500/20 shrink-0 border border-orange-500/40">
              {selectedModalities.length}
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
            </span>
          </div>
 
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="font-black text-white text-sm sm:text-base uppercase tracking-tight leading-tight">
                {selectedModalities.length === 1 ? '1 MODALIDADE SELECIONADA' : `${selectedModalities.length} MODALIDADES SELECIONADAS`}
              </p>
              <button
                onClick={onClear}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-400 uppercase tracking-wider flex items-center gap-0.5 ml-2 transition-colors"
                title="Limpar Seleção"
              >
                <X size={13} /> Limpar
              </button>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-normal">
              {selectedModalities.map((m) => m.name).join(', ')}
            </p>
          </div>
        </div>
 
        {/* Right Side: Total Price + CTA Button */}
        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="text-left sm:text-right">
            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
              TOTAL DAS INSCRIÇÕES
            </span>
            <span className="font-mono font-black text-white text-xl sm:text-2xl tracking-tight">
              {totalPrice === 0 ? 'GRÁTIS' : `R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
 
          <button
            onClick={onConfirm}
            disabled={isSubscribing}
            className="bg-gradient-to-r from-orange-550 via-orange-600 to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black px-6 sm:px-8 py-3.5 rounded-xl shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 hover:scale-[1.02] active:scale-95 transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 disabled:opacity-50 whitespace-nowrap"
          >
            {isSubscribing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Trophy size={18} />
                <span>CONFIRMAR INSCRIÇÃO</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

