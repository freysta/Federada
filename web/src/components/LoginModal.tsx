import { useState } from 'react';
import { X, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(mode === 'login' ? 'Credenciais inválidas' : 'Erro ao criar conta (email ou CPF já em uso).');
      }

      const data = await res.json();
      login(data.access_token, data.user);
      toast.success(mode === 'login' ? 'Login efetuado!' : 'Conta criada com sucesso!');
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-sm shadow-2xl border border-black flex flex-col">
        <div className="bg-black text-white p-3 flex justify-between items-center border-b border-white/20 shrink-0">
          <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-gray-300">
            SYSTEM_LOGIN
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-2 text-xs font-mono border border-red-200">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="group">
                  <input required type="text" placeholder="NOME COMPLETO" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" inputMode="numeric" placeholder="CPF" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
                  <input required type="tel" inputMode="numeric" placeholder="WHATSAPP" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </>
            )}
            
            <div className="group">
              <input required type="email" placeholder="E-MAIL" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            
            <div className="group">
              <input required type="password" minLength={6} placeholder="SENHA" className="w-full bg-white border border-gray-300 p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 hover:bg-neutral-800 transition-all border border-black flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />)}
              <span className="tracking-widest">{mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}</span>
            </button>
          </form>
          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <button type="button" onClick={() => setMode('register')} className="text-xs font-mono text-gray-500 hover:text-black underline underline-offset-4">
                NÃO TEM UMA CONTA? CADASTRE-SE
              </button>
            ) : (
              <button type="button" onClick={() => setMode('login')} className="text-xs font-mono text-gray-500 hover:text-black underline underline-offset-4">
                JÁ POSSUI CONTA? FAÇA LOGIN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
