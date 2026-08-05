
import { CheckCircle2, Check, Users } from 'lucide-react';
import SubscriptionStepper from './SubscriptionStepper';

interface ModalityCardProps {
  mod: any;
  subscription: any;
  isSelected: boolean;
  isEnrollmentOpen: boolean;
  athleteProfile: any;
  onToggle: (modId: string) => void;
  onUnsubscribe: (modId: string) => void;
  onShowRoster: (subscription: any) => void;
}

export default function ModalityCard({
  mod,
  subscription,
  isSelected,
  isEnrollmentOpen,
  athleteProfile,
  onToggle,
  onUnsubscribe,
  onShowRoster
}: ModalityCardProps) {
  const isSubscribed = !!subscription;

  if (isSubscribed) {
    return (
      <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)] overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1 shadow-sm">
          <CheckCircle2 size={14} /> INSCRITO
        </div>
        <div className="p-6 pb-4 border-b border-slate-700">
          <div className="flex gap-2 mb-2">
            <span className="text-[10px] font-bold bg-slate-900/50 border border-slate-700 text-slate-300 px-2 py-1 rounded uppercase tracking-wider">{mod.type}</span>
            <span className="text-[10px] font-bold bg-slate-900/50 border border-slate-700 text-slate-300 px-2 py-1 rounded uppercase tracking-wider">{mod.gender || 'MISTO'}</span>
          </div>
          <h4 className="font-bold text-white text-xl leading-tight mb-2">{mod.name}</h4>
        </div>
        
        <div className="p-6 pt-4 bg-green-900/10 flex-1 flex flex-col">
          <SubscriptionStepper status={subscription.status} />
          
          <div className="mt-4 flex justify-between items-center gap-4">
            <button 
              onClick={() => onUnsubscribe(mod.id)}
              className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline px-2"
            >
              Cancelar
            </button>
            
            {mod.type === 'COLETIVO' && athleteProfile?.teamRole === 'PRESIDENT' && (
              <button 
                onClick={() => onShowRoster(subscription)}
                className="bg-green-600/20 text-green-400 border border-green-500/30 text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-600/30 shadow-sm flex-1 text-center transition-colors"
              >
                Elenco
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => isEnrollmentOpen && onToggle(mod.id)}
      className={`relative bg-slate-800/80 backdrop-blur-sm rounded-2xl border-2 transition-all flex flex-col overflow-hidden ${
        !isEnrollmentOpen ? 'opacity-60 cursor-not-allowed border-slate-800' :
        isSelected ? 'border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer scale-[1.02] transform' : 'border-slate-700 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer'
      }`}
    >
      <div className={`absolute top-5 right-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10 ${
        isSelected ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-600 bg-slate-900/50'
      }`}>
        {isSelected && <Check size={14} strokeWidth={3} />}
      </div>
      
      <div className="p-6 pb-4 border-b border-slate-700">
        <div className="flex gap-2 mb-2 pr-8">
          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${mod.type === 'COLETIVO' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' : 'bg-teal-900/30 text-teal-400 border-teal-500/30'}`}>
            {mod.type}
          </span>
          <span className="text-[10px] font-bold bg-slate-900/50 border border-slate-700 text-slate-300 px-2 py-1 rounded uppercase tracking-wider">
            {mod.gender || 'MISTO'}
          </span>
        </div>
        <h4 className="font-bold text-white text-xl leading-tight mb-2">{mod.name}</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-400 font-medium">
          {mod.type === 'COLETIVO' && (
            <div className="flex items-center gap-1">
              <Users size={14} className="text-slate-500" /> {mod.minAthletes} a {mod.maxAthletes} atletas
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="font-mono text-slate-300">{mod.minAge || 0} - {mod.maxAge || 99} anos</span>
          </div>
        </div>
      </div>
      
      <div className={`p-6 pt-4 flex-1 flex flex-col justify-end ${isSelected ? 'bg-blue-900/20' : 'bg-slate-900/30'}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Taxa de Inscrição</span>
          <span className="font-extrabold text-white text-lg">
            {Number(mod.price) === 0 ? 'Grátis' : `R$ ${Number(mod.price).toFixed(2).replace('.', ',')}`}
          </span>
        </div>
      </div>
    </div>
  );
}
