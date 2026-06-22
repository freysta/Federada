import { useState } from 'react';
import { X, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro no login com Google');
      }
      const data = await res.json();
      login(data.access_token, data.user);
      toast.success('Login efetuado!');
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || (mode === 'login' ? 'Credenciais inválidas' : 'Erro ao criar conta.'));
      }

      const data = await res.json();
      if (mode === 'register') {
        toast.success(data.message || 'Conta criada com sucesso! Verifique seu e-mail.');
        setMode('login');
      } else {
        login(data.access_token, data.user);
        toast.success('Login efetuado!');
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-sm shadow-2xl border border-black flex flex-col max-h-[90vh] rounded-t-2xl md:rounded-none animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
        <div className="bg-black text-white p-4 flex justify-between items-center border-b border-white/20 shrink-0 rounded-t-xl md:rounded-none">
          <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-gray-300">
            SYSTEM_LOGIN
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="overflow-y-auto max-h-[60vh] custom-scrollbar space-y-4 px-1 pb-2">
              {error && (
                <div className="bg-red-50 text-red-600 p-2 text-xs font-mono border border-red-200 mb-4">
                  {error}
                </div>
              )}



              {mode === 'register' && (
                <div className="group">
                  <input required type="text" autoComplete="name" placeholder="NOME COMPLETO" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
              )}
              
              <div className="group">
                <input required type="email" autoComplete="email" placeholder="E-MAIL" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              
              <div className="group">
                <input required type="password" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="SENHA" className="w-full bg-white border border-gray-300 p-4 md:p-3 text-sm font-mono focus:border-black focus:ring-0 outline-none" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 md:py-3 hover:bg-neutral-800 transition-all active:scale-[0.98] border border-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />)}
              <span className="tracking-widest">{mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}</span>
            </button>

            <div className="flex items-center gap-2 my-4">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-mono text-gray-400">OU</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="mb-2 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Falha ao conectar com o Google')}
                useOneTap
                theme="outline"
                text="continue_with"
                width="100%"
              />
            </div>
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
