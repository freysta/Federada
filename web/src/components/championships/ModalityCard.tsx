
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
      <div className="relative bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1 shadow-sm">
          <CheckCircle2 size={14} /> INSCRITO
        </div>
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex gap-2 mb-2">
            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-wider">{mod.type}</span>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-wider">{mod.gender || 'MISTO'}</span>
          </div>
          <h4 className="font-bold text-slate-900 text-xl leading-tight mb-2">{mod.name}</h4>
        </div>
        
        <div className="p-6 pt-4 bg-green-50/50 flex-1 flex flex-col">
          <SubscriptionStepper status={subscription.status} />
          
          <div className="mt-4 flex justify-between items-center gap-4">
            <button 
              onClick={() => onUnsubscribe(mod.id)}
              className="text-xs font-bold text-red-500 hover:text-red-600 px-2"
            >
              Cancelar
            </button>
            
            {mod.type === 'COLETIVO' && athleteProfile?.teamRole === 'PRESIDENT' && (
              <button 
                onClick={() => onShowRoster(subscription)}
                className="bg-white text-green-700 border border-green-200 font-bold px-4 py-2 rounded-xl hover:bg-green-50 shadow-sm flex-1 text-center transition-colors"
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
      className={`relative bg-white rounded-2xl border transition-all flex flex-col overflow-hidden ${
        !isEnrollmentOpen ? 'opacity-60 cursor-not-allowed border-gray-200' :
        isSelected ? 'border-blue-500 shadow-md cursor-pointer scale-[1.02] transform' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
      }`}
    >
      <div className={`absolute top-5 right-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10 ${
        isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-gray-50'
      }`}>
        {isSelected && <Check size={14} strokeWidth={3} />}
      </div>
      
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex gap-2 mb-2 pr-8">
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${mod.type === 'COLETIVO' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
            {mod.type}
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
            {mod.gender || 'MISTO'}
          </span>
        </div>
        <h4 className="font-bold text-slate-900 text-xl leading-tight mb-2">{mod.name}</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-gray-500 font-medium">
          {mod.type === 'COLETIVO' && (
            <div className="flex items-center gap-1">
              <Users size={14} className="text-gray-400" /> {mod.minAthletes} a {mod.maxAthletes} atletas
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="font-mono text-gray-500">{mod.minAge || 0} - {mod.maxAge || 99} anos</span>
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
