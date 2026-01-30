import { useState } from 'react';
import { X, Loader2, QrCode, CheckCircle, Copy } from 'lucide-react';
import FadeIn from './FadeIn';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: string; // e.g., "R$ 69,90"
    rawPrice: number; // e.g., 69.90
  } | null;
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'payment'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    size: 'M'
  });
  const [pixData, setPixData] = useState<{ qrCodeBase64: string, copyPaste: string, orderId: string } | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');

    try {
      // Simulating API Call to our NestJS Backend
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerCpf: formData.cpf,
          customerPhone: formData.phone,
          productName: product.name,
          productSize: formData.size,
          amount: product.rawPrice
        }),
      });

      const data = await response.json();

      if (data.pix) {
        setPixData({
          ...data.pix,
          orderId: data.orderId
        });
        setStep('payment');
      } else {
        alert('Erro ao gerar Pix. Tente novamente.');
        setStep('form');
      }
    } catch (error) {
      console.error(error);
      // For MVP demo purposes, if backend is offline, we might show a mock or error
      alert('Erro de conexão com o servidor de pagamento.');
      setStep('form');
    }
  };

  const copyPix = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      alert('Código Pix copiado!');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <h3 className="font-mono text-sm tracking-widest uppercase">CHECKOUT_SYSTEM v1.0</h3>
          <button onClick={onClose} className="hover:text-neon-cyan transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-neutral-50 p-4 border border-gray-200 mb-4">
                <p className="font-bold text-lg">{product.name}</p>
                <p className="font-mono text-gray-500">{product.price}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">Nome Completo</label>
                    <input 
                        required
                        type="text" 
                        className="w-full bg-gray-50 border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                
                <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">E-mail</label>
                    <input 
                        required
                        type="email" 
                        className="w-full bg-gray-50 border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-1">CPF</label>
                    <input 
                        required
                        type="text" 
                        placeholder="000.000.000-00"
                        className="w-full bg-gray-50 border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                        value={formData.cpf}
                        onChange={e => setFormData({...formData, cpf: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-1">Celular</label>
                    <input 
                        required
                        type="tel" 
                        placeholder="(69) 9..."
                        className="w-full bg-gray-50 border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">Tamanho</label>
                    <div className="flex gap-2">
                        {['P', 'M', 'G', 'GG'].map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setFormData({...formData, size: s})}
                                className={`flex-1 py-2 text-sm font-bold border ${formData.size === s ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-4 mt-4 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode size={18} />
                GERAR PIX PAGAMENTO
              </button>
            </form>
          )}

          {step === 'loading' && (
            <div className="py-12 flex flex-col items-center text-center">
                <Loader2 size={48} className="animate-spin text-black mb-4" />
                <p className="font-mono text-sm animate-pulse">PROCESSANDO_PEDIDO...</p>
                <p className="text-xs text-gray-400 mt-2">Conectando ao Banco Central</p>
            </div>
          )}

          {step === 'payment' && pixData && (
            <FadeIn>
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Pedido Registrado!</h3>
                    <p className="text-xs font-mono text-gray-400 mb-4">ID: {pixData ? (pixData as any).orderId : '...'}</p>
                    <p className="text-sm text-gray-600 mb-6">Escaneie o QR Code abaixo para finalizar.</p>

                    <div className="bg-white p-4 border-2 border-dashed border-gray-300 inline-block mb-6">
                        <img 
                          src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} 
                          alt="QR Code Pix"
                          className="w-48 h-48"
                        />
                    </div>

                    <div className="relative">
                        <input 
                            type="text" 
                            readOnly 
                            value={pixData.copyPaste}
                            className="w-full bg-gray-100 border border-gray-200 p-3 pr-12 text-xs font-mono text-gray-500 truncate"
                        />
                        <button 
                            onClick={copyPix}
                            className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-black"
                        >
                            <Copy size={16} />
                        </button>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full border border-black py-3 mt-6 font-bold hover:bg-black hover:text-white transition-colors"
                    >
                        JÁ REALIZEI O PAGAMENTO
                    </button>
                    
                    <p className="text-[10px] text-gray-400 mt-4">
                        Você receberá a confirmação no e-mail: <span className="text-black">{formData.email}</span>
                    </p>
                </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}
