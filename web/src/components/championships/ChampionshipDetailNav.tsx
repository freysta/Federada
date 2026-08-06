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
    <div className="fixed bottom-0 left-0 right-0 lg:static w-full bg-white lg:rounded-3xl border-t lg:border border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] lg:shadow-sm p-2 pb-safe lg:p-4 z-50 lg:z-auto transition-all">
      <nav className="flex flex-row justify-around lg:flex-col gap-1 lg:gap-2 relative max-w-md mx-auto lg:max-w-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`relative group flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-1 lg:gap-3 p-1.5 lg:px-4 lg:py-3 lg:min-h-[44px] rounded-xl lg:rounded-2xl font-black transition-all flex-1 ${
                isActive
                  ? 'text-orange-600 lg:bg-orange-500/10 lg:border lg:border-orange-500/30'
                  : 'text-slate-400 lg:text-slate-500 hover:text-slate-900 lg:hover:bg-slate-100 lg:border lg:border-transparent'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3">
                <div className={`p-1.5 lg:p-0 rounded-full transition-colors ${isActive ? 'bg-orange-50 lg:bg-transparent' : ''}`}>
                  <Icon
                    size={22}
                    className={`transition-colors lg:w-[18px] lg:h-[18px] ${
                      isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </div>
                <span className={`text-[9px] lg:text-sm tracking-wider uppercase whitespace-nowrap ${isActive ? 'font-black' : 'font-bold'}`}>
                  {item.label}
                </span>
              </div>

              {/* Desktop Badges */}
              {item.count !== undefined && (
                <span
                  className={`hidden lg:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-black transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300 group-hover:text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.count}
                </span>
              )}

              {item.badge && (
                <span
                  className={`hidden lg:inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                      : 'bg-slate-200 text-slate-500 border border-slate-250'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Mobile Notification Dot for Items with Badges */}
              {(item.count !== undefined || item.badge) && !isActive && (
                <span className="absolute top-2 right-1/4 lg:hidden w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              )}

              {/* Broadcast active underline indicator (lateral on desktop) */}
              {isActive && (
                <span className="absolute -left-1 top-2 bottom-2 w-1 bg-orange-600 rounded-full shadow-[0_0_10px_#f97316] hidden lg:block"></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
