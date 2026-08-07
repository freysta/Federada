import { LayoutGrid, FileText, Trophy, Swords, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef, useEffect } from 'react';

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
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral', shortLabel: 'Geral', icon: LayoutGrid },
    { id: 'regulamento', label: 'Regulamento', shortLabel: 'Regras', icon: FileText },
    { id: 'modalidades', label: 'Modalidades', shortLabel: 'Modalidades', icon: Trophy, count: modalitiesCount },
    { id: 'jogos', label: 'Jogos', shortLabel: 'Jogos', icon: Swords, badge: 'Em Breve' },
    { id: 'equipes', label: 'Equipes', shortLabel: 'Equipes', icon: Shield, badge: 'Inscritas' },
  ];

  if (isAthlete) {
    navItems.push({ id: 'documentos', label: 'Meus Docs', shortLabel: 'Meus Docs', icon: FileText });
  }

  if (isPresident) {
    navItems.push({ id: 'painel-atletica', label: 'Sua Atlética', shortLabel: 'Atlética', icon: Shield });
  }

  // Auto-center active tab into view when selected
  useEffect(() => {
    const activeEl = itemRefs.current[activeSection];
    if (activeEl && navRef.current) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeSection]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 z-30 w-full bg-slate-900/95 backdrop-blur-md border-y border-slate-800/80 shadow-lg py-2 transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative flex items-center group">
        
        {/* Left Scroll Arrow (Desktop/Tablet) */}
        <button
          onClick={() => scrollNav('left')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/80 shadow-md shrink-0 mr-1.5 transition-all active:scale-95 z-10"
          title="Rolar esquerda"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Scrollable Container with Right Fade Affordance */}
        <div className="relative flex-1 overflow-hidden">
          <nav
            ref={navRef}
            className="flex flex-row items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-0.5 max-w-full"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  ref={(el) => (itemRefs.current[item.id] = el)}
                  onClick={() => onSelectSection(item.id)}
                  className={`relative group/btn flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 whitespace-nowrap min-h-[38px] ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <Icon size={15} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover/btn:text-slate-200'}`} />
                  
                  {/* Responsive Label */}
                  <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs">
                    <span className="inline sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>

                  {/* Count badge */}
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {item.count}
                    </span>
                  )}

                  {/* Status badge */}
                  {item.badge && item.count === undefined && (
                    <span className={`hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Soft Right Gradient Overlay to hint scroll */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent sm:hidden" />
        </div>

        {/* Right Scroll Arrow (Desktop/Tablet) */}
        <button
          onClick={() => scrollNav('right')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/80 shadow-md shrink-0 ml-1.5 transition-all active:scale-95 z-10"
          title="Rolar direita"
        >
          <ChevronRight size={16} />
        </button>

      </div>
    </div>
  );
}
