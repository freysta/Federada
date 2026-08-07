import { CheckCircle2, Check, Users, User, Calendar, UserPlus, Award, ChevronRight } from 'lucide-react';
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

  // Subscribed Card View (Official Tournament Pass Style)
  if (isSubscribed) {
    return (
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md duration-300">
        {/* Ticket Perforated Header Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-[11px] font-black tracking-widest uppercase px-4 py-2.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="animate-pulse text-emerald-200" />
            <span className="font-mono">PASSE VALIDADO</span>
          </div>
          <span className="bg-black/30 border border-white/20 text-emerald-200 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider">
            {subscription.status || 'INSCRITO'}
          </span>
        </div>

        <div className="p-6 pb-4 border-b border-slate-100 relative">
          {/* Subtle Background Badge Texture */}
          <div className="absolute right-3 top-3 opacity-5 pointer-events-none text-emerald-600">
            <Award size={96} />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1 border ${
                isColetivo
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-teal-50 text-teal-700 border-teal-200'
              }`}
            >
              {isColetivo ? <Users size={12} /> : <User size={12} />}
              {mod.type}
            </span>
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5 border ${genderBadge.bgClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${genderBadge.dotClass}`}></span>
              {genderBadge.label}
            </span>
          </div>

          <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight leading-snug mb-1">
            {mod.name}
          </h4>
          {mod.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{mod.description}</p>
          )}
        </div>

        <div className="p-6 pt-4 bg-slate-50 flex-1 flex flex-col justify-between">
          <div className="mb-4">
            <SubscriptionStepper status={subscription.status} />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-slate-200">
            {isColetivo && athleteProfile?.teamRole === 'PRESIDENT' && (
              <button
                onClick={() => onShowRoster(subscription)}
                className="w-full sm:flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <UserPlus size={15} />
                Gerenciar Elenco
              </button>
            )}

            <button
              onClick={() => onUnsubscribe(mod.id)}
              className="w-full sm:w-auto text-xs font-bold text-slate-500 hover:text-rose-600 px-3.5 py-2.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all text-center uppercase tracking-wider"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Available / Selectable Pass Card View
  return (
    <div
      onClick={() => isEnrollmentOpen && onToggle(mod.id)}
      className={`group relative bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden active:scale-[0.98] ${
        !isEnrollmentOpen
          ? 'opacity-50 cursor-not-allowed border-slate-200 grayscale'
          : isSelected
          ? 'border-2 border-orange-500 shadow-[0_12px_30px_rgba(249,115,22,0.18)] cursor-pointer -translate-y-1 bg-gradient-to-b from-orange-50/60 via-white to-white'
          : 'border-slate-200 hover:border-orange-500/50 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer'
      }`}
    >
      {/* Dynamic Selection Indicator Stamp Checkbox */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-110'
              : 'border-2 border-slate-300 bg-slate-50 group-hover:border-orange-500/60 group-hover:bg-orange-50'
          }`}
        >
          {isSelected ? (
            <Check size={18} strokeWidth={3.5} className="animate-in zoom-in-75" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-orange-500" />
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex-1">
        {/* Badges Bar */}
        <div className="flex flex-wrap gap-2 mb-3 pr-12">
          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 border ${
              isColetivo
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}
          >
            {isColetivo ? <Users size={12} /> : <User size={12} />}
            {mod.type}
          </span>

          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5 border ${genderBadge.bgClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${genderBadge.dotClass}`}></span>
            {genderBadge.label}
          </span>
        </div>

        <h4 className="font-black text-slate-900 text-lg sm:text-xl uppercase tracking-tight leading-tight mb-2 group-hover:text-orange-600 transition-colors">
          {mod.name}
        </h4>

        {mod.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-normal">
            {mod.description}
          </p>
        )}

        {/* Modality Features Specs */}
        <div className="flex flex-wrap gap-2.5 mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
          {isColetivo && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Users size={13} className="text-orange-500" />
              <span className="font-mono text-[11px] text-slate-700">
                {mod.minAthletes || 1} - {mod.maxAthletes || '∞'} Atletas
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            <Calendar size={13} className="text-amber-500" />
            <span className="font-mono text-[11px] text-slate-700">
              {mod.minAge || 0} - {mod.maxAge || 99} anos
            </span>
          </div>
        </div>
      </div>

      {/* Footer Price & Pass Action */}
      <div
        className={`px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between transition-colors ${
          isSelected
            ? 'bg-orange-50/80 border-t border-orange-200'
            : 'bg-slate-50/90 border-t border-slate-200'
        }`}
      >
        <div>
          <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
            TAXA DE INSCRIÇÃO
          </span>
          {priceNum === 0 ? (
            <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              GRÁTIS
            </span>
          ) : (
            <span className="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-tight">
              R$ {priceNum.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        <div>
          <span
            className={`text-xs font-black px-4 py-2.5 min-h-[40px] rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'bg-white text-slate-700 border border-slate-300 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600'
            }`}
          >
            <span>{isSelected ? 'SELECIONADO' : 'SELECIONAR'}</span>
            <ChevronRight size={14} className={isSelected ? 'translate-x-0.5' : 'group-hover:translate-x-0.5 transition-transform'} />
          </span>
        </div>
      </div>
    </div>
  );
}
