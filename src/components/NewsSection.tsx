import { Calendar, ArrowUpRight } from 'lucide-react';
import { newsData } from '../data/news';
import FadeIn from './FadeIn';

export default function NewsSection() {
  return (
    <section className="py-24 bg-neutral-50 border-t border-black" id="news">
      <div className="max-w-7xl mx-auto px-6">
        
        <FadeIn>
            <div className="flex items-center gap-4 mb-12">
                <div className="w-3 h-3 bg-red-500 animate-pulse rounded-full"></div>
                <h2 className="text-4xl tracking-normal">CENTRAL DE NOTÍCIAS</h2>
                <span className="font-mono text-xs text-gray-400">ATUALIZAÇÕES DO C.A.</span>
            </div>
        </FadeIn>

        <div className="grid gap-6">
            {newsData.map((item, i) => (
                <FadeIn key={item.id} delay={i * 100}>
                    <div className="group relative bg-white border border-gray-200 p-6 hover:border-black transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-black transition-colors"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 font-sans text-xs font-bold tracking-wide">
                                    <span className={`px-2 py-1 ${item.type === 'IMPORTANTE' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-1 font-medium">
                                        <Calendar size={12} /> {item.date}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold group-hover:text-gray-600 transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 max-w-2xl font-sans text-lg">
                                    {item.excerpt}
                                </p>
                            </div>

                            <button className="flex items-center gap-2 font-bold text-sm border border-black px-6 py-3 hover:bg-black hover:text-white transition-all whitespace-nowrap">
                                LER MAIS <ArrowUpRight size={16} />
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


