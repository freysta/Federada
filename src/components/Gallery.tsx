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
        <div className="grid md:grid-cols-2 gap-8 justify-items-center">
            
            {/* Post 1 - Campeonato de Jogos Eletrônicos (CAADS) */}
            <FadeIn delay={100} className="w-full max-w-[540px]">
                <blockquote 
                    className="instagram-media" 
                    data-instgrm-captioned
                    data-instgrm-permalink="https://www.instagram.com/p/DNYkM3IpT1U/" 
                    data-instgrm-version="14"
                    style={{ background: '#FFF', border: '0', borderRadius: '3px', boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', width: 'calc(100% - 2px)' }}
                >
                </blockquote>
            </FadeIn>

            {/* Post 2 - Post Recente Federada */}
            <FadeIn delay={300} className="w-full max-w-[540px]">
                <blockquote 
                    className="instagram-media" 
                    data-instgrm-captioned
                    data-instgrm-permalink="https://www.instagram.com/p/DT6UdNAjmQV/" 
                    data-instgrm-version="14"
                    style={{ background: '#FFF', border: '0', borderRadius: '3px', boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', width: 'calc(100% - 2px)' }}
                >
                </blockquote>
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
