import ursoAndando from "../assets/urso-polar-andando.gif";

export default function SectionSeparator() {
	return (
		<div className="relative z-30 w-full">
			{/* Bear Wrapper - Permite vazamento vertical mas corta horizontal */}
			<div className="absolute -top-10 left-0 w-full h-12 pointer-events-none overflow-x-clip">
				<div className="animate-walk-bear absolute bottom-[-4px] left-0">
					<img
						src={ursoAndando}
						alt="Urso Polar"
						className="h-12 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] scale-x-[-1]"
					/>
				</div>
			</div>

			{/* Black Bar with Marquee - Oculta o texto lateralmente */}
			<div className="bg-black text-white py-3 select-none border-t border-b border-white/10 overflow-hidden relative">
				<div className="flex whitespace-nowrap animate-marquee">
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
						<div
							key={i}
							className="flex items-center gap-8 mx-4 opacity-80 font-mono text-sm tracking-widest"
						>
							<span className="text-neon-cyan">///</span>
							<span>NOVA COLEÇÃO 2026</span>
							<span className="text-neon-cyan">///</span>
							<span>LOJA OFICIAL</span>
							<span className="text-neon-cyan">///</span>
							<span>FEDERADA ADS</span>
							<span className="text-neon-cyan">///</span>
							<span>TECH & SPORTS</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
