import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User as UserIcon, ChevronDown, Home, Trophy, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ifroLogo from "../assets/logos/logo-ifro-branca-white-branco.png.webp";
import federadaIcon from "../assets/logos/logo-sem-nome.png";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import LoginModal from "./LoginModal";
import DashboardModal from "./DashboardModal";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const moreRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();
	const { totalItems, setIsCartOpen } = useCart();
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isDashboardOpen, setIsDashboardOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
				setMoreOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Scroll to hash on load if present
	useEffect(() => {
		if (location.hash) {
			const id = location.hash.replace('#', '');
			setTimeout(() => {
				document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
			}, 100);
		}
	}, [location]);

	const handleScrollTo = (id: string) => {
		if (location.pathname !== '/') {
			navigate(`/#${id}`);
		} else {
			document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
		}
		setIsOpen(false);
		setMoreOpen(false);
	};

	return (
		<>
			{/* TOP NAVBAR */}
			<nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-black/5">
				<div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 lg:h-20 flex justify-between items-center">
					{/* Brand */}
					<Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer">
						<img src={federadaIcon} alt="Federada" className="h-10 lg:h-12 hover:scale-105 transition-transform" />
					</Link>

					{/* Desktop Menu */}
					<div className="hidden lg:flex items-center gap-8 font-mono text-sm">
						<Link to="/" className="hover:underline underline-offset-4">
							INÍCIO
						</Link>
						<Link to="/campeonatos" className="hover:underline underline-offset-4 text-orange-600 font-bold">
							CAMPEONATOS
						</Link>
						<Link to="/loja" className="hover:underline underline-offset-4">
							LOJA
						</Link>
						<Link to="/forum" className="hover:underline underline-offset-4">
							FÓRUM
						</Link>

						{/* Mais Dropdown */}
						<div className="relative" ref={moreRef}>
							<button 
								onClick={() => setMoreOpen(!moreOpen)}
								className="flex items-center gap-1 hover:underline underline-offset-4 uppercase outline-none"
							>
								MAIS <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
							</button>

							{moreOpen && (
								<div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white border border-black/10 shadow-lg min-w-[200px] flex flex-col py-2 animate-in fade-in duration-200">
									<Link to="/gallery" onClick={() => setMoreOpen(false)} className="px-6 py-3 hover:bg-gray-50 transition-colors">
										GALERIA
									</Link>
									<Link to="/caads" onClick={() => setMoreOpen(false)} className="px-6 py-3 hover:bg-gray-50 transition-colors">
										CAADS
									</Link>
									<button onClick={() => handleScrollTo('about')} className="px-6 py-3 text-left hover:bg-gray-50 transition-colors w-full">
										SOBRE
									</button>
									<div className="border-t border-gray-100 my-2 mx-4"></div>
									<div className="px-6 py-2 flex items-center justify-center">
										<img
											src={ifroLogo}
											alt="IFRO Logo"
											className="h-6 opacity-60 hover:opacity-100 transition-opacity invert"
										/>
									</div>
								</div>
							)}
						</div>

						{(user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN' || user?.role === 'STORE_ADMIN') && (
							<Link to="/admin" className="hover:underline underline-offset-4 text-orange-600 font-bold">
								ADMIN
							</Link>
						)}

						<div className="h-4 w-[1px] bg-gray-300 mx-2"></div>

						{/* Action Buttons */}
						<div className="flex items-center gap-4">
							{user ? (
								<Link to="/perfil" className="bg-black text-white px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors">
									<UserIcon size={16} />
									<span className="font-sans font-bold tracking-wide uppercase">{user.name.split(' ')[0]}</span>
								</Link>
							) : (
								<button onClick={() => setIsLoginOpen(true)} className="bg-white border border-black text-black px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors">
									<UserIcon size={20} />
									<span className="font-sans font-bold tracking-wide">ENTRAR</span>
								</button>
							)}
							
							<button onClick={() => setIsCartOpen(true)} className="bg-black text-white px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors relative">
								<ShoppingBag size={20} />
								<span className="font-sans font-bold tracking-wide">CARRINHO</span>
								{totalItems > 0 && (
									<span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-black shadow-sm">
										{totalItems}
									</span>
								)}
							</button>
						</div>
					</div>

					{/* Mobile Top Actions (Cart & More menu) */}
					<div className="lg:hidden flex items-center gap-4">
						<button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-700">
							<ShoppingBag size={22} />
							{totalItems > 0 && (
								<span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
									{totalItems}
								</span>
							)}
						</button>
						<button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-700">
							{isOpen ? <X size={26} /> : <Menu size={26} />}
						</button>
					</div>
				</div>

				{/* Mobile "More" Menu (Slides down from top when clicking hamburger) */}
				{isOpen && (
					<div className="lg:hidden bg-white border-b border-black/10 px-6 py-4 flex flex-col gap-1 font-mono text-sm shadow-xl absolute w-full z-40 max-h-[70vh] overflow-y-auto">
						<div className="font-bold text-gray-400 text-xs mb-2 mt-2">MAIS OPÇÕES</div>
						<Link to="/gallery" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors">
							GALERIA
						</Link>
						<Link to="/caads" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors">
							CAADS
						</Link>
						<button onClick={() => { handleScrollTo('about'); setIsOpen(false); }} className="py-3 w-full text-left border-b border-gray-50 active:bg-gray-50 transition-colors">
							SOBRE NÓS
						</button>

						{(user?.role === 'ADMIN' || user?.role === 'SPORTS_ADMIN' || user?.role === 'STORE_ADMIN') && (
							<Link to="/admin" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors text-orange-600 font-bold">
								PAINEL ADMIN
							</Link>
						)}
						
						<div className="pt-6 pb-2 flex justify-center items-center">
							<img
								src={ifroLogo}
								alt="IFRO Logo"
								className="h-6 opacity-60 invert"
							/>
						</div>
					</div>
				)}
			</nav>

			{/* MOBILE BOTTOM NAVIGATION BAR */}
			<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
				<div className="flex flex-row justify-around items-center h-[64px] px-1">
					
					{/* Home */}
					<Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname === '/' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>
						<Home size={22} className={location.pathname === '/' ? 'fill-orange-50' : ''} />
						<span className={`text-[9px] uppercase tracking-wider ${location.pathname === '/' ? 'font-black' : 'font-bold'}`}>Início</span>
					</Link>

					{/* Tournaments */}
					<Link to="/campeonatos" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.includes('/campeonatos') ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>
						<Trophy size={22} className={location.pathname.includes('/campeonatos') ? 'fill-orange-50' : ''} />
						<span className={`text-[9px] uppercase tracking-wider ${location.pathname.includes('/campeonatos') ? 'font-black' : 'font-bold'}`}>Torneios</span>
					</Link>

					{/* Forum */}
					<Link to="/forum" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.includes('/forum') ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>
						<MessageSquare size={22} className={location.pathname.includes('/forum') ? 'fill-orange-50' : ''} />
						<span className={`text-[9px] uppercase tracking-wider ${location.pathname.includes('/forum') ? 'font-black' : 'font-bold'}`}>Fórum</span>
					</Link>

					{/* Store */}
					<Link to="/loja" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.includes('/loja') ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>
						<ShoppingBag size={22} className={location.pathname.includes('/loja') ? 'fill-orange-50' : ''} />
						<span className={`text-[9px] uppercase tracking-wider ${location.pathname.includes('/loja') ? 'font-black' : 'font-bold'}`}>Loja</span>
					</Link>

					{/* Profile / Auth */}
					{user ? (
						<Link to="/perfil" className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.includes('/perfil') ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}>
							<UserIcon size={22} className={location.pathname.includes('/perfil') ? 'fill-orange-50' : ''} />
							<span className={`text-[9px] uppercase tracking-wider ${location.pathname.includes('/perfil') ? 'font-black' : 'font-bold'}`}>Perfil</span>
						</Link>
					) : (
						<button onClick={() => setIsLoginOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors text-slate-500 hover:text-slate-900">
							<UserIcon size={22} />
							<span className="text-[9px] font-bold uppercase tracking-wider">Entrar</span>
						</button>
					)}

				</div>
			</div>
			
			<LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
			<DashboardModal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
		</>
	);
}
