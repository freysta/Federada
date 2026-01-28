import { ShoppingBag, QrCode } from 'lucide-react';
import { useState } from 'react';
import PixModal from './PixModal';
import merchImg from '../assets/merchs/camiseta-atletica-v1-front.jpg';

const products = [
  {
    id: '01',
    name: 'MOLETOM OFICIAL V1',
    price: 'R$ 149,90',
    specs: ['Algodão Premium 30.1', 'Costura Reforçada', 'Unissex - Caimento Perfeito'],
    stock: 12,
    varName: 'moletom_estoque'
  },
  {
    id: '02',
    name: 'CANECA TÉRMICA',
    price: 'R$ 45,90',
    specs: ['Cerâmica de Alta Qualidade', '350ml - Capacidade Ideal', 'Mantém a temperatura'],
    stock: 48,
    varName: 'caneca_estoque'
  },
  {
    id: '03',
    name: 'CAMISETA OVERSIZED',
    price: 'R$ 89,90',
    specs: ['Malha Egípcia (Toque Suave)', 'Estampa em Alta Definição', 'Modelagem Moderna'],
    stock: 8,
    varName: 'tshirt_estoque'
  }
];

export default function ProductGrid() {
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('');
  
  const handleReserve = (productName: string) => {
    const message = `Olá! Quero comprar o item: ${productName}`;
    window.open(`https://wa.me/5569999999999?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openPix = (price: string) => {
    setSelectedPrice(price);
    setPixModalOpen(true);
  };

  return (
    <section className="py-24 bg-white" id="merch">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-16 border-b border-black pb-4">
          <div>
            <h2 className="text-5xl md:text-6xl tracking-tighter mb-2">LOJA OFICIAL</h2>
            <p className="text-gray-600 text-lg">Produtos exclusivos da Atlética</p>
          </div>
          <span className="font-mono text-sm mb-2 text-gray-500 hidden md:block">
            COLEÇÃO 2026
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              {/* Image Container */}
              <div className="relative aspect-[3/4] bg-neutral-100 mb-6 overflow-hidden transition-all duration-500 border border-transparent group-hover:border-black/10 shadow-sm group-hover:shadow-lg">
                 <div className="absolute top-4 left-4 font-bold text-xs bg-black text-white px-3 py-1 z-10">
                   NOVO
                 </div>
                 
                 {/* Inventory - Clear Language */}
                 <div className="absolute bottom-4 left-4 font-sans text-xs bg-white/90 backdrop-blur px-3 py-1 border border-black/10 shadow-sm z-10 text-gray-800 font-bold">
                    Restam apenas {product.stock} unidades
                 </div>

                 {/* Product Image */}
                 <img 
                    src={merchImg} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-95 group-hover:scale-105 transition-transform duration-700"
                 />

                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 z-20 p-6">
                    <button 
                        onClick={() => handleReserve(product.name)}
                        className="bg-black text-white w-full py-4 font-sans font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <ShoppingBag size={18} />
                        COMPRAR NO WHATSAPP
                    </button>
                    <button 
                        onClick={() => openPix(product.price)}
                        className="bg-white text-black border-2 border-black w-full py-3 font-sans font-bold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <QrCode size={16} />
                        PAGAR COM PIX
                    </button>
                 </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                  <h3 className="text-2xl font-bold tracking-tight">{product.name}</h3>
                  <span className="font-sans font-bold text-xl text-black">{product.price}</span>
                </div>
                
                <div className="space-y-1">
                    {product.specs.map((spec, i) => (
                      <p key={i} className="text-sm text-gray-600 font-medium flex items-center gap-2">
                        <span className="w-1 h-1 bg-black rounded-full"></span>
                        {spec}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <PixModal 
        isOpen={pixModalOpen} 
        onClose={() => setPixModalOpen(false)} 
        amount={selectedPrice} 
      />
    </section>
  );
}
