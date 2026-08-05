import { Link, useNavigate, useLocation } from "react-router-dom";
import { User as UserIcon, ArrowLeft } from "lucide-react";
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
				{/* Brand */}
				<Link to="/campeonatos" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 cursor-pointer">
					<img src={federadaIcon} alt="Federada" className="h-10 hover:scale-105 transition-transform brightness-0 invert" />
          <span className="font-mono font-bold tracking-tight text-xl hidden sm:block">TORNEIOS</span>
				</Link>

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

					{/* Voltar para o Portal */}
					<div className="flex items-center gap-4">
            <Link to="/" className="text-slate-300 hover:text-white px-4 py-2 flex items-center gap-2 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-sans font-bold tracking-wide text-xs uppercase">Portal</span>
            </Link>

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
