import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { apiClient } from '../../utils/apiClient';
import toast from 'react-hot-toast';
import { Shield, CheckCircle } from 'lucide-react';

export default function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inviteInfo, setInviteInfo] = useState<{teamName: string, teamLogo?: string, presidentName: string} | null>(null);
  const [formData, setFormData] = useState({
    cpf: '',
    birthDate: '',
    course: '',
    period: '',
    gender: 'MISTO'
  });

  // If user is not logged in, they should probably log in first, but let's assume PrivateRoute handles it or they log in.
  // Actually, we should allow them to see the page, and if not logged in, show a "Login to join" button.

  const { isAuthenticated, token } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Você precisa fazer login para aceitar o convite.');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (code) {
      apiClient.get<any>(`/teams/invite/${code}`)
        .then(data => {
          if (!data.error && !data.statusCode && data.teamName) {
            setInviteInfo(data);
          }
        })
        .catch(console.error);
    }
  }, [code]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Faça login primeiro!');
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post('/teams/join', { 
        inviteCode: code, 
        ...formData 
      });

      toast.success('Inscrição na equipe realizada com sucesso!');
      navigate('/perfil');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-6">
            {inviteInfo?.teamLogo ? (
              <img src={`${API_URL}/uploads/${inviteInfo.teamLogo}`} alt={inviteInfo.teamName} className="w-20 h-20 object-cover rounded-full mx-auto mb-4 border-4 border-blue-50" />
            ) : (
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
            )}
            <h1 className="text-2xl font-bold text-slate-800">
              {inviteInfo ? inviteInfo.teamName : 'Convite para Equipe'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {inviteInfo 
                ? <><strong className="text-slate-700">{inviteInfo.presidentName}</strong> convidou você para se juntar à equipe. Preencha seus dados abaixo para confirmar.</>
                : 'Você foi convidado(a) para se juntar a uma equipe. Preencha seus dados de atleta para confirmar.'}
            </p>
          </div>

          {!token ? (
            <div className="bg-yellow-50 p-4 rounded-xl text-center border border-yellow-200 text-yellow-800">
              Faça login no sistema para poder aceitar este convite.
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Código de Convite</label>
                <input type="text" disabled value={code || ''} className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-500 font-mono font-bold" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">CPF</label>
                <input type="text" required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="000.000.000-00" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Data de Nascimento</label>
                <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Gênero</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500">
                  <option value="MISTO">Prefiro não informar / Outro</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2 shadow-md">
                {loading ? 'Aguarde...' : <><CheckCircle size={20} /> Aceitar Convite</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
