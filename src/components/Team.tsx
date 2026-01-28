export default function Team() {
  const members = [
    {
      name: 'Nome do Diretor',
      role: 'CEO',
      image: 'bg-neutral-200'
    },
    {
      name: 'Nome do Diretor',
      role: 'LEAD DEVELOPER',
      image: 'bg-neutral-300'
    },
    {
      name: 'Nome do Diretor',
      role: 'HEAD OF MARKETING',
      image: 'bg-neutral-400'
    },
     {
      name: 'Nome do Diretor',
      role: 'FINANCIAL OFFICER',
      image: 'bg-neutral-200'
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-black" id="about">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Manifesto */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
            <div>
                <h2 className="text-4xl md:text-5xl tracking-tighter mb-8">STACK MEMBERS</h2>
                <span className="font-mono text-xs block mb-2">// QUEM SOMOS</span>
            </div>
            <div>
                <p className="font-serif text-2xl md:text-3xl leading-relaxed text-gray-800">
                    "A Federada não é apenas uma atlética; é um sistema operacional de pessoas. 
                    Nossa missão é compilar talentos, otimizar experiências acadêmicas e 
                    executar o futuro com precisão."
                </p>
                <div className="mt-8 font-mono text-sm text-gray-500">
                    -- MANIFESTO_V1.txt
                </div>
            </div>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-4 gap-8">
            {members.map((member, i) => (
                <div key={i} className="group">
                    <div className={`aspect-square ${member.image} mb-4 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden relative`}>
                         <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                         {/* Placeholder for real image */}
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-mono text-xs opacity-30 text-black">PHOTO_PLACEHOLDER</span>
                         </div>
                    </div>
                    <div className="border-l-2 border-black pl-3">
                        <h4 className="font-bold text-lg uppercase tracking-wide">{member.name}</h4>
                        <span className="font-mono text-xs text-gray-500 block mt-1">[{member.role}]</span>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
}
