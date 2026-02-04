import {
	GraduationCap,
	Users,
	Zap,
	Trophy,
	Target,
	Instagram,
	User,
} from "lucide-react";
import FadeIn from "./FadeIn";

// Imports de imagens do CAADS
import hyagoImg from "../assets/membros-ca/hyago.png";
import pedroImg from "../assets/membros-ca/pedro-henrique.png";
import nathaliaImg from "../assets/membros-ca/nathalia-lopes.png";
import kauaneImg from "../assets/membros-ca/kaune-izidoro.png";
import tainaraImg from "../assets/membros-ca/tainara.png";
import vanessaImg from "../assets/membros-ca/vanessa.jpeg";
import annaImg from "../assets/membros-ca/anna-beatriz.png";
import gabrielImg from "../assets/membros/gabriel.jpg";
import filipeImg from "../assets/membros-ca/filipe.png";
import guilhermeImg from "../assets/membros-ca/guilherme.png";
import augustoImg from "../assets/membros-ca/augusto.png";
import thallytaImg from "../assets/membros-ca/Thallyta.png";

const boardMembers = [
	{
		role: "PRESIDENTE",
		name: "Hyago Alves",
		image: hyagoImg,
		instagram: "https://instagram.com/hyagoalvs",
		col: "col-span-1 md:col-span-2",
	},
	{
		role: "VICE-PRESIDENTE",
		name: "Pedro Batista",
		image: pedroImg,
		instagram: "https://instagram.com/phmelobatista",
		col: "col-span-1 md:col-span-2",
	},
	{
		role: "SECRETÁRIO GERAL",
		name: "Augusto Ignácio",
		image: augustoImg,
		instagram: "https://instagram.com/caadsifro",
	},
	{
		role: "VICE-SECRETÁRIA GERAL",
		name: "Nathalia Lopes",
		image: nathaliaImg,
		instagram: "https://instagram.com/_nathallia",
	},
	{
		role: "DIRETORA FINANCEIRA",
		name: "Kauane Izidoro",
		image: kauaneImg,
		instagram: "https://instagram.com/kim_izidoro",
	},
	{
		role: "VICE-DIRETORA FINANCEIRA",
		name: "Tainara Leal",
		image: tainaraImg,
		instagram: "https://instagram.com/tainaraa_ll",
	},
	{
		role: "DIR. MARKETING & IMPRENSA",
		name: "Vanessa Mikaelly",
		image: vanessaImg,
		instagram: "https://instagram.com/vssmky",
	},
	{
		role: "VICE-DIR. MKT & IMPRENSA",
		name: "Anna Beatriz",
		image: annaImg,
		instagram: "https://instagram.com/caadsifro",
	},
	{
		role: "DIR. EVENTOS & ESPORTES",
		name: "Gabriel Lucena",
		image: gabrielImg,
		instagram: "https://instagram.com/biels_l",
	},
	{
		role: "VICE-DIR. EVENTOS",
		name: "Filipe Lopes",
		image: filipeImg,
		instagram: "https://instagram.com/fimaciel13",
	},
	{
		role: "DIR. RELAÇÕES ACADÊMICAS",
		name: "Guilherme Tavares",
		image: guilhermeImg,
		instagram: "https://instagram.com/caadsifro",
	},
	{
		role: "VICE-DIR. REL. ACADÊMICAS",
		name: "Thállyta Amorim",
		image: thallytaImg,
		instagram: "https://instagram.com/amorim._tata",
	},
];

const proposals = [
	{
		id: "01",
		title: "HORAS_COMPLEMENTARES",
		desc: "Maximização de eventos técnicos e workshops para validação acadêmica.",
		icon: <Zap size={20} />,
	},
	{
		id: "02",
		title: "INTEGRAÇÃO_SOCIAL",
		desc: "Festas e jogos inter-turmas para fortalecimento do networking.",
		icon: <Users size={20} />,
	},
	{
		id: "03",
		title: "SAÚDE_&_ESPORTE",
		desc: "Atividades físicas focadas em união, saúde mental e espírito de equipe.",
		icon: <Trophy size={20} />,
	},
];

