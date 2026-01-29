export interface NewsItem {
	id: number;
	type: "IMPORTANTE" | "NOVIDADE" | "EVENTO" | "AVISO";
	date: string;
	title: string;
	excerpt: string;
	link?: string;
}

export const newsData: NewsItem[] = [
	{
		id: 1,
		type: "IMPORTANTE",
		date: "04/02/2026",
		title: "RECEPÇÃO DOS ALUNOS",
		excerpt:
			"ACOMPANHE A RECEPÇÃO E ACOLHIMENTO DOS NOVOS ALUNOS DO NOSSO CURSO.",
		link: "#",
	},
];
