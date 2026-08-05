
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
      <div className="relative bg-black rounded-none border-2 border-[#00f0ff] shadow-[4px_4px_0_0_#00f0ff] overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 bg-[#00f0ff] text-black text-xs font-mono font-bold px-4 py-1.5 flex items-center gap-1 border-b-2 border-l-2 border-black">
          <CheckCircle2 size={14} /> INSCRITO
        </div>
        <div className="p-6 pb-4 border-b-2 border-neutral-800">
          <div className="flex gap-2 mb-2">
            <span className="text-[10px] font-bold bg-neutral-900 border border-neutral-700 text-neutral-300 px-2 py-1 uppercase tracking-widest font-mono">{mod.type}</span>
            <span className="text-[10px] font-bold bg-neutral-900 border border-neutral-700 text-neutral-300 px-2 py-1 uppercase tracking-widest font-mono">{mod.gender || 'MISTO'}</span>
          </div>
          <h4 className="font-mono font-bold text-white text-2xl leading-none mb-2 uppercase tracking-tighter">{mod.name}</h4>
        </div>
        
        <div className="p-6 pt-4 bg-black flex-1 flex flex-col">
          <SubscriptionStepper status={subscription.status} />
          
          <div className="mt-4 flex justify-between items-center gap-4">
            <button 
              onClick={() => onUnsubscribe(mod.id)}
              className="text-xs font-mono font-bold text-red-500 hover:text-red-400 uppercase tracking-widest px-2"
            >
              Cancelar
            </button>
            
            {mod.type === 'COLETIVO' && athleteProfile?.teamRole === 'PRESIDENT' && (
              <button 
                onClick={() => onShowRoster(subscription)}
                className="bg-[#00f0ff] text-black border-2 border-black font-mono font-bold uppercase tracking-widest px-4 py-2 hover:bg-white shadow-[4px_4px_0_0_#000] flex-1 text-center transition-colors"
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
      className={`relative bg-black rounded-none border-2 transition-all flex flex-col overflow-hidden ${
        !isEnrollmentOpen ? 'opacity-60 cursor-not-allowed border-neutral-800' :
        isSelected ? 'border-[#00f0ff] shadow-[4px_4px_0_0_#00f0ff] cursor-pointer scale-[1.02] transform' : 'border-neutral-800 hover:border-neutral-600 hover:shadow-[4px_4px_0_0_#555] cursor-pointer'
      }`}
    >
      <div className={`absolute top-5 right-5 w-6 h-6 rounded-none border-2 flex items-center justify-center transition-colors z-10 ${
        isSelected ? 'border-black bg-[#00f0ff] text-black' : 'border-neutral-700 bg-neutral-900'
      }`}>
        {isSelected && <Check size={14} strokeWidth={4} />}
      </div>
      
      <div className="p-6 pb-4 border-b-2 border-neutral-800">
        <div className="flex gap-2 mb-2 pr-8">
          <span className={`text-[10px] font-bold px-2 py-1 font-mono uppercase tracking-widest border border-neutral-700 bg-neutral-900 text-neutral-300`}>
            {mod.type}
          </span>
          <span className="text-[10px] font-bold px-2 py-1 font-mono uppercase tracking-widest border border-neutral-700 bg-neutral-900 text-neutral-300">
            {mod.gender || 'MISTO'}
          </span>
        </div>
        <h4 className="font-mono font-bold text-white text-2xl leading-none mb-2 uppercase tracking-tighter">{mod.name}</h4>
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
