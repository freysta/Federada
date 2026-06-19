import { useState, useEffect } from 'react';
import FadeIn from './FadeIn';
import TiltCard from './TiltCard';
import { Shield } from 'lucide-react';
import { API_URL } from '../config';

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/cms/team`)
      .then(res => {
        if (!res.ok) throw new Error('Falha');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setTeamMembers(data);
        else setTeamMembers([]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar diretoria:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-white text-black relative border-b border-black">
        <div className="max-w-6xl mx-auto flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white border-t border-black relative" id="about">
      {/* Decorative Background Grid */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="grid md:grid-cols-2 gap-16 mb-20 items-end">
            <FadeIn>
                <div>
                    <div className="flex items-center gap-2 text-neon-cyan mb-4">
                       <span className="w-2 h-2 bg-black animate-pulse"></span>
                       <span className="font-mono text-xs tracking-widest text-black">OPERATIVE_DIRECTORY_V2.0</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl tracking-normal uppercase leading-none">
                        EQUIPE<br/><span className="text-transparent stroke-text">PRINCIPAL</span>
                    </h2>
                </div>
            </FadeIn>
            <FadeIn delay={200}>
                <div className="border-l-2 border-black/20 pl-6">
                    <p className="font-mono text-sm leading-relaxed text-gray-600 mb-4">
                        // RESULT: {teamMembers.length} RECORDS FOUND
                    </p>
                    <p className="font-serif text-xl md:text-2xl text-black">
                        "Compilando talentos e executando o futuro com precisão absoluta."
                    </p>
                </div>
            </FadeIn>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
                <FadeIn key={i} delay={i * 150}>
                    <TiltCard className="group relative bg-neutral-50 border border-black/10 hover:border-black transition-all duration-300 w-full h-full block">
                        
                        {/* Status Bar */}
                        <div className="absolute top-4 right-4 z-20 font-mono text-[10px] bg-black/80 text-white backdrop-blur px-2 py-1 flex items-center gap-2" style={{ transform: 'translateZ(20px)' }}>
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                           ONLINE
                        </div>

                        {/* ID Tag */}
                        <div className="absolute top-4 left-4 z-20 font-mono text-xs font-bold text-white mix-blend-difference" style={{ transform: 'translateZ(15px)' }}>
                           [{member.id.substring(0,8)}]
                        </div>

                        {/* Image Container */}
                        <div className="aspect-[3/4] relative overflow-hidden bg-black" style={{ transform: 'translateZ(5px)' }}>
                            {/* Scanline Overlay */}
                            <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-50"></div>
                            
                            <img 
                                src={member.imageUrl ? (member.imageUrl.startsWith('http') ? member.imageUrl : `${API_URL}${member.imageUrl}`) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80'} 
                                alt={member.name} 
                                className="w-full h-full object-cover grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-active:grayscale-0 transition-all duration-700"
                            />
                            
                            {/* Hover Tech Overlay */}
                            <div className="absolute inset-0 bg-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay z-10 pointer-events-none"></div>
                        </div>

                        {/* Info Card */}
                        <div className="p-6 border-t border-black/10 relative overflow-hidden bg-white" style={{ transform: 'translateZ(25px)' }}>
                             {/* Decorative Corner */}
                             <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-black/30"></div>

                             <div className="flex items-center gap-2 mb-3 text-neon-cyan/80 group-hover:text-black group-active:text-black transition-colors">
                                <Shield size={14} />
                                <span className="font-mono text-[10px] tracking-widest text-gray-500 group-hover:text-black group-active:text-black">LEADERSHIP</span>
                             </div>

                            <h4 className="font-sans font-bold text-4xl mb-3 tracking-wide uppercase group-hover:text-[#00f0ff] group-active:text-[#00f0ff] transition-colors">{member.name}</h4>
                            
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#00f0ff] font-bold text-xs">{'>'}</span>
                                    <span className="font-mono text-xs text-gray-600 uppercase tracking-tight">
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </FadeIn>
            ))}
        </div>
      </div>
    </section>
  );
}
