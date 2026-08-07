import { LayoutGrid, Swords, Shield, FileText } from 'lucide-react';

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
      label: 'Geral', 
      icon: LayoutGrid, 
      count: modalitiesCount > 0 ? modalitiesCount : undefined 
    },
    { 
      id: 'competicao', 
      label: 'Jogos', 
      icon: Swords 
    },
  ];

  if (isPresident || isAthlete) {
    navItems.push({ 
      id: 'painel', 
      label: isPresident ? 'Painel' : 'Meus Docs', 
      icon: isPresident ? Shield : FileText,
      count: isPresident && pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    });
  }

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[360px] animate-in slide-in-from-bottom-8 duration-300">
      <nav className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-1.5 rounded-3xl flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all duration-300 active:scale-95 min-h-[52px] ${
                isActive
                  ? 'bg-orange-600 shadow-md shadow-orange-600/30'
                  : 'hover:bg-slate-800'
              }`}
            >
              <div className="relative">
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className={`absolute -top-2 -right-3 px-1.5 py-0.5 rounded-full text-[9px] font-black min-w-[16px] text-center ${
                    isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                  }`}>
                    {item.count}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] uppercase font-black tracking-wider ${
                isActive ? 'text-white' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
