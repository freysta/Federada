import { CheckCircle2, Check, Users, User, Calendar, UserPlus, Award, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
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
  onShowRoster,
}: ModalityCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isSubscribed = !!subscription;

  // Gender Badge helper
  const getGenderBadge = (gender?: string) => {
    const normalized = (gender || 'MISTO').toUpperCase();
    if (normalized === 'MASCULINO') {
      return {
        label: 'MASCULINO',
        bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    }
    if (normalized === 'FEMININO') {
      return {
        label: 'FEMININO',
        bgClass: 'bg-pink-50 text-pink-700 border-pink-200',
        dotClass: 'bg-pink-500',
      };
    }
    return {
      label: 'MISTO',
      bgClass: 'bg-orange-50 text-orange-700 border-orange-200',
      dotClass: 'bg-orange-500',
    };
  };

  const genderBadge = getGenderBadge(mod.gender);
  const isColetivo = mod.type === 'COLETIVO';
  const priceNum = Number(mod.price || 0);

  // Subscribed Card View (Pass Validated)
  if (isSubscribed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
        {/* Pass Header Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-[11px] font-black tracking-widest uppercase px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-200" />
            <span className="font-mono">PASSE VALIDADO</span>
          </div>
          <span className="bg-black/30 border border-white/20 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono">
            {subscription.status || 'INSCRITO'}
          </span>
        </div>

        <div className="p-4 sm:p-5 relative">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 border ${
              isColetivo ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}>
              {isColetivo ? <Users size={12} /> : <User size={12} />}
              {mod.type}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 border ${genderBadge.bgClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${genderBadge.dotClass}`}></span>
              {genderBadge.label}
            </span>
          </div>

          <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-snug">
            {mod.name}
          </h4>
          {mod.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{mod.description}</p>
          )}
        </div>

        <div className="p-4 pt-0 bg-slate-50 flex-1 flex flex-col justify-between border-t border-slate-100">
          <div className="my-3">
            <SubscriptionStepper status={subscription.status} />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-slate-200">
            {isColetivo && athleteProfile?.teamRole === 'PRESIDENT' && (
              <button
                onClick={() => onShowRoster(subscription)}
                className="w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-4 py-2.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px] active:scale-95 transition-all"
              >
                <UserPlus size={15} />
                Gerenciar Elenco
              </button>
            )}

            <button
              onClick={() => onUnsubscribe(mod.id)}
              className="w-full sm:w-auto text-xs font-bold text-slate-500 hover:text-rose-600 px-3.5 py-2.5 rounded-xl hover:bg-rose-50 transition-all text-center uppercase tracking-wider min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Available Card View (Mobile-First List Item & Grid Hybrid)
  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        !isEnrollmentOpen
          ? 'opacity-50 cursor-not-allowed border-slate-200 grayscale'
          : isSelected
          ? 'border-2 border-orange-500 shadow-md bg-orange-50/20'
          : 'border-slate-200 hover:border-orange-500/50 hover:shadow-sm'
      }`}
    >
      {/* Main Selectable Area */}
      <div 
        onClick={() => isEnrollmentOpen && onToggle(mod.id)}
        className="p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex-1 min-w-0 pr-2">
          {/* Badges Bar */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 border ${
              isColetivo ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}>
              {isColetivo ? <Users size={12} /> : <User size={12} />}
              {mod.type}
            </span>

            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 border ${genderBadge.bgClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${genderBadge.dotClass}`}></span>
              {genderBadge.label}
            </span>
          </div>

          <h4 className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight leading-snug group-hover:text-orange-600 transition-colors truncate">
            {mod.name}
          </h4>

          {/* Price Tag & Info Toggle */}
          <div className="flex items-center gap-3 mt-2">
            {priceNum === 0 ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 font-mono">
                GRÁTIS
              </span>
            ) : (
              <span className="font-mono font-black text-slate-900 text-base">
                R$ {priceNum.toFixed(2).replace('.', ',')}
              </span>
            )}

            {mod.description && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-orange-600 flex items-center gap-0.5 underline decoration-slate-300 underline-offset-2"
              >
                <Info size={13} />
                <span>{showDetails ? 'Ocultar' : 'Info'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Checkbox Tap Target */}
        <div className="shrink-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 scale-105'
                : 'border-2 border-slate-300 bg-slate-50 group-hover:border-orange-500/60'
            }`}
          >
            {isSelected ? (
              <Check size={20} strokeWidth={3.5} />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-orange-500" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Details Drawer */}
      {showDetails && mod.description && (
        <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 animate-in fade-in duration-150">
          <p className="leading-relaxed font-medium mb-3">{mod.description}</p>

          <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
            {isColetivo && (
              <span className="bg-white border border-slate-200 px-2 py-1 rounded-md font-mono">
                {mod.minAthletes || 1} - {mod.maxAthletes || '∞'} Atletas
              </span>
            )}
            <span className="bg-white border border-slate-200 px-2 py-1 rounded-md font-mono">
              {mod.minAge || 0} - {mod.maxAge || 99} anos
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
