import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_URL } from "../config";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação ausente na URL.');
      return;
    }

    fetch(`${API_URL}/auth/verify-email?token=` + token)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao verificar e-mail.');
        setStatus('success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [token]);

  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-white border border-black shadow-[8px_8px_0_0_#000] p-8 text-center">
            
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-black" size={48} />
                <h2 className="text-xl font-bold font-mono">VERIFICANDO E-MAIL...</h2>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="text-green-500" size={48} />
                <h2 className="text-xl font-bold font-mono text-green-600">E-MAIL VERIFICADO!</h2>
                <p className="text-gray-600">{message}</p>
                <Link to="/" className="mt-4 bg-black text-white px-6 py-3 font-bold font-mono hover:bg-neutral-800 transition-colors inline-block border border-black w-full">
                  VOLTAR PARA A LOJA E LOGAR
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="text-red-500" size={48} />
                <h2 className="text-xl font-bold font-mono text-red-600">FALHA NA VERIFICAÇÃO</h2>
                <p className="text-gray-600">{message}</p>
                <Link to="/" className="mt-4 bg-white text-black px-6 py-3 font-bold font-mono hover:bg-gray-100 transition-colors inline-block border border-black w-full">
                  IR PARA O INÍCIO
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
