import { Calendar, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import FadeIn from './FadeIn';

export default function NewsSection() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/cms/news`)
      .then(res => {
        if (!res.ok) throw new Error('Falha');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setNews(data);
        else setNews([]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar notícias:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-[#f5f5f5] text-black">
        <div className="max-w-6xl mx-auto flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-neutral-50 border-t border-black" id="news">
      <div className="max-w-7xl mx-auto px-6">
        
        <FadeIn>
            <div className="flex items-center gap-4 mb-12">
                <div className="w-3 h-3 bg-red-500 animate-pulse rounded-full"></div>
                <h2 className="text-4xl tracking-normal">
                    <span className="glitch" data-text="CENTRAL DE NOTÍCIAS">CENTRAL DE NOTÍCIAS</span>
                </h2>
                <span className="font-mono text-xs text-gray-400">ATUALIZAÇÕES DO C.A.</span>
            </div>
        </FadeIn>

        <div className="grid gap-6">
            {news.map((item, i) => (
                <FadeIn key={item.id} delay={i * 100}>
                    <div className="group relative bg-white border border-gray-200 p-6 hover:border-black transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-black transition-colors"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 font-sans text-xs font-bold tracking-wide">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1">
                                        AVISO
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-1 font-medium">
                                        <Calendar size={12} /> {item.dateLabel || 'Recente'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold group-hover:text-gray-600 transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <p className={`text-gray-600 max-w-2xl font-sans text-lg ${expandedNews === item.id ? '' : 'line-clamp-3'}`}>
                                    {item.content}
                                </p>
                            </div>

                            <button 
                                onClick={() => setExpandedNews(expandedNews === item.id ? null : item.id)}
                                className="flex items-center gap-2 font-bold text-sm border border-black px-6 py-3 hover:bg-black hover:text-white transition-all whitespace-nowrap">
                                {expandedNews === item.id ? 'LER MENOS' : 'LER MAIS'} <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </FadeIn>
            ))}
        </div>
      </div>
    </section>
  );
}
