import { LayoutGrid, FileText, Trophy, Swords, Shield } from 'lucide-react';

interface ChampionshipDetailNavProps {
  modalitiesCount: number;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  isPresident: boolean;
  isAthlete: boolean;
}

export default function ChampionshipDetailNav({
  modalitiesCount,
  activeSection,
  onSelectSection,
  isPresident,
  isAthlete,
}: ChampionshipDetailNavProps) {
  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: LayoutGrid },
    { id: 'regulamento', label: 'Regulamento', icon: FileText },
    { id: 'modalidades', label: 'Modalidades', icon: Trophy, count: modalitiesCount },
    { id: 'jogos', label: 'Jogos', icon: Swords, badge: 'Em Breve' },
    { id: 'equipes', label: 'Equipes', icon: Shield, badge: 'Inscritas' },
  ];

  if (isAthlete) {
    navItems.push({ id: 'documentos', label: 'Meus Docs', icon: FileText });
  }

  if (isPresident) {
    navItems.push({ id: 'painel-atletica', label: 'Sua Atlética', icon: Shield });
  }

  return (
    <div className="sticky top-16 z-30 w-full bg-slate-900/95 backdrop-blur-md border-y border-slate-800 shadow-md py-2 px-3 transition-all">
      <nav className="max-w-7xl mx-auto flex flex-row items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`relative group flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 whitespace-nowrap min-h-[40px] ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
              
              <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs">
                {item.label}
              </span>

              {/* Count badge inline */}
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {item.count}
                </span>
              )}

              {/* Status badge inline */}
              {item.badge && item.count === undefined && (
                <span className={`hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
