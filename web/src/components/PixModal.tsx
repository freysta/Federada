import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function PixModal({ isOpen, onClose, amount }: { isOpen: boolean; onClose: () => void; amount: string }) {
  const [copied, setCopied] = useState(false);
  const pixKey = "00.000.000/0001-00"; // Placeholder CNPJ/Key

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white max-w-sm w-full p-6 border-2 border-black relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button onClick={onClose} className="absolute top-4 right-4 hover:bg-black hover:text-white transition-colors p-1">
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold mb-4 tracking-tight">PAGAMENTO :: PIX</h3>
        
        <div className="bg-neutral-100 p-4 mb-4 border border-neutral-200">
            <p className="font-mono text-xs text-gray-500 mb-2">// SCAN_QR_CODE</p>
            <div className="aspect-square bg-white border border-black/10 flex items-center justify-center">
                <span className="font-mono text-xs text-gray-400">QR_CODE_PLACEHOLDER</span>
            </div>
        </div>

        <div className="mb-6">
            <p className="font-mono text-xs text-gray-500 mb-2">// OR_COPY_KEY</p>
            <div className="flex items-center gap-2 border border-black p-2 bg-neutral-50">
                <code className="flex-1 font-mono text-sm overflow-hidden text-ellipsis">{pixKey}</code>
                <button onClick={handleCopy} className="p-2 hover:bg-black hover:text-white transition-colors">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>
        </div>

        <div className="text-center font-mono text-xs text-gray-500">
            TOTAL: {amount} <br/>
            WAITING_FOR_TRANSACTION...
        </div>
      </div>
    </div>
  );
}
