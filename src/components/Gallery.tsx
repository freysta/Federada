import { Grid, Heart, MessageCircle } from 'lucide-react';
import FadeIn from './FadeIn';
import federadaProfile from '../assets/logos/logo-mimalista-federada.png';
import post1 from '../assets/urso.jpg';
import post2 from '../assets/merchs/camiseta-atletica-v1-front.jpg';
import post3 from '../assets/membros/hyago.png';
import post4 from '../assets/membros/gabriel.jpg';

// Mock Posts Data
const posts = [
  { id: 1, img: post1, likes: '124', comments: '12' },
  { id: 2, img: post2, likes: '89', comments: '5' },
  { id: 3, img: post3, likes: '230', comments: '45' },
  { id: 4, img: post4, likes: '156', comments: '22' },
  { id: 5, img: post1, likes: '98', comments: '8' }, // Repeating for grid effect
  { id: 6, img: post2, likes: '112', comments: '15' },
];

export default function Gallery() {
  return (
    <section className="py-24 bg-white border-t border-black" id="gallery">
      <div className="max-w-4xl mx-auto px-6">
        
        <FadeIn>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-16">
                {/* Profile Picture */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 border border-gray-200 shrink-0">
                    <img src={federadaProfile} alt="Profile" className="w-full h-full rounded-full object-cover" />
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                        <h2 className="text-2xl font-sans text-gray-800">federadaifro</h2>
                        <div className="flex gap-2">
                            <a 
                                href="https://instagram.com/federadaifro" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-6 py-1.5 rounded font-bold text-sm hover:bg-blue-600 transition-colors"
                            >
                                Seguir
                            </a>
                            <button className="bg-gray-100 text-black px-4 py-1.5 rounded font-bold text-sm hover:bg-gray-200 transition-colors">
                                Mensagem
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center md:justify-start gap-8 mb-4 font-sans text-base">
                        <span><strong>24</strong> publicações</span>
                        <span><strong>1.2k</strong> seguidores</span>
                        <span><strong>450</strong> seguindo</span>
                    </div>

                    {/* Bio */}
                    <div className="font-sans text-sm leading-relaxed">
                        <strong>Atlética Federada 🐻‍❄️</strong> <br/>
                        🎓 Análise e Desenvolvimento de Sistemas - IFRO <br/>
                        🚀 High Performance Code & Gear <br/>
                        📍 Ji-Paraná, RO
                    </div>
                </div>
            </div>
        </FadeIn>

        {/* Tabs */}
        <div className="border-t border-gray-200 flex justify-center gap-12 mb-4">
            <button className="flex items-center gap-2 border-t border-black pt-4 text-xs font-bold tracking-widest uppercase">
                <Grid size={12} /> Publicações
            </button>
            <button className="flex items-center gap-2 pt-4 text-xs font-bold tracking-widest uppercase text-gray-400">
                Reels
            </button>
            <button className="flex items-center gap-2 pt-4 text-xs font-bold tracking-widest uppercase text-gray-400">
                Marcados
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-1 md:gap-8">
          {posts.map((post, i) => (
            <FadeIn key={post.id} delay={i * 100}>
              <div className="group relative aspect-square bg-gray-100 cursor-pointer overflow-hidden">
                <img src={post.img} alt={`Post ${post.id}`} className="w-full h-full object-cover" />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                    <div className="flex items-center gap-1">
                        <Heart fill="white" size={20} /> {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle fill="white" size={20} /> {post.comments}
                    </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
