import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_URL } from "../config";
import { Calendar, MessageSquare, ChevronRight, User, Terminal } from "lucide-react";
import FadeIn from "../components/FadeIn";

export default function Forum() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    fetch(`${API_URL}/cms/news`)
      .then(res => {
        if (!res.ok) throw new Error('Falha');
        return res.json();
      })
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar notícias do fórum:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <FadeIn>
            <div className="mb-16 border-b-2 border-black pb-8">
              <div className="flex items-center gap-3 mb-4">
                <Terminal size={24} className="text-blue-600" />
                <span className="font-mono text-sm tracking-widest text-blue-600 font-bold">// SECURE_COM_CHANNEL</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-normal leading-none mb-4">
                Fórum <span className="text-transparent stroke-text">Atlética</span>
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Notícias, atualizações, debates e comunicados oficiais.
              </p>
            </div>
          </FadeIn>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {news.length === 0 ? (
                <div className="border border-dashed border-gray-400 p-12 text-center font-mono text-gray-500">
                  NENHUMA TRANSMISSÃO ENCONTRADA.
                </div>
              ) : (
                news.map((item, index) => (
                  <FadeIn key={item.id} delay={index * 100}>
                    <article className="bg-white border border-black p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group">
                      
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 mb-6 font-mono text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span className="bg-black text-white px-3 py-1 flex items-center gap-2">
                          <MessageSquare size={12} />
                          COMUNICADO
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar size={12} />
                          {item.dateLabel || new Date().toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <User size={12} />
                          DIRETORIA
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h2>

                      {/* Content */}
                      <div className="prose prose-lg max-w-none text-gray-700 font-sans leading-relaxed mb-8">
                        {item.content.split('\n').map((paragraph: string, i: number) => (
                          <p key={i} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                      
                      {/* Interaction (Fake for now, adds to immersion) */}
                      <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-mono text-xs text-gray-400">
                          {Math.floor(Math.random() * 50) + 10} VIEWS
                        </span>
                        <button className="flex items-center gap-2 font-bold text-sm hover:text-blue-600 transition-colors">
                          PARTICIPAR DA DISCUSSÃO <ChevronRight size={16} />
                        </button>
                      </div>

                    </article>
                  </FadeIn>
                ))
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
