import { useState } from 'react';
import { X, Loader2, MessageCircle, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: string; // e.g., "R$ 69,90"
    rawPrice: number; // e.g., 69.90
  } | null;
}

// Número de contato para vendas (Pode ser movido para config depois)
const WHATSAPP_NUMBER = "5569993242656";

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'loading'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    size: 'M'
  });

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');

    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const message = `
*NOVO PEDIDO - LOJA FEDERADA*
---------------------------
*ITEM:* ${product.name}
*VALOR:* ${product.price}
*TAMANHO:* ${formData.size}
---------------------------
*DADOS DO CLIENTE:*
*Nome:* ${formData.name}
*CPF:* ${formData.cpf}
*E-mail:* ${formData.email}
*Celular:* ${formData.phone}
---------------------------
_Gostaria de prosseguir com o pagamento._
    `.trim();

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-md shadow-2xl border border-black flex flex-col max-h-[90vh]">
        {/* Technical Header */}
        <div className="bg-black text-white p-3 flex justify-between items-center border-b border-white/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></div>
            <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-gray-300">
              SECURE_CHECKOUT_V2
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Summary Ticket */}
              <div className="bg-neutral-50 border border-black p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1">
                  <div className="w-16 h-16 border-t-2 border-r-2 border-black/10 -mt-2 -mr-2"></div>
                </div>
                <div className="relative z-10">
                  <p className="font-mono text-[10px] text-gray-400 mb-1 uppercase tracking-widest">
                    ITEM_SELECIONADO
                  </p>
                  <p className="font-bold text-lg leading-tight uppercase mb-2">{product.name}</p>
                  <div className="flex justify-between items-end border-t border-dashed border-gray-300 pt-2">
                     <span className="font-mono text-xl font-bold">{product.price}</span>
                     <span className="text-[10px] bg-black text-white px-1 font-mono">EM ESTOQUE</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500 group-focus-within:text-black transition-colors">
                    // NOME_COMPLETO
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-200"
                    placeholder="DIGITE SEU NOME..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500 group-focus-within:text-black transition-colors">
                    // E-MAIL_CONTATO
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-200"
                    placeholder="SEU@EMAIL.COM"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500 group-focus-within:text-black transition-colors">
                      // CPF
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="000.000.000-00"
                      className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-200"
                      value={formData.cpf}
                      onChange={(e) =>
                        setFormData({ ...formData, cpf: e.target.value })
                      }
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500 group-focus-within:text-black transition-colors">
                      // WHATSAPP
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="(69) 9..."
                      className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-200"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">
                    // SELECIONE_TAMANHO
                  </label>
                  <div className="flex gap-2">
                    {["P", "M", "G", "GG"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, size: s })}
                        className={`flex-1 relative h-12 flex items-center justify-center text-sm font-bold border transition-all duration-200 group
                          ${formData.size === s 
                            ? "bg-black text-white border-black" 
                            : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-black"
                          }`}
                      >
                        {formData.size === s && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500"></span>
                        )}
                        <span className="font-mono">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="flex items-start gap-3 bg-neutral-50 p-3 border border-dashed border-gray-300 text-xs text-gray-500 font-mono">
                 <AlertCircle size={14} className="mt-0.5 shrink-0" />
                 <p>Ao continuar, você será redirecionado para o WhatsApp oficial para concluir o pagamento via Pix.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#25D366] text-white font-bold py-4 hover:bg-[#20bd5a] transition-all border border-black/10 hover:border-black flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <MessageCircle size={20} />
                <span className="tracking-widest">INICIAR_ATENDIMENTO</span>
              </button>
            </form>
          )}

          {step === "loading" && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                <Loader2 size={64} className="animate-spin text-black relative z-10" />
              </div>
              <p className="font-mono text-sm mt-8 animate-pulse tracking-widest">
                ESTABELECENDO_CONEXÃO...
              </p>
              <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase">
                Aguarde o redirecionamento
              </p>
            </div>
          )}
        </div>
        
        {/* Footer Decorator */}
        <div className="bg-neutral-100 border-t border-gray-200 p-2 flex justify-between items-center text-[9px] font-mono text-gray-400 shrink-0">
           <span>SECURE_ENCLAVE_ID: 0x8291A</span>
           <span>STATUS: ONLINE</span>
        </div>
      </div>
    </div>
  );
}