export default function CAADS() {
	return (
		<section
			className="py-24 bg-white text-black border-t border-black relative overflow-hidden"
			id="caads"
		>
			{/* Background Decor */}
			<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

			<div className="max-w-7xl mx-auto px-6 relative z-10">
				<FadeIn>
					<div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-black pb-8">
						<div className="max-w-2xl">
							<div className="flex items-center gap-2 text-blue-600 font-mono text-xs mb-4 uppercase tracking-widest">
								<span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
								Academic_Core_System
							</div>
							<h2 className="text-5xl md:text-7xl tracking-tighter mb-6 font-bold">
								CAADS<span className="text-blue-600">.</span>
							</h2>
							              <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-800">
							                Centro Acadêmico de Análise e Desenvolvimento de Sistemas.
							                <br />
							                <span className="text-gray-500 text-base font-normal">
							                  Representação estudantil oficial do IFRO Campus Ji-Paraná. Nota 5 no MEC.
							                </span>
							              </p>
						</div>

						            <div className="hidden md:block text-right font-mono text-xs text-gray-400">
						              <p>ESTABLISHED: 2025</p>
						              <p>LOCATION: IFRO JI-PARANÁ</p>
						              <div className="mt-2 flex flex-col items-end gap-1">
						                <span className="bg-yellow-500/10 text-yellow-600 px-2 py-0.5 border border-yellow-500/20 font-bold">
						                  NOTA 5 NO MEC
						                </span>
						                <a 
						                  href="https://instagram.com/ifro.jipa" 
						                  target="_blank" 
						                  rel="noopener noreferrer"
						                  className="hover:text-black transition-colors"
						                >
						                  @IFRO.JIPA
						                </a>
						                <a 
						                  href="https://instagram.com/caadsifro" 
						                  target="_blank" 
						                  rel="noopener noreferrer"
						                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
						                >
						                  <Instagram size={12} />
						                  @CAADSIFRO
						                </a>
						              </div>
						            </div>					</div>
				</FadeIn>

				<div className="grid md:grid-cols-12 gap-12">
					{/* LEFT COLUMN: PROPOSALS (The Mission) */}
					<div className="md:col-span-4 space-y-8">
						<FadeIn delay={100}>
							<h3 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
								<Target size={14} className="text-blue-600" />
								Diretrizes_de_Gestão
							</h3>

							<div className="space-y-4">
								{proposals.map((prop) => (
									<div
										key={prop.id}
										className="group border border-gray-200 p-6 hover:border-black hover:bg-neutral-50 transition-all duration-300"
									>
										<div className="flex items-start justify-between mb-3">
											<span className="font-mono text-[10px] text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5">
												PROTOCOL_{prop.id}
											</span>
											<div className="text-gray-400 group-hover:text-blue-600 transition-colors">
												{prop.icon}
											</div>
										</div>
										<h4 className="font-sans font-bold text-base mb-2 text-black tracking-normal">
											{prop.title.replace(/_/g, " ")}
										</h4>
										<p className="text-sm text-gray-600 leading-relaxed font-sans">
											{prop.desc}
										</p>
									</div>
								))}
							</div>

							<div className="mt-8 p-6 bg-black text-white relative overflow-hidden group">
								<div className="absolute top-0 right-0 p-4 opacity-20">
									<GraduationCap size={80} />
								</div>
								<p className="font-mono text-[10px] text-gray-400 mb-2">
									MANIFESTO
								</p>
								<p className="text-sm font-medium leading-relaxed relative z-10">
									"Construir um curso mais participativo, leve e cheio de
									oportunidades para todos."
								</p>
								<div className="mt-4 w-8 h-1 bg-blue-600"></div>
							</div>
						</FadeIn>
					</div>

					{/* RIGHT COLUMN: DIRECTORY (The Roster) */}
					<div className="md:col-span-8">
						<FadeIn delay={200}>
							<h3 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
								<Users size={14} className="text-blue-600" />
								Corpo_Diretivo_2026
							</h3>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{boardMembers.map((member, i) => (
									<div
										key={i}
										className={`flex items-center gap-4 border border-gray-200 p-3 hover:border-blue-600 hover:bg-blue-50/30 transition-all group relative overflow-hidden ${member.col || ""}`}
									>
										{/* Avatar Area */}
										<div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-gray-100 border border-gray-300 overflow-hidden relative group-hover:border-blue-400 transition-colors">
											{member.image ? (
												<img
													src={member.image}
													alt={member.name}
													className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-gray-300">
													<User size={24} />
												</div>
											)}
										</div>

										{/* Info Area */}
										<div className="flex-1 min-w-0">
											<p className="font-mono text-[9px] text-gray-400 uppercase mb-0.5 tracking-wider group-hover:text-blue-600 transition-colors truncate">
												{member.role}
											</p>
											<p className="font-bold text-sm md:text-base truncate">
												{member.name}
											</p>
										</div>

										{/* Social Action */}
										<a
											href={member.instagram}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 rounded-full transition-all"
										>
											<Instagram size={18} />
										</a>

										{/* Decorative Corner */}
										<div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
									</div>
								))}
							</div>
						</FadeIn>
					</div>
				</div>
			</div>
		</section>
	);
}
