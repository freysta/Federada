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
		<nav className="fixed w-full z-50 bg-black text-white border-b border-neutral-800">
			<div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
				{/* Context Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-3 cursor-pointer p-2 -ml-2 hover:bg-neutral-900 transition-colors">
            <img src={federadaIcon} alt="Federada" className="h-8 brightness-0 invert" />
            <div className="flex flex-col items-start text-left hidden sm:flex">
              <span className="text-[10px] text-[#00f0ff] font-mono font-bold tracking-widest leading-none mb-0.5">FEDERADA</span>
              <span className="font-sans font-bold tracking-wide uppercase text-sm leading-tight flex items-center gap-1">
                ▼ Workspace Torneios
              </span>
            </div>
            <ChevronDown size={16} className="text-neutral-500 sm:hidden" />
          </button>
          
          <div className="absolute top-full left-0 mt-1 w-64 bg-black border border-neutral-800 shadow-[6px_6px_0_0_#00f0ff] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-50">
            <div className="p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Alternar Contexto</div>
              
              <Link to="/" className="flex items-center gap-3 px-3 py-3 hover:bg-neutral-900 transition-colors text-neutral-400 hover:text-white border border-transparent hover:border-neutral-700">
                <div className="w-8 h-8 bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700">
                  <ArrowLeft size={16} />
                </div>
                <div>
                  <div className="font-bold font-sans tracking-wide text-sm leading-tight uppercase">Portal Principal</div>
                  <div className="text-xs font-mono text-neutral-500">Loja, Fórum e Galeria</div>
                </div>
              </Link>
              
              <div className="h-px bg-neutral-800 my-2 mx-2"></div>
              
              <Link to="/campeonatos" className="flex items-center gap-3 px-3 py-3 bg-[#00f0ff] text-black border-2 border-black hover:bg-white transition-colors group/item">
                <div className="w-8 h-8 bg-black text-[#00f0ff] flex items-center justify-center shrink-0 border border-black group-hover/item:bg-[#00f0ff] group-hover/item:text-black">
                  <Trophy size={16} />
                </div>
                <div>
                  <div className="font-bold font-sans tracking-wide text-sm leading-tight uppercase">Torneios</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest font-bold">Workspace Atual</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

				{/* Desktop Menu */}
				<div className="hidden lg:flex items-center gap-8 font-sans text-lg tracking-wider">
					<Link to="/campeonatos" className={`hover:text-[#00f0ff] uppercase transition-colors ${location.pathname === '/campeonatos' ? 'text-[#00f0ff] font-bold underline-offset-4 underline' : 'font-bold'}`}>
						Dashboard
					</Link>
          <Link to="/campeonatos/jogos" className={`hover:text-[#00f0ff] uppercase transition-colors ${location.pathname === '/campeonatos/jogos' ? 'text-[#00f0ff] font-bold underline-offset-4 underline' : 'font-bold'}`}>
						Jogos
					</Link>
          <Link to="/campeonatos/times" className={`hover:text-[#00f0ff] uppercase transition-colors ${location.pathname === '/campeonatos/times' ? 'text-[#00f0ff] font-bold underline-offset-4 underline' : 'font-bold'}`}>
						Times
					</Link>
          <Link to="/campeonatos/ranking" className={`hover:text-[#00f0ff] uppercase transition-colors ${location.pathname === '/campeonatos/ranking' ? 'text-[#00f0ff] font-bold underline-offset-4 underline' : 'font-bold'}`}>
						Ranking
					</Link>
					
					{user && (
						<Link to="/campeonatos/minha-equipe" className={`hover:text-[#00f0ff] uppercase transition-colors ${location.pathname === '/campeonatos/minha-equipe' ? 'text-[#00f0ff] font-bold underline-offset-4 underline' : 'font-bold'}`}>
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
