import { LayoutGrid, Swords, Shield } from 'lucide-react';

interface ChampionshipDetailNavProps {
  modalitiesCount: number;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  isPresident: boolean;
  isAthlete: boolean;
  pendingRequestsCount?: number;
}

export default function ChampionshipDetailNav({
  modalitiesCount,
  activeSection,
  onSelectSection,
  isPresident,
  isAthlete,
  pendingRequestsCount = 0,
}: ChampionshipDetailNavProps) {
  const navItems = [
    { 
      id: 'visao-geral', 
      label: 'Visão Geral & Inscrição', 
      shortLabel: 'Inscrição', 
      icon: LayoutGrid, 
      count: modalitiesCount 
    },
    { 
      id: 'competicao', 
      label: 'Competição', 
      shortLabel: 'Jogos & Times', 
      icon: Swords 
    },
  ];

  if (isPresident || isAthlete) {
    navItems.push({ 
      id: 'painel', 
      label: isPresident ? 'Painel da Atlética' : 'Meus Documentos', 
      shortLabel: isPresident ? 'Sua Atlética' : 'Meus Docs', 
      icon: Shield,
      count: isPresident && pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    });
  }

  return (
    <div className="sticky top-16 z-30 w-full bg-slate-900/95 backdrop-blur-md border-y border-slate-800 shadow-md py-2 px-3 transition-all">
      <nav className="max-w-4xl mx-auto flex items-center justify-around gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 whitespace-nowrap min-h-[42px] max-w-[220px] ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              
              <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs">
                <span className="inline sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </span>

              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-orange-600 text-white'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
