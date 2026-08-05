
import { Trophy, Info } from 'lucide-react';
import SubscriptionStepper from './SubscriptionStepper';
import type { ISubscription } from '../../types';

interface ActiveSubscriptionsProps {
  subscriptions: ISubscription[];
  getSubStatusLabel: (status: string | undefined) => { label: string, desc: string, color: string };
}

export default function ActiveSubscriptions({ subscriptions, getSubStatusLabel }: ActiveSubscriptionsProps) {
  if (!subscriptions || subscriptions.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
        <Trophy size={20} className="text-yellow-500" /> Suas Inscrições
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map(sub => {
          const mod = sub.modality;
          if (!mod) return null;
          return (
            <div key={sub.id} className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-200 transition-colors gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{mod.championship?.name}</span>
                  <p className="font-bold text-slate-800 text-lg leading-tight mt-1">{mod.name} <span className="text-sm font-normal text-slate-500">({mod.type})</span></p>
                </div>
                <div className="group relative flex items-center gap-1 cursor-help">
                  <span className={`font-bold text-[10px] uppercase px-3 py-1.5 rounded-full ${getSubStatusLabel(sub.status).color}`}>
                    {getSubStatusLabel(sub.status).label}
                  </span>
                  <Info size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                    <div className="bg-slate-800 text-white text-[10px] rounded-lg p-2 shadow-xl border border-slate-700">
                      {getSubStatusLabel(sub.status).desc}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 pb-4 border-t border-slate-200/60">
                <SubscriptionStepper status={sub.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
