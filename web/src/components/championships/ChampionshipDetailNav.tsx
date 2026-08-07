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
    <div className="fixed bottom-0 left-0 right-0 lg:static w-full bg-white/95 backdrop-blur-md lg:backdrop-blur-none lg:bg-white lg:rounded-3xl border-t lg:border border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-sm p-1 sm:p-1.5 lg:p-4 z-40 lg:z-auto transition-all pb-[calc(0.35rem+env(safe-area-inset-bottom))] lg:pb-4">
      <nav className="flex flex-row lg:flex-col gap-1 lg:gap-2 relative overflow-x-auto no-scrollbar scroll-smooth px-1 max-w-full lg:max-w-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`relative group flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-1 lg:gap-3 px-2 py-2 lg:px-4 lg:py-3 min-h-[52px] lg:min-h-[44px] rounded-2xl font-black transition-all shrink-0 flex-1 min-w-[64px] lg:min-w-0 active:scale-95 lg:active:scale-100 ${
                isActive
                  ? 'text-orange-600 bg-orange-500/10 border border-orange-500/30 lg:border-orange-500/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3">
                <div className={`p-1 lg:p-0 rounded-full transition-colors ${isActive ? 'bg-orange-100/80 lg:bg-transparent text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  <Icon
                    size={20}
                    className={`transition-colors lg:w-[18px] lg:h-[18px] ${
                      isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </div>
                <span className={`text-[10px] lg:text-sm tracking-wider uppercase whitespace-nowrap ${isActive ? 'font-black' : 'font-extrabold'}`}>
                  {item.label}
                </span>
              </div>

              {/* Desktop Badges */}
              {item.count !== undefined && (
                <span
                  className={`hidden lg:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-black transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300 group-hover:text-slate-800 border border-slate-200'
                  }`}
                >
                  {item.count}
                </span>
              )}

              {item.badge && (
                <span
                  className={`hidden lg:inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                      : 'bg-slate-200 text-slate-600 border border-slate-250'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Mobile Count / Notification Badge */}
              {item.count !== undefined && (
                <span className={`lg:hidden text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.count}
                </span>
              )}

              {item.badge && !item.count && (
                <span className={`lg:hidden w-2 h-2 rounded-full ${isActive ? 'bg-orange-600' : 'bg-amber-500'}`} />
              )}

              {/* Active Underline indicator on top for Mobile */}
              {isActive && (
                <span className="absolute top-0 left-2 right-2 h-1 bg-orange-600 rounded-b-full shadow-[0_2px_8px_rgba(249,115,22,0.6)] lg:hidden" />
              )}

              {/* Desktop Active Left Indicator */}
              {isActive && (
                <span className="absolute -left-1 top-2 bottom-2 w-1 bg-orange-600 rounded-full shadow-[0_0_10px_#f97316] hidden lg:block" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
