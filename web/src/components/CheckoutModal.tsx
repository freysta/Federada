import { useState } from 'react';
import { X, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { API_URL } from '../config';
import PixModal from './PixModal';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { user, token, login } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'form' | 'loading' | 'pix'>('form');
  const [pixData, setPixData] = useState<{ qrCode: string, copyPaste: string, orderId: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: '',
    phone: '',
    password: ''
  });

  if (!isOpen || items.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setErrorMsg('');

    try {
      let currentToken = token;

      // Se não estiver logado, faz o registro
      if (!user) {
        const registerRes = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf,
            phone: formData.phone,
            password: formData.password || '123456'
          })
        });

        if (!registerRes.ok) {
          const errData = await registerRes.json();
          throw new Error(errData.message || 'Erro ao registrar usuário. Email ou CPF já existem.');
        }

        const data = await registerRes.json();
        currentToken = data.access_token;
        login(data.access_token, data.user);
      }

      // Cria o Pedido com array de itens do carrinho
      const orderItems = items.map(item => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity
      }));

      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ items: orderItems })
      });

      if (!orderRes.ok) {
        throw new Error('Erro ao gerar pagamento PIX.');
      }

      const orderData = await orderRes.json();
      
      toast.success('Pedido criado! Pague o PIX para garantir.');
      
      setPixData({
        orderId: orderData.orderId,
        qrCode: orderData.pix.qrCodeBase64,
        copyPaste: orderData.pix.copyPaste
      });
      setStep('pix');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setPixData(null);
    onClose();
  };

  if (step === 'pix' && pixData) {
    return <PixModal isOpen={true} onClose={() => { clearCart(); handleClose(); }} pixData={pixData} amount={`R$ ${totalPrice.toFixed(2).replace('.', ',')}`} />;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleClose}></div>

      <div className="relative bg-white w-full max-w-md shadow-2xl border border-black flex flex-col max-h-[90vh]">
        <div className="bg-black text-white p-3 flex justify-between items-center border-b border-white/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></div>
            <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-gray-300">
              SECURE_CHECKOUT
            </h3>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-300">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-neutral-50 border border-black p-4 relative overflow-hidden flex flex-col gap-3">
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">RESUMO DO PEDIDO ({items.length} itens)</p>
                  
                  <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                          <span className="font-bold uppercase line-clamp-1 max-w-[220px] leading-tight">{item.quantity}x {item.name}</span>
                          {item.size && <span className="font-mono text-[10px] text-gray-500 mt-0.5">TAM: {item.size}</span>}
                        </div>
                        <span className="font-mono font-bold">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end border-t border-dashed border-gray-300 pt-3 mt-1">
                     <div className="flex flex-col">
                       <span className="text-[10px] text-gray-500 font-mono">TOTAL A PAGAR</span>
                       <span className="font-mono text-xl font-bold leading-tight">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                     </div>
                     <span className="text-[10px] bg-black text-white px-2 py-1 font-mono font-bold tracking-widest">SOB DEMANDA</span>
                  </div>
              </div>
              
              <div className="bg-[#00f0ff]/10 border border-[#00f0ff] p-3 text-xs font-mono text-gray-800 space-y-1">
                <p><strong>PRODUÇÃO:</strong> Em até 15 dias úteis.</p>
                <p><strong>ENTREGA:</strong> Retirada presencial na faculdade (Centro Acadêmico).</p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 border border-red-200 p-3 text-xs font-mono flex items-center gap-2">
                  <AlertCircle size={14} />
                  {errorMsg}
                </div>
              )}

              {!user ? (
                <div className="space-y-4">
                  <p className="text-xs font-mono text-gray-500">// DADOS_COMPRADOR (Criação de Conta)</p>
                  <div className="group">
                    <input required type="text" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" placeholder="NOME COMPLETO" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="group">
                    <input required type="email" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" placeholder="SEU@EMAIL.COM" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" inputMode="numeric" placeholder="CPF" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
                    <input required type="tel" inputMode="numeric" placeholder="WHATSAPP" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="group">
                    <input required type="password" minLength={6} className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" placeholder="CRIE UMA SENHA" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 text-green-800 p-3 text-xs font-mono border border-green-200">
                  Logado como: <strong>{user.name}</strong> ({user.email})
                </div>
              )}

              <button type="submit" className="w-full bg-black text-white font-bold py-4 hover:bg-neutral-800 transition-all border border-black flex items-center justify-center gap-3">
                <CreditCard size={20} />
                <span className="tracking-widest">GERAR PIX</span>
              </button>
            </form>
          )}

          {step === "loading" && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 size={48} className="animate-spin text-black mb-4" />
              <p className="font-mono text-sm animate-pulse tracking-widest">PROCESSANDO...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
