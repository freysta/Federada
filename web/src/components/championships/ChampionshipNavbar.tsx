import { Link, useNavigate, useLocation } from "react-router-dom";
import { User as UserIcon, ArrowLeft, ChevronDown, Trophy } from "lucide-react";
import { useState } from "react";
import federadaIcon from "../../assets/logos/logo-sem-nome.png";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../LoginModal";

export default function ChampionshipNavbar() {
	const { user } = useAuth();
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const navigate = useNavigate();

	return (
		<nav className="fixed w-full z-50 bg-slate-900/80 text-white backdrop-blur-md border-b border-slate-800/50 shadow-sm">
			<div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
				{/* Context Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-3 cursor-pointer p-2 -ml-2 rounded-xl hover:bg-slate-800 transition-colors">
            <img src={federadaIcon} alt="Federada" className="h-8 brightness-0 invert" />
            <div className="flex flex-col items-start text-left hidden sm:flex">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">🏛 Federada</span>
              <span className="font-mono font-bold tracking-tight text-sm leading-tight flex items-center gap-1">
                ▼ Workspace Torneios
              </span>
            </div>
            <ChevronDown size={16} className="text-slate-500 sm:hidden" />
          </button>
          
          <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-50">
            <div className="p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Alternar Contexto</div>
              
              <Link to="/" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-700 transition-colors text-slate-300 hover:text-white">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <ArrowLeft size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight">Portal Principal</div>
                  <div className="text-xs text-slate-500">Loja, Fórum e Galeria</div>
                </div>
              </Link>
              
              <div className="h-px bg-slate-700 my-2 mx-2"></div>
              
              <Link to="/campeonatos" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-900/20 border border-blue-500/30 text-white">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Trophy size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight">Torneios</div>
                  <div className="text-xs text-blue-400">Workspace Atual</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

				{/* Desktop Menu */}
				<div className="hidden lg:flex items-center gap-8 font-mono text-sm">
					<Link to="/campeonatos" className={`hover:text-blue-400 transition-colors ${location.pathname === '/campeonatos' ? 'text-blue-500 font-bold underline-offset-4 underline' : 'font-semibold'}`}>
						Dashboard
					</Link>
          <Link to="/campeonatos/jogos" className={`hover:text-blue-400 transition-colors ${location.pathname === '/campeonatos/jogos' ? 'text-blue-500 font-bold underline-offset-4 underline' : 'font-semibold'}`}>
						Jogos
					</Link>
          <Link to="/campeonatos/times" className={`hover:text-blue-400 transition-colors ${location.pathname === '/campeonatos/times' ? 'text-blue-500 font-bold underline-offset-4 underline' : 'font-semibold'}`}>
						Times
					</Link>
          <Link to="/campeonatos/ranking" className={`hover:text-blue-400 transition-colors ${location.pathname === '/campeonatos/ranking' ? 'text-blue-500 font-bold underline-offset-4 underline' : 'font-semibold'}`}>
						Ranking
					</Link>
					
					{user && (
						<Link to="/campeonatos/minha-equipe" className={`hover:text-blue-400 transition-colors ${location.pathname === '/campeonatos/minha-equipe' ? 'text-blue-500 font-bold underline-offset-4 underline' : 'font-semibold'}`}>
							Minha Equipe
						</Link>
					)}

					{(user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN') && (
						<Link to="/admin" className="hover:text-orange-400 transition-colors font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded border border-orange-500/30">
							Admin
						</Link>
					)}

					<div className="h-4 w-[1px] bg-slate-700 mx-2"></div>

					{/* Login (if not logged in) */}
					<div className="flex items-center gap-4">
						{!user && (
							<button onClick={() => setIsLoginOpen(true)} className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-500 transition-colors rounded-lg shadow-lg">
								<UserIcon size={16} />
								<span className="font-sans font-bold tracking-wide text-xs">LOGIN</span>
							</button>
						)}
					</div>
				</div>

				{/* Mobile Menu */}
				<div className="lg:hidden flex items-center gap-4">
          <Link to="/" className="p-2 text-slate-300 flex items-center gap-2 text-xs font-bold uppercase">
            <ArrowLeft size={16} /> Portal
          </Link>
          {!user && (
            <button onClick={() => setIsLoginOpen(true)} className="p-2 bg-blue-600 text-white rounded-lg">
              <UserIcon size={20} />
            </button>
          )}
				</div>
			</div>

			<LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
		</nav>
	);
}
