import { useState, useEffect } from 'react';
import { X, Copy, Check, CheckCircle, Loader2, Timer } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  pixData: {
    orderId: string;
    qrCode: string;
    copyPaste: string;
  };
}

export default function PixModal({ isOpen, onClose, amount, pixData }: PixModalProps) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED'>('PENDING');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const { token } = useAuth();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${pixData.orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAID') {
            setStatus('PAID');
            clearInterval(interval);
          } else if (data.status === 'CANCELLED') {
            setStatus('CANCELLED');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Erro ao checar status do PIX:", err);
      }
    }, 5000);

    const timeout = setTimeout(() => {
     clearInterval(interval);
    }, 900000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pixData.orderId, token]);

  useEffect(() => {
    if (status !== 'PAID' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeLeft]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixData.copyPaste);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white max-w-sm w-full p-6 border-2 border-black relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button onClick={onClose} className="absolute top-4 right-4 hover:bg-black hover:text-white transition-colors p-1">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold mb-4 tracking-tight">PAGAMENTO :: PIX</h3>
        
        {status === 'PAID' ? (
          <div className="py-8 text-center text-green-600 flex flex-col items-center">
            <CheckCircle size={64} className="mb-4" />
            <h4 className="text-xl font-bold mb-2">PAGAMENTO APROVADO</h4>
            <p className="font-mono text-sm text-gray-600">Seu pedido foi confirmado!</p>
          </div>
        ) : timeLeft <= 0 && status === 'PENDING' ? (
          <div className="py-8 text-center text-red-600 flex flex-col items-center">
            <Timer size={64} className="mb-4" />
            <h4 className="text-xl font-bold mb-2">PIX EXPIRADO</h4>
            <p className="font-mono text-sm text-gray-600">O tempo para pagamento esgotou. Faça um novo pedido.</p>
            <button onClick={onClose} className="mt-4 bg-black text-white px-6 py-2 font-bold">FECHAR</button>
          </div>
        ) : (
          <>
            <div className="bg-neutral-100 p-4 mb-4 border border-neutral-200 flex flex-col items-center">
                <p className="font-mono text-xs text-gray-500 mb-2 w-full text-left">// SCAN_QR_CODE</p>
                <div className="bg-white border border-black/10 p-2 inline-block">
                  <img src={`data:image/jpeg;base64,${pixData.qrCode}`} alt="QR Code PIX" className="w-48 h-48" />
                </div>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs font-mono text-gray-500 mb-2 uppercase flex justify-between">
                    <span>PIX_COPIA_E_COLA</span>
                    <span className="text-red-500 flex items-center gap-1 font-bold">
                      <Timer size={12} /> {formatTime(timeLeft)}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-xs overflow-hidden whitespace-nowrap overflow-ellipsis">{pixData.copyPaste}</code>
                    <button onClick={handleCopy} className="p-2 hover:bg-black hover:text-white transition-colors border border-black bg-white shrink-0">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            <div className="text-center font-mono text-xs text-gray-500 border-t border-dashed border-gray-300 pt-4 mt-4">
                <div className="font-bold text-black text-sm mb-2">TOTAL: {amount}</div>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  AGUARDANDO PAGAMENTO...
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
