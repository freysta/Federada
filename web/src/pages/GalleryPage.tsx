import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FadeIn from "../components/FadeIn";
import { X, ZoomIn, Instagram, Share2, Camera } from "lucide-react";

// Mock data for the interactive gallery
const galleryItems = [
  { id: 1, type: "image", url: "https://picsum.photos/seed/1/800/800", span: "col-span-2 row-span-2", title: "JOGOS UNIVERSITÁRIOS", likes: 342 },
  { id: 2, type: "image", url: "https://picsum.photos/seed/2/800/400", span: "col-span-1 row-span-1", title: "TREINO DA EQUIPE", likes: 128 },
  { id: 3, type: "image", url: "https://picsum.photos/seed/3/400/800", span: "col-span-1 row-span-2", title: "BASTIDORES", likes: 89 },
  { id: 4, type: "image", url: "https://picsum.photos/seed/4/800/600", span: "col-span-1 row-span-1", title: "FESTA DE ENCERRAMENTO", likes: 567 },
  { id: 5, type: "image", url: "https://picsum.photos/seed/5/800/800", span: "col-span-1 row-span-1", title: "NOVO UNIFORME", likes: 892 },
  { id: 6, type: "image", url: "https://picsum.photos/seed/6/1200/600", span: "col-span-2 row-span-1", title: "A TORCIDA", likes: 455 },
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedImage]);

  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <FadeIn>
            <div className="mb-16 border-b-2 border-black pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Camera size={24} className="text-black" />
                  <span className="font-mono text-sm tracking-widest font-bold">// MEDIA_VAULT</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-normal leading-none mb-4">
                  Galeria <span className="text-transparent stroke-text">Fotos</span>
                </h1>
                <p className="text-xl text-gray-600 font-medium max-w-2xl">
                  Nossos melhores momentos, jogos, eventos e produtos oficiais em alta resolução.
                </p>
              </div>
              
              <a 
                href="https://instagram.com/federadaifro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold hover:bg-neutral-800 transition-colors shrink-0"
              >
                <Instagram size={20} />
                SEGUIR NO INSTAGRAM
              </a>
            </div>
          </FadeIn>

          {/* Interactive Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4">
            {galleryItems.map((item, index) => (
              <FadeIn 
                key={item.id} 
                delay={index * 100}
                className={`relative group overflow-hidden border border-black bg-neutral-200 cursor-pointer ${item.span}`}
              >
                <img 
                  src={item.url} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                  onClick={() => setSelectedImage(item)}
                />
                
                {/* Techy Hover Overlay */}
                <div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-white tracking-widest border border-white/30 px-2 py-1 backdrop-blur-sm">
                      FILE::{item.id.toString().padStart(3, '0')}
                    </span>
                    <button className="bg-white text-black p-2 hover:bg-blue-500 hover:text-white transition-colors">
                      <ZoomIn size={18} />
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/80 font-mono text-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      <Instagram size={12} />
                      {item.likes} LIKES
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedImage(null)}
          ></div>
          
          <div className="relative w-full max-w-5xl h-full max-h-[85vh] flex flex-col pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-between items-center text-white mb-4 pointer-events-auto">
              <span className="font-mono text-sm tracking-widest text-white/50">
                VIEWER // {selectedImage.title}
              </span>
              <div className="flex items-center gap-4">
                <button className="hover:text-blue-400 transition-colors">
                  <Share2 size={24} />
                </button>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={32} />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative flex-1 bg-black border border-white/10 pointer-events-auto overflow-hidden group">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
              
              {/* Crosshairs & Tech Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50"></div>
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/50"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/50"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50"></div>
            </div>
            
            {/* Bottom Info */}
            <div className="mt-4 flex justify-between items-center text-white pointer-events-auto">
              <div className="flex items-center gap-2">
                <Instagram size={16} className="text-white/50" />
                <span className="font-mono text-sm">{selectedImage.likes} CURTIDAS</span>
              </div>
              <a 
                href="https://instagram.com/federadaifro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-xs border border-white/30 px-3 py-1 hover:bg-white hover:text-black transition-colors"
              >
                VER POST ORIGINAL
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
