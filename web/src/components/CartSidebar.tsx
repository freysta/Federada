import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createPortal } from 'react-dom';
import { API_URL } from '../config';
import CheckoutModal from './CheckoutModal';
import { useState } from 'react';

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen && !isCheckoutOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const cartContent = (
    <>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        
        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black transform transition-transform duration-300">
          <div className="bg-black text-white p-4 flex justify-between items-center shrink-0">
            <h2 className="font-mono tracking-widest text-sm flex items-center gap-2">
              <ShoppingBag size={16} /> MEU CARRINHO
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <ShoppingBag size={48} className="opacity-20" />
                <p className="font-mono text-sm uppercase">Carrinho vazio</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2 border border-black text-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                  CONTINUAR COMPRANDO
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.productId}-${item.size}-${index}`} className="flex gap-4 border border-gray-200 p-2 bg-gray-50">
                  <div className="w-20 h-24 bg-white border border-gray-200 shrink-0 relative overflow-hidden">
                    <img src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm leading-tight uppercase line-clamp-2">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.productId, item.size, item.customName, item.customNumber)} className="text-red-500 hover:text-red-700 ml-2 p-2 -mr-2 -mt-2 active:bg-red-50 rounded-full transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      {item.size && <p className="text-xs text-gray-500 mt-1 font-mono">TAM: {item.size}</p>}
                      {item.customName && (
                        <div className="mt-1 text-[10px] text-gray-500 font-mono">
                          <span>{item.customName} #{item.customNumber}</span>
                          <span className="ml-1">({item.playerType})</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center border border-black bg-white">
                        <button onClick={() => updateQuantity(item.productId, item.size, -1)} className="p-3 md:p-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"><Minus size={14} /></button>
                        <span className="w-6 md:w-8 text-center text-sm font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.size, 1)} className="p-3 md:p-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                      <span className="font-mono font-bold text-sm">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-black shrink-0">
              <div className="flex justify-between items-center mb-4 font-mono">
                <span className="text-sm text-gray-500">TOTAL ESTIMADO</span>
                <span className="text-xl font-bold">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-black text-white font-bold py-4 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                FINALIZAR COMPRA <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {isCartOpen && createPortal(cartContent, document.body)}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  );
}
