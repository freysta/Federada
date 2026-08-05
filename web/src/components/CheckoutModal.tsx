import { useState } from 'react';
import { X, Loader2, CreditCard, AlertCircle, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { apiClient } from '../utils/apiClient';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { user, login } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'form' | 'loading'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: '',
    phone: '',
    password: '',
    userType: 'ALUNO',
    period: ''
  });

  if (!isOpen || items.length === 0) return null;

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const data = await apiClient.get<any>(`/coupons/validate?code=${couponInput}`);
      setAppliedCoupon(data);
      toast.success('Cupom aplicado!');
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discountType === 'PERCENTAGE' 
        ? totalPrice * (appliedCoupon.discountValue / 100)
        : Number(appliedCoupon.discountValue))
    : 0;

  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setErrorMsg('');

    try {
      // Se não estiver logado, faz o registro
      if (!user) {
        const data = await apiClient.post<any>('/auth/register', {
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf || undefined,
          phone: formData.phone,
          password: formData.password || '123456',
          userType: formData.userType,
          period: formData.userType === 'ALUNO' ? formData.period : undefined
        });

        login(data.access_token, data.user);
      }

      // Cria o Pedido com array
      const payloadItems = items.map(item => {
        const payloadItem: any = {
          productId: item.productId,
          productName: item.name,
          quantity: Number(item.quantity)
        };
        if (item.size) payloadItem.size = item.size;
        if (item.customName) payloadItem.customName = item.customName;
        if (item.customNumber) payloadItem.customNumber = item.customNumber;
        if (item.playerType) payloadItem.playerType = item.playerType;
        return payloadItem;
      });

      const payload = {
        items: payloadItems,
        couponCode: appliedCoupon?.code || undefined
      }; 
      
      const orderData = await apiClient.post<any>('/orders', payload);
      
      toast.success('Redirecionando para o Mercado Pago...');
      
      clearCart();
      window.location.href = orderData.initPoint;

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleClose}></div>

      <div className="relative bg-white w-full max-w-md shadow-2xl border border-black flex flex-col max-h-[95vh] rounded-t-2xl md:rounded-none animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
        <div className="bg-black text-white p-4 flex justify-between items-center border-b border-white/20 shrink-0 rounded-t-xl md:rounded-none">
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
                  
                  <div className="space-y-3 max-h-32 md:max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-gray-900 leading-tight truncate max-w-[120px] sm:max-w-[180px] text-sm">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs text-gray-500">QTD: {item.quantity}</span>
                            {item.size && (
                              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                                {item.size}
                              </span>
                            )}
                          </div>
                          {item.customName && (
                            <div className="mt-1 text-xs text-gray-500 font-mono">
                              <div>Nome: {item.customName}</div>
                              <div>Nº: {item.customNumber} ({item.playerType})</div>
                            </div>
                          )}
                        </div>
                        <span className="font-mono font-bold">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:flex justify-between items-end border-t border-dashed border-gray-300 pt-3 mt-1">
                     <div className="flex flex-col">
                       {appliedCoupon && (
                         <span className="text-xs text-green-600 font-mono mb-1">
                           Desconto: -R$ {discountAmount.toFixed(2).replace('.', ',')}
                         </span>
                       )}
                       <span className="text-[10px] text-gray-500 font-mono">TOTAL A PAGAR</span>
                       <span className="font-mono text-xl font-bold leading-tight">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                     </div>
                     <span className="text-[10px] bg-black text-white px-2 py-1 font-mono font-bold tracking-widest">SOB DEMANDA</span>
                  </div>
              </div>

              {/* Cupom */}
              <div className="bg-white border border-gray-200 p-3 flex flex-col gap-2 rounded-lg">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="CUPOM DE DESCONTO" 
                      className="w-full bg-gray-50 border border-gray-200 pl-9 pr-3 py-2 text-sm font-mono uppercase focus:border-black outline-none rounded"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon || validatingCoupon}
                    />
                  </div>
                  {!appliedCoupon ? (
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      disabled={!couponInput || validatingCoupon}
                      className="bg-black text-white px-4 text-xs font-mono font-bold uppercase disabled:opacity-50 rounded"
                    >
                      {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'APLICAR'}
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => { setAppliedCoupon(null); setCouponInput(''); setCouponError(''); }}
                      className="bg-gray-200 text-gray-700 px-4 text-xs font-mono font-bold uppercase rounded hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                      REMOVER
                    </button>
                  )}
                </div>
                {couponError && <span className="text-xs text-red-600 font-mono">{couponError}</span>}
                {appliedCoupon && <span className="text-xs text-green-600 font-mono flex items-center gap-1">Cupom aplicado com sucesso!</span>}
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
                    <input required type="text" autoComplete="name" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" placeholder="NOME COMPLETO" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="group">
                    <input required type="email" autoComplete="email" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" placeholder="SEU@EMAIL.COM" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="tel" inputMode="numeric" placeholder="CPF" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
                    <input required type="tel" inputMode="numeric" autoComplete="tel" placeholder="WHATSAPP" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  
                  <div className="group">
                    <select className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.userType} onChange={(e) => setFormData({ ...formData, userType: e.target.value })}>
                      <option value="ALUNO">Sou Aluno</option>
                      <option value="PROFESSOR">Sou Professor</option>
                      <option value="FAMILIAR">Sou Familiar / Apoiador</option>
                    </select>
                  </div>

                  {formData.userType === 'ALUNO' && (
                    <div className="group">
                      <input required type="text" placeholder="PERÍODO (Ex: 1º Período)" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} />
                    </div>
                  )}

                  <div className="group">
                    <input required type="password" minLength={6} autoComplete="new-password" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" placeholder="CRIE UMA SENHA" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 text-green-800 p-3 text-xs font-mono border border-green-200">
                  Logado como: <strong>{user.name}</strong> ({user.email})
                </div>
              )}

              <div className="sticky bottom-0 -mx-6 -mb-6 p-6 mt-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="flex md:hidden justify-between items-end mb-4">
                     <div className="flex flex-col">
                       {appliedCoupon && (
                         <span className="text-[10px] text-green-600 font-mono mb-1">
                           Desc: -R$ {discountAmount.toFixed(2).replace('.', ',')}
                         </span>
                       )}
                       <span className="text-[10px] text-gray-500 font-mono">TOTAL A PAGAR</span>
                       <span className="font-mono text-2xl font-bold leading-tight text-black">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                     </div>
                </div>
                <button type="submit" className="w-full bg-[#009EE3] text-white font-bold py-4 hover:bg-[#0081BA] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-md md:rounded-none">
                  <CreditCard size={20} />
                  <span className="tracking-widest uppercase">PAGAR COM MERCADO PAGO</span>
                </button>
              </div>
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
