import React from 'react';
import { Shield } from 'lucide-react';

export default function TeamsView() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center text-green-400 mb-6 border border-green-500/30">
        <Shield size={40} />
      </div>
      <h1 className="text-3xl font-mono font-bold uppercase tracking-wider text-white mb-4">Atléticas Participantes</h1>
      <p className="text-slate-400 max-w-lg text-lg">
        Conheça as equipes que disputam os torneios desta temporada, veja seus elencos e estatísticas gerais.
      </p>
      <div className="mt-8 px-6 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl font-bold uppercase tracking-wider text-sm">
        Em Construção
      </div>
    </div>
  );
}
