import { useEffect } from 'react';
import FadeIn from './FadeIn';

export default function Gallery() {
  useEffect(() => {
    // Carrega o script do Instagram se ele ainda não existir
    if (!document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Se já existir, força o re-processamento do post
      // @ts-ignore
      if (window.instgrm) {
        // @ts-ignore
        window.instgrm.Embeds.process();
      }
    }
  }, []);

  return (
    <section className="py-24 bg-neutral-50 border-t border-black" id="gallery">
      <div className="max-w-7xl mx-auto px-6">
        
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4 uppercase">
                <span className="glitch" data-text="INSTAGRAM FEED">INSTAGRAM FEED</span>
            </h2>
            <p className="text-gray-500 font-sans text-lg">Acompanhe as últimas novidades direto da fonte.</p>
          </div>
        </FadeIn>

        {/* Grid de Posts Incorporados */}
        <div className="grid md:grid-cols-2 gap-12 justify-items-center">
            
            {/* Post 1 - Container Estilizado */}
            <FadeIn delay={100} className="w-full max-w-[540px]">
                <div className="bg-white border border-gray-200 shadow-xl rounded-sm overflow-hidden group hover:border-black transition-colors duration-300">
                    {/* Fake Window Header */}
                    <div className="bg-neutral-100 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                        <span className="font-mono text-[10px] text-gray-500 tracking-widest group-hover:text-black transition-colors">
                            IG_STREAM_DATA::001
                        </span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-red-400 transition-colors"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-yellow-400 transition-colors"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-green-400 transition-colors"></div>
                        </div>
                    </div>
                    
                    {/* Embed Wrapper */}
                    <div className="p-1 bg-white">
                        <blockquote 
                            className="instagram-media" 
                            data-instgrm-captioned
                            data-instgrm-permalink="https://www.instagram.com/p/DNYkM3IpT1U/" 
                            data-instgrm-version="14"
                            style={{ background: '#FFF', border: '0', borderRadius: '3px', boxShadow: 'none', margin: '0', width: '100%', minWidth: '100%' }}
                        >
                        </blockquote>
                    </div>
                </div>
            </FadeIn>

            {/* Post 2 - Container Estilizado */}
            <FadeIn delay={300} className="w-full max-w-[540px]">
                <div className="bg-white border border-gray-200 shadow-xl rounded-sm overflow-hidden group hover:border-black transition-colors duration-300">
                     {/* Fake Window Header */}
                     <div className="bg-neutral-100 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                        <span className="font-mono text-[10px] text-gray-500 tracking-widest group-hover:text-black transition-colors">
                            IG_STREAM_DATA::002
                        </span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-red-400 transition-colors"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-yellow-400 transition-colors"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-green-400 transition-colors"></div>
                        </div>
                    </div>

                    <div className="p-1 bg-white">
                        <blockquote 
                            className="instagram-media" 
                            data-instgrm-captioned
                            data-instgrm-permalink="https://www.instagram.com/p/DT6UdNAjmQV/" 
                            data-instgrm-version="14"
                            style={{ background: '#FFF', border: '0', borderRadius: '3px', boxShadow: 'none', margin: '0', width: '100%', minWidth: '100%' }}
                        >
                        </blockquote>
                    </div>
                </div>
            </FadeIn>

        </div>

        <div className="mt-16 text-center">
            <a 
                href="https://instagram.com/federadaifro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-black text-white px-8 py-4 font-bold hover:bg-neutral-800 transition-all"
            >
                VER PERFIL COMPLETO NO INSTAGRAM
            </a>
        </div>

      </div>
    </section>
  );
}
