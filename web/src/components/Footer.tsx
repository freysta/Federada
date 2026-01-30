import { ArrowUpRight, MapPin, Terminal, Cpu, Wifi } from "lucide-react";
import ifroLogo from "../assets/logos/logo-ifro-branca-white-branco.png.webp";
import federadaLogo from "../assets/logos/logo-mimalista-federada.png";

export default function Footer() {
	return (
		<footer className="bg-black text-white pt-0 overflow-hidden relative border-t border-white/20">
			{/* Decorative Grid Background */}
			<div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
				style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}>
			</div>

			{/* Massive Background Signature - Fixed Stroke */}
			<div className="absolute bottom-[-2%] left-0 w-full select-none pointer-events-none opacity-5 z-0">
				<h1 className="text-[18vw] leading-none font-bold text-center tracking-tighter text-transparent" style={{ WebkitTextStroke: '1px white' }}>
					FEDERADA
				</h1>
			</div>

			{/* Top System Bar */}
			<div className="bg-white/5 border-b border-white/10 px-6 py-2 flex justify-between items-center font-mono text-[10px] md:text-xs tracking-widest z-10 relative">
				<div className="flex items-center gap-4">
					<span className="flex items-center gap-2 text-neon-cyan">
						<Terminal size={12} />
						SESSÃO_TERMINAL_ATIVA
					</span>
					<span className="hidden md:inline text-gray-500">USUÁRIO: VISITANTE</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="animate-pulse text-green-500">● AO VIVO</span>
					<span>VERSÃO: v2.0.26</span>
				</div>
			</div>

			<div className="max-w-7xl mx-auto border-x border-white/10 relative z-10 bg-black/50 backdrop-blur-sm">
				<div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
					
					{/* Brand & Identity (Cols 1-5) */}
					<div className="md:col-span-5 p-8 md:p-12 space-y-8">
						<div className="flex items-start justify-between">
							<img
								src={federadaLogo}
								alt="Federada Logo"
								className="h-14 brightness-0 invert opacity-90"
							/>
							<div className="text-right">
								<h2 className="font-mono text-xs text-gray-500 mb-1">Afiliação</h2>
								<img
									src={ifroLogo}
									alt="IFRO Logo"
									className="h-8 opacity-60 ml-auto grayscale hover:grayscale-0 transition-all"
								/>
							</div>
						</div>

						{/* JSON Identity Block */}
						<div className="font-mono text-xs text-gray-400 bg-white/5 p-4 rounded border border-white/10 overflow-hidden">
							<p className="text-gray-600 mb-2">// MANIFESTO_ENTIDADE.JSON</p>
							<p><span className="text-purple-400">const</span> <span className="text-yellow-300">federada</span> = {"{"}</p>
							<div className="pl-4 space-y-1">
								<p>campus: <span className="text-green-400">"IFRO Ji-Paraná"</span>,</p>
								<p>foco: <span className="text-green-400">["Tecnologia", "Esportes", "Integração"]</span>,</p>
								<p>fundação: <span className="text-orange-400">2024</span>,</p>
								<p>status: <span className="text-blue-400">"ATIVO"</span></p>
							</div>
							<p>{"};"}</p>
						</div>
					</div>

					{/* Navigation (Cols 6-9) */}
					<div className="md:col-span-3 md:col-start-6 p-8 md:p-12 flex flex-col justify-between">
						<div>
							<h3 className="font-mono text-xs text-neon-cyan mb-8 border-b border-neon-cyan/30 pb-2 w-max">
								// NAVEGAÇÃO_SISTEMA
							</h3>
							<ul className="space-y-4 font-mono text-sm">
								{[
									{ name: "INÍCIO", path: "/" },
									{ name: "LOJA", path: "#store" },
									{ name: "NOTÍCIAS", path: "#news" },
									{ name: "ACADÊMICO", path: "#caads" },
									{ name: "SOBRE", path: "#about" }
								].map((item, i) => (
									<li key={i}>
										<a
											href={item.path}
											className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
										>
											<span className="opacity-0 group-hover:opacity-100 text-neon-cyan transition-opacity">{">"}</span>
											<span className="group-hover:translate-x-1 transition-transform">/{item.name}</span>
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Connection (Cols 10-12) */}
					<div className="md:col-span-4 p-8 md:p-12">
						<h3 className="font-mono text-xs text-neon-cyan mb-8 border-b border-neon-cyan/30 pb-2 w-max">
							// CONEXÕES
						</h3>
						<div className="space-y-6">
							<a
								href="https://instagram.com/federadaifro"
								target="_blank"
								rel="noopener noreferrer" 
								className="block bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all group"
							>
								<div className="flex justify-between items-center mb-2">
									<span className="font-mono text-xs text-gray-500">PROTOCOLO: INSTAGRAM</span>
									<ArrowUpRight size={14} className="text-gray-500 group-hover:text-white" />
								</div>
								<div className="font-bold text-lg">@FEDERADAIFRO</div>
							</a>

							<a
								href="#"
								className="block bg-white/5 hover:bg-white/10 border border-white/10 p-4 transition-all group"
							>
								<div className="flex justify-between items-center mb-2">
									<span className="font-mono text-xs text-gray-500">PROTOCOLO: WHATSAPP</span>
									<ArrowUpRight size={14} className="text-gray-500 group-hover:text-white" />
								</div>
								<div className="font-bold text-lg">CONTATO DIRETO</div>
							</a>
						</div>
					</div>
				</div>

				{/* Footer Status Bar */}
				<div className="border-t border-white/10 p-4 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] text-gray-600 uppercase bg-black relative z-10">
					<div className="flex gap-6">
						<div className="flex items-center gap-2">
							<MapPin size={10} />
							<span>JI-PARANÁ :: RO</span>
						</div>
						<div className="flex items-center gap-2 hidden md:flex">
							<Cpu size={10} />
							<span>MEM: 64%</span>
						</div>
						<div className="flex items-center gap-2 hidden md:flex">
							<Wifi size={10} />
							<span>LATÊNCIA: 24ms</span>
						</div>
					</div>
					
					<div className="text-center md:text-right flex flex-col md:items-end gap-1">
						<span>© 2026 SISTEMA FEDERADA. TODOS OS DIREITOS RESERVADOS.</span>
						<a 
							href="https://wa.me/5569993242656" 
							target="_blank" 
							rel="noopener noreferrer"
							className="text-[9px] text-gray-700 hover:text-neon-cyan transition-colors tracking-widest"
						>
							DEVELOPED BY IAD TECH_
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
