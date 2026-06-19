import { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { API_URL } from '../config';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  extraImages?: string[];
  sizes: string[];
  category?: string;
  isCustomizable?: boolean;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const images = [product.imageUrl];
  if (product.extraImages && product.extraImages.length > 0) {
    images.push(...product.extraImages);
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Customization
  const [customData, setCustomData] = useState({ name: '', number: '', type: 'TORCEDOR' });

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert("Por favor, selecione um tamanho.");
      return;
    }
    if (product.isCustomizable && (!customData.name || !customData.number)) {
      alert("Por favor, preencha o nome e número para personalização.");
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: selectedSize || undefined,
      isCustomizable: product.isCustomizable,
      customName: product.isCustomizable ? customData.name : undefined,
      customNumber: product.isCustomizable ? customData.number : undefined,
      playerType: product.isCustomizable ? customData.type : undefined
    });
    
    onClose();
  };

  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full h-full md:h-auto md:max-h-[95vh] md:max-w-6xl md:rounded-lg overflow-hidden flex flex-col md:flex-row relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-black hover:text-white text-black p-2 rounded-full transition-all shadow-sm"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        {/* Left Side: Image Gallery */}
        <div className="w-full md:w-[55%] flex flex-col md:flex-row-reverse bg-[#f7f7f7] relative">
          
          {/* Main Image */}
          <div 
            className="relative w-full aspect-[4/5] md:aspect-auto md:h-[95vh] max-h-[800px] overflow-hidden cursor-crosshair group"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img 
              ref={imageRef}
              src={images[currentImageIndex]?.startsWith('http') ? images[currentImageIndex] : `${API_URL}${images[currentImageIndex]}`}
              alt={product.name}
              className={`w-full h-full object-cover mix-blend-multiply transition-all duration-300 ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
            />
            
            {/* Mobile Arrows */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:hidden">
                <button onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} className="bg-white/90 p-3 rounded-full shadow-md text-black">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleNextImage(); }} className="bg-white/90 p-3 rounded-full shadow-md text-black">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          
          {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 p-4 md:p-6 overflow-x-auto md:overflow-y-auto md:w-24 shrink-0 hide-scrollbar bg-white md:bg-transparent">
              {images.map((src, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-16 h-20 md:w-full md:h-24 shrink-0 transition-all overflow-hidden ${currentImageIndex === idx ? 'border-b-2 border-black md:border-b-0 md:border-l-2 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={src?.startsWith('http') ? src : `${API_URL}${src}`} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply bg-[#f7f7f7]" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Add to Cart */}
        <div className="w-full md:w-[45%] p-6 md:p-12 flex flex-col overflow-y-auto hide-scrollbar bg-white">
          
          {/* Breadcrumb / Category */}
          <div className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-4">
            LOJA / {product.category || 'GERAL'}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase mb-3 text-gray-900 tracking-tight">{product.name}</h2>
            <div className="text-2xl text-gray-900">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </div>
            <p className="text-sm text-gray-500 mt-2">Em até 3x sem juros</p>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <span className="font-semibold text-sm text-gray-900 uppercase">Tamanho</span>
                <button className="text-xs text-gray-500 underline hover:text-black">Guia de Medidas</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm transition-all border ${selectedSize === size ? 'border-black bg-black text-white font-bold' : 'border-gray-200 text-gray-700 hover:border-black bg-white'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customization */}
          {product.isCustomizable && (
            <div className="bg-gray-50 border border-gray-100 p-6 mb-8 rounded-sm">
              <h3 className="font-semibold text-sm uppercase text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Personalização Inclusa
              </h3>
              
              <div className="space-y-5">
                <div>
                  <input type="text" maxLength={20} value={customData.name} onChange={e => setCustomData({...customData, name: e.target.value.toUpperCase()})} className="w-full border-b border-gray-300 bg-transparent py-2 text-sm uppercase focus:border-black outline-none transition-colors placeholder-gray-400" placeholder="NOME NA CAMISA" />
                </div>
                <div>
                  <input type="text" maxLength={3} value={customData.number} onChange={e => setCustomData({...customData, number: e.target.value})} className="w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black outline-none transition-colors placeholder-gray-400" placeholder="NÚMERO (Ex: 10)" />
                </div>
                
                <div className="pt-2">
                  <span className="block text-xs font-semibold text-gray-500 mb-3 uppercase">Vínculo</span>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${customData.type === 'TORCEDOR' ? 'border-black' : 'border-gray-300 group-hover:border-black'}`}>
                        {customData.type === 'TORCEDOR' && <div className="w-2 h-2 bg-black rounded-full"></div>}
                      </div>
                      <input type="radio" className="hidden" name="type" value="TORCEDOR" checked={customData.type === 'TORCEDOR'} onChange={() => setCustomData({...customData, type: 'TORCEDOR'})} />
                      <span className="text-sm text-gray-700">Torcedor</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${customData.type === 'ATLETA' ? 'border-black' : 'border-gray-300 group-hover:border-black'}`}>
                        {customData.type === 'ATLETA' && <div className="w-2 h-2 bg-black rounded-full"></div>}
                      </div>
                      <input type="radio" className="hidden" name="type" value="ATLETA" checked={customData.type === 'ATLETA'} onChange={() => setCustomData({...customData, type: 'ATLETA'})} />
                      <span className="text-sm text-gray-700">Atleta</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-black text-white font-semibold text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={18} />
              ADICIONAR AO CARRINHO
            </button>
          </div>

          <div className="text-sm text-gray-600 leading-relaxed space-y-4 border-t border-gray-100 pt-6">
            <div>
              <h4 className="font-semibold text-gray-900 uppercase text-xs tracking-wider mb-2">Descrição do Produto</h4>
              <p>{product.description}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between py-2 cursor-pointer group">
                  <span className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Envio e Entrega</span>
                  <span className="text-gray-400 group-hover:text-black transition-colors">+</span>
               </div>
               <div className="flex items-center justify-between py-2 cursor-pointer group border-t border-gray-50">
                  <span className="font-semibold text-gray-900 uppercase text-xs tracking-wider">Trocas e Devoluções</span>
                  <span className="text-gray-400 group-hover:text-black transition-colors">+</span>
               </div>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
