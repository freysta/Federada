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
		<nav className="fixed w-full z-50 bg-slate-900 text-white backdrop-blur border-b border-slate-800">
			<div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
				{/* Brand */}
				<Link to="/campeonatos" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 cursor-pointer">
					<img src={federadaIcon} alt="Federada" className="h-10 hover:scale-105 transition-transform brightness-0 invert" />
          <span className="font-mono font-bold tracking-tight text-xl hidden sm:block">TORNEIOS</span>
				</Link>

				{/* Desktop Menu */}
				<div className="hidden lg:flex items-center gap-8 font-mono text-sm">
					<Link to="/campeonatos" className="hover:text-blue-400 transition-colors underline-offset-4 text-blue-500 font-bold">
						HUB DE CAMPEONATOS
					</Link>
					
					{user && (
						<Link to="/campeonatos/painel" className="hover:text-blue-400 transition-colors font-bold">
							MEU PAINEL
						</Link>
					)}

					{(user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN') && (
						<Link to="/admin" className="hover:text-orange-400 transition-colors font-bold">
							PAINEL ADMIN
						</Link>
					)}

					<div className="h-4 w-[1px] bg-slate-700 mx-2"></div>

					{/* Action Buttons */}
					<div className="flex items-center gap-4">
            <Link to="/" className="text-slate-300 hover:text-white px-4 py-2 flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} />
              <span className="font-sans font-bold tracking-wide text-xs uppercase">Loja / Início</span>
            </Link>

						{user ? (
							<Link to="/perfil" className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-500 transition-colors rounded-lg shadow-lg">
								<UserIcon size={16} />
								<span className="font-sans font-bold tracking-wide uppercase text-xs">{user.name.split(' ')[0]}</span>
							</Link>
						) : (
							<button onClick={() => setIsLoginOpen(true)} className="bg-white text-slate-900 px-4 py-2 flex items-center gap-2 hover:bg-slate-200 transition-colors rounded-lg shadow-lg">
								<UserIcon size={16} />
								<span className="font-sans font-bold tracking-wide text-xs">LOGIN</span>
							</button>
						)}
					</div>
				</div>

				<div className="lg:hidden flex items-center gap-4">
          <Link to="/" className="p-2 text-slate-300">
            <ArrowLeft size={20} />
          </Link>
          {user ? (
            <Link to="/perfil" className="p-2 bg-blue-600 rounded-lg">
              <UserIcon size={20} />
            </Link>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="p-2 bg-white text-slate-900 rounded-lg">
              <UserIcon size={20} />
            </button>
          )}
				</div>
			</div>

			<LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
		</nav>
	);
}
