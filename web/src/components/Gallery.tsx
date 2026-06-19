import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FadeIn from './FadeIn';
import DecryptText from './DecryptText';
import { API_URL } from '../config';

export default function Gallery() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/cms/instagram`)
      .then(res => res.json())
      .then(data => {
        setPosts(data.slice(0, 2)); // Mostra apenas os 2 últimos
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load instagram feed', err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-24 bg-neutral-50 border-t border-black" id="gallery">
      <div className="max-w-7xl mx-auto px-6">
        
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4 uppercase">
                <DecryptText text="INSTAGRAM FEED" className="glitch font-bold text-black" />
            </h2>
            <p className="text-gray-500 font-sans text-lg">
                <DecryptText text="Acompanhe as últimas novidades direto da fonte." speed={10} />
            </p>
          </div>
        </FadeIn>

        {/* Grid de Posts da API */}
        <div className="grid md:grid-cols-2 gap-12 justify-items-center">
            {loading ? (
                <div className="col-span-2 py-20 text-center font-mono text-gray-400">CARREGANDO DADOS DA REDE...</div>
            ) : posts.length === 0 ? (
                <div className="col-span-2 py-20 text-center font-mono text-gray-400">NENHUM SINAL DETECTADO. TENTE NOVAMENTE MAIS TARDE.</div>
            ) : (
                posts.map((post, index) => (
                    <FadeIn key={post.id} delay={index * 200} className="w-full max-w-[540px]">
                        <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block bg-white border border-gray-200 shadow-xl rounded-sm overflow-hidden group hover:border-black transition-colors duration-300">
                            {/* Fake Window Header */}
                            <div className="bg-neutral-100 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                                <span className="font-mono text-[10px] text-gray-500 tracking-widest group-hover:text-black transition-colors line-clamp-1">
                                    {post.title.toUpperCase() || `IG_STREAM_DATA::00${index + 1}`}
                                </span>
                                <div className="flex gap-1.5 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-red-400 transition-colors"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-yellow-400 transition-colors"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-green-400 transition-colors"></div>
                                </div>
                            </div>
                            
                            {/* Image Container */}
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <img 
                                    src={post.url} 
                                    alt={post.title}
                                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 group-active:grayscale-0 group-active:scale-105 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 flex items-center justify-center transition-all duration-300">
                                    <span className="text-white font-bold tracking-widest border border-white px-4 py-2">VER NO INSTAGRAM</span>
                                </div>
                            </div>
                        </a>
                    </FadeIn>
                ))
            )}
        </div>

        <div className="mt-16 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
                to="/gallery" 
                className="inline-flex items-center justify-center gap-4 bg-black text-white px-8 py-4 font-bold hover:bg-neutral-800 transition-all w-full sm:w-auto"
            >
                VER GALERIA INTERATIVA
            </Link>
            <a 
                href="https://instagram.com/federadaifro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-4 border border-black text-black px-8 py-4 font-bold hover:bg-gray-100 transition-all w-full sm:w-auto"
            >
                PERFIL NO INSTAGRAM
            </a>
        </div>

      </div>
    </section>
  );
}
