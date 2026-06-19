import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import ifroLogo from "../assets/logos/logo-ifro-branca-white-branco.png.webp";
import federadaIcon from "../assets/logos/logo-sem-nome.png";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import LoginModal from "./LoginModal";
import DashboardModal from "./DashboardModal";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { user } = useAuth();
	const { totalItems, setIsCartOpen } = useCart();
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isDashboardOpen, setIsDashboardOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

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
	};

	return (
		<nav className="fixed w-full z-50 bg-white/90 backdrop-blur border-b border-black/5">
			<div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
				{/* Brand */}
				<div className="flex items-center gap-2">
					<img src={federadaIcon} alt="Federada" className="h-12" />
				</div>

				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-8 font-mono text-sm">
					<Link to="/" className="hover:underline underline-offset-4">
						INÍCIO
					</Link>
					<Link to="/forum" className="hover:underline underline-offset-4">
						FÓRUM
					</Link>
					<Link to="/gallery" className="hover:underline underline-offset-4">
						GALERIA
					</Link>
					<button onClick={() => handleScrollTo('caads')} className="hover:underline underline-offset-4 cursor-pointer">
						CAADS
					</button>
					<Link to="/loja" className="hover:underline underline-offset-4">
						LOJA
					</Link>
					<button onClick={() => handleScrollTo('about')} className="hover:underline underline-offset-4 cursor-pointer">
						SOBRE
					</button>

					<div className="h-4 w-[1px] bg-gray-300 mx-2"></div>

					<img
						src={ifroLogo}
						alt="IFRO Logo"
						className="h-8 opacity-80 hover:opacity-100 transition-opacity invert"
					/>

					{user ? (
						<button onClick={() => setIsDashboardOpen(true)} className="bg-black text-white px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors">
							<UserIcon size={16} />
							<span className="font-sans font-bold tracking-wide uppercase">{user.name.split(' ')[0]}</span>
						</button>
					) : (
						<button onClick={() => setIsLoginOpen(true)} className="bg-white border border-black text-black px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors">
							<UserIcon size={16} />
							<span className="font-sans font-bold tracking-wide">LOGIN</span>
						</button>
					)}
					
					<button onClick={() => setIsCartOpen(true)} className="bg-black text-white px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors relative">
						<ShoppingBag size={16} />
						<span className="font-sans font-bold tracking-wide">CARRINHO</span>
						{totalItems > 0 && (
							<span className="absolute -top-2 -right-2 bg-[#00f0ff] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-black shadow-sm">
								{totalItems}
							</span>
						)}
					</button>
				</div>

				<div className="md:hidden flex items-center gap-4">
					<button onClick={() => setIsCartOpen(true)} className="relative p-2">
						<ShoppingBag size={20} />
						{totalItems > 0 && (
							<span className="absolute top-0 right-0 bg-[#00f0ff] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
								{totalItems}
							</span>
						)}
					</button>
					<button onClick={() => setIsOpen(!isOpen)}>
						{isOpen ? <X /> : <Menu />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isOpen && (
				<div className="md:hidden bg-white border-b border-black/10 p-6 flex flex-col gap-2 font-mono text-sm">
					<Link to="/" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors">
						INÍCIO
					</Link>
					<Link to="/forum" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors">
						FÓRUM
					</Link>
					<Link to="/gallery" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors">
						GALERIA
					</Link>
					<button onClick={() => handleScrollTo('caads')} className="py-3 w-full text-left border-b border-gray-50 active:bg-gray-50 transition-colors">
						CAADS
					</button>
					<Link to="/loja" onClick={() => setIsOpen(false)} className="py-3 w-full border-b border-gray-50 active:bg-gray-50 transition-colors">
						LOJA
					</Link>
					<button onClick={() => handleScrollTo('about')} className="py-3 w-full text-left border-b border-gray-50 active:bg-gray-50 transition-colors">
						SOBRE
					</button>
					<div className="pt-4 border-t border-gray-100 flex justify-between items-center">
						<img
							src={ifroLogo}
							alt="IFRO Logo"
							className="h-6 opacity-60 invert"
						/>
					</div>
					
					<div className="pt-2">
					    {user ? (
							<button onClick={() => { setIsOpen(false); setIsDashboardOpen(true); }} className="w-full bg-black text-white px-4 py-3 flex justify-center items-center gap-2 hover:bg-neutral-800 transition-colors">
								<UserIcon size={16} />
								<span className="font-sans font-bold tracking-wide uppercase">MINHA CONTA</span>
							</button>
						) : (
							<button onClick={() => { setIsOpen(false); setIsLoginOpen(true); }} className="w-full bg-white border border-black text-black px-4 py-3 flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors">
								<UserIcon size={16} />
								<span className="font-sans font-bold tracking-wide">LOGIN</span>
							</button>
						)}
					</div>
				</div>
			)}
			
			<LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
			<DashboardModal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
		</nav>
	);
}
