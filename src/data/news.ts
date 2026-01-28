export interface NewsItem {
  id: number;
  type: 'IMPORTANTE' | 'NOVIDADE' | 'EVENTO' | 'AVISO';
  date: string;
  title: string;
  excerpt: string;
  link?: string;
}

export const newsData: NewsItem[] = [
  {
    id: 1,
    type: 'IMPORTANTE',
    date: '25/01/2026',
    title: 'RENOVAÇÃO DE MATRÍCULA',
    excerpt: 'Prazo final para rematrícula via SUAP. Não perca o acesso ao servidor.',
    link: '#'
  },
  {
    id: 2,
    type: 'NOVIDADE',
    date: '10/02/2026',
    title: 'PARCERIA: ALURA & ORACLE',
    excerpt: 'Novos tokens de acesso para cursos de Cloud Computing disponíveis para membros.',
    link: '#'
  },
  {
    id: 3,
    type: 'EVENTO',
    date: '20/02/2026',
    title: 'HACKATHON IFRO: INSCRIÇÕES',
    excerpt: 'Monte seu time e participe. Stack sugerida: React/Node.',
    link: '#'
  }
];
