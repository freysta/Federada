import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { KeyRound, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function AthleteProfilePage() {
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: '',
    userType: 'ALUNO',
    period: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao alterar a senha');
      }

      toast.success('Senha alterada com sucesso!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.name || undefined,
          phone: profileData.phone || undefined,
          userType: profileData.userType,
          period: profileData.userType === 'ALUNO' ? profileData.period : undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao atualizar perfil');
      }

      toast.success('Perfil atualizado com sucesso! (Recarregue para ver alterações)');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Meu Perfil</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie suas configurações de conta e segurança</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col lg:flex-row gap-8">
        {/* Lado Esquerdo - Perfil */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-1 inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                <ShieldCheck size={12} /> {user?.role}
              </div>
            </div>
          </div>

        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            Dados Pessoais
          </h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="text" placeholder="Deixe em branco para manter" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vínculo</label>
                <select value={profileData.userType} onChange={e => setProfileData({...profileData, userType: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-sm">
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="FAMILIAR">Familiar / Apoiador</option>
                </select>
              </div>
              {profileData.userType === 'ALUNO' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <input type="text" value={profileData.period} onChange={e => setProfileData({...profileData, period: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" />
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loadingProfile} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-400">
                {loadingProfile ? 'Salvando...' : 'Atualizar Perfil'}
              </button>
            </div>
          </form>
        </div>

        </div>

        {/* Linha Divisória Mobile / Borda Desktop */}
        <div className="hidden lg:block w-px bg-gray-200"></div>
        <hr className="block lg:hidden border-gray-200" />

        {/* Lado Direito - Senha */}
        <div className="flex-1 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <KeyRound size={18} /> Segurança da Conta
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                <input 
                  type="password" 
                  required 
                  value={formData.currentPassword}
                  onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                  className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  required 
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  required 
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-gray-800 text-white font-bold hover:bg-black transition-all shadow-md disabled:bg-gray-400 w-full md:w-auto"
              >
                {loading ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
        </div>
      </div>
    </>
  );
}
