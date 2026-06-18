import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function AdminProfile() {
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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Meu Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas configurações de conta e segurança</p>
      </div>

      <div className="bg-white border border-black shadow-[4px_4px_0_0_#000] p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="bg-black text-white w-12 h-12 flex items-center justify-center font-bold text-xl uppercase font-mono">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase">{user?.name}</h2>
            <p className="text-sm text-gray-500 font-mono">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-mono px-2 py-1 font-bold">
              <ShieldCheck size={12} /> {user?.role}
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="font-bold uppercase flex items-center gap-2 mb-4">
            Dados Pessoais
          </h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-mono mb-1 text-gray-600">NOME</label>
                <input type="text" required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1 text-gray-600">WHATSAPP</label>
                <input type="text" placeholder="Deixe em branco para não alterar" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1 text-gray-600">VÍNCULO</label>
                <select value={profileData.userType} onChange={e => setProfileData({...profileData, userType: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm bg-white">
                  <option value="ALUNO">Aluno</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="FAMILIAR">Familiar / Apoiador</option>
                </select>
              </div>
              {profileData.userType === 'ALUNO' && (
                <div className="col-span-2">
                  <label className="block text-xs font-mono mb-1 text-gray-600">PERÍODO</label>
                  <input type="text" value={profileData.period} onChange={e => setProfileData({...profileData, period: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm" />
                </div>
              )}
            </div>
            <button type="submit" disabled={loadingProfile} className="w-full bg-[#00f0ff] text-black font-bold font-mono py-3 mt-2 border border-black shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all disabled:bg-gray-400">
              {loadingProfile ? 'SALVANDO...' : 'ATUALIZAR PERFIL'}
            </button>
          </form>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h3 className="font-bold uppercase flex items-center gap-2 mb-4">
            <KeyRound size={18} /> Alterar Senha
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1 text-gray-600">SENHA ATUAL</label>
              <input 
                type="password" 
                required 
                value={formData.currentPassword}
                onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                className="w-full border border-gray-300 p-2 font-mono text-sm" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono mb-1 text-gray-600">NOVA SENHA</label>
                <input 
                  type="password" 
                  required 
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full border border-gray-300 p-2 font-mono text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1 text-gray-600">CONFIRME A NOVA SENHA</label>
                <input 
                  type="password" 
                  required 
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full border border-gray-300 p-2 font-mono text-sm" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-bold font-mono py-3 mt-2 disabled:bg-gray-400 hover:bg-neutral-800 transition-colors"
            >
              {loading ? 'SALVANDO...' : 'ATUALIZAR SENHA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
