import { Link, useLocation } from "react-router-dom";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import federadaIcon from "../../assets/logos/logo-sem-nome.png";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../LoginModal";

export default function ChampionshipNavbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { user } = useAuth();
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const location = useLocation();


	return (
		<nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b border-black/5">
			<div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
				{/* Brand */}
				<Link to="/campeonatos" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer">
					<img src={federadaIcon} alt="Federada" className="h-12 hover:scale-105 transition-transform" />
				</Link>

				{/* Desktop Menu */}
				<div className="hidden lg:flex items-center gap-8 font-mono text-sm">
					<Link to="/loja" className="hover:underline underline-offset-4 text-gray-500">
						LOJA
					</Link>
					<Link to="/campeonatos" className={`hover:underline underline-offset-4 ${location.pathname === '/campeonatos' ? 'text-orange-600 font-bold' : ''}`}>
						PAINEL
					</Link>
					<Link to="/campeonatos/jogos" className={`hover:underline underline-offset-4 ${location.pathname === '/campeonatos/jogos' ? 'text-orange-600 font-bold' : ''}`}>
						JOGOS
					</Link>
					<Link to="/campeonatos/times" className={`hover:underline underline-offset-4 ${location.pathname === '/campeonatos/times' ? 'text-orange-600 font-bold' : ''}`}>
						TIMES
					</Link>
					<Link to="/campeonatos/ranking" className={`hover:underline underline-offset-4 ${location.pathname === '/campeonatos/ranking' ? 'text-orange-600 font-bold' : ''}`}>
						RANKING
					</Link>

					{user && (
						<Link to="/campeonatos/minha-equipe" className={`hover:underline underline-offset-4 ${location.pathname === '/campeonatos/minha-equipe' ? 'text-orange-600 font-bold' : ''}`}>
							MINHA EQUIPE
						</Link>
					)}

					{(user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN') && (
						<Link to="/admin" className="hover:underline underline-offset-4 text-orange-600 font-bold">
							ADMIN
						</Link>
					)}

					<div className="h-4 w-[1px] bg-gray-300 mx-2"></div>

					{/* Action Buttons */}
					<div className="flex items-center gap-4">
						{user ? (
							<Link to="/campeonatos/perfil" className="bg-black text-[#ffffff] px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors">
								<UserIcon size={20} />
								<span className="font-sans font-bold tracking-wide uppercase">{user.name.split(' ')[0]}</span>
							</Link>
						) : (
							<button onClick={() => setIsLoginOpen(true)} className="bg-white border border-black text-black px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors">
								<UserIcon size={20} />
								<span className="font-sans font-bold tracking-wide">ENTRAR</span>
							</button>
						)}
					</div>
				</div>

				<div className="lg:hidden flex items-center gap-4">
					<button onClick={() => setIsOpen(!isOpen)}>
						{isOpen ? <X size={28} /> : <Menu size={28} />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isOpen && (
				<div className="lg:hidden bg-white border-b border-black/10 p-6 flex flex-col gap-2 font-mono text-sm shadow-xl absolute w-full">
					<Link to="/loja" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors text-gray-500">
						LOJA
					</Link>
					<Link to="/campeonatos" onClick={() => setIsOpen(false)} className={`py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors ${location.pathname === '/campeonatos' ? 'text-orange-600 font-bold' : ''}`}>
						PAINEL
					</Link>
					<Link to="/campeonatos/jogos" onClick={() => setIsOpen(false)} className={`py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors ${location.pathname === '/campeonatos/jogos' ? 'text-orange-600 font-bold' : ''}`}>
						JOGOS
					</Link>
					<Link to="/campeonatos/times" onClick={() => setIsOpen(false)} className={`py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors ${location.pathname === '/campeonatos/times' ? 'text-orange-600 font-bold' : ''}`}>
						TIMES
					</Link>
					<Link to="/campeonatos/ranking" onClick={() => setIsOpen(false)} className={`py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors ${location.pathname === '/campeonatos/ranking' ? 'text-orange-600 font-bold' : ''}`}>
						RANKING
					</Link>

					{user && (
						<Link to="/campeonatos/minha-equipe" onClick={() => setIsOpen(false)} className={`py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors ${location.pathname === '/campeonatos/minha-equipe' ? 'text-orange-600 font-bold' : ''}`}>
							MINHA EQUIPE
						</Link>
					)}

					{(user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN' || user?.role === 'STORE_ADMIN') && (
						<Link to="/admin" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors text-orange-600 font-bold">
							ADMIN
						</Link>
					)}
					
					<div className="pt-2 mt-4 flex flex-col gap-3">
						{user ? (
							<Link to="/campeonatos/perfil" onClick={() => setIsOpen(false)} className="w-full bg-black text-white px-4 py-3 flex justify-center items-center gap-2 hover:bg-neutral-800 transition-colors">
								<UserIcon size={20} />
								<span className="font-sans font-bold tracking-wide uppercase">MINHA CONTA</span>
							</Link>
						) : (
							<button onClick={() => { setIsOpen(false); setIsLoginOpen(true); }} className="w-full bg-white border border-black text-black px-4 py-3 flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors">
								<UserIcon size={20} />
								<span className="font-sans font-bold tracking-wide">ENTRAR</span>
							</button>
						)}
					</div>
				</div>
			)}
			
			<LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
		</nav>
	);
}
