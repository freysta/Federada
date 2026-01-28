import hyagoImg from '../assets/membros/hyago.png';
import gabrielImg from '../assets/membros/gabriel.jpg';
import pedroImg from '../assets/membros/pedro.png';

export default function Team() {
  const members = [
    {
      name: 'HYAGO',
      roles: [
        'Presidente da Atlética Federada',
        'Presidente do Centro Acadêmico de ADS',
        'Representante do Colegiado'
      ],
      image: hyagoImg
    },
    {
      name: 'GABRIEL',
      roles: ['Diretor de Esportes da Atlética'],
      image: gabrielImg
    },
    {
      name: 'PEDRO',
      roles: ['Vice-Presidente do Centro Acadêmico'],
      image: pedroImg
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-black" id="about">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Manifesto */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
            <div>
                <h2 className="text-4xl md:text-5xl tracking-normal mb-8 uppercase">Equipe Federada</h2>
                <span className="font-mono text-xs block mb-2 text-gray-400">// LIDERANÇA E ESTRATÉGIA</span>
            </div>
            <div>
                <p className="font-serif text-2xl md:text-3xl leading-relaxed text-gray-800 tracking-wide">
                    "A Federada não é apenas uma atlética; é um sistema operacional de pessoas. 
                    Nossa missão é compilar talentos e executar o futuro com precisão."
                </p>
                <div className="mt-8 font-mono text-sm text-gray-500">
                    -- MANIFESTO_V1.txt
                </div>
            </div>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-12">
            {members.map((member, i) => (
                <div key={i} className="group">
                    {/* Image Container */}
                    <div className="aspect-[4/5] bg-neutral-100 mb-6 relative overflow-hidden border border-gray-200">
                         {/* Base Image */}
                         <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         />
                    </div>

                    <div className="border-l-4 border-black pl-4">
                        <h4 className="font-bold text-2xl uppercase tracking-wide mb-2">{member.name}</h4>
                        <div className="space-y-1">
                            {member.roles.map((role, ri) => (
                                <span key={ri} className="font-sans text-xs font-bold text-gray-500 block uppercase tracking-tight">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
}
