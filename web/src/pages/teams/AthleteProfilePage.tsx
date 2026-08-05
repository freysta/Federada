import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import toast from 'react-hot-toast';
import { KeyRound, ShieldCheck, Package, Loader2, LogOut } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productName: string;
  productSize?: string;
  quantity: number;
  price: number;
  customName?: string;
  customNumber?: string;
  playerType?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  amount: number;
  status: string;
  createdAt: string;
  pixCopyPaste?: string;
  paymentId?: string;
}

export default function AthleteProfilePage() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (token) {
      setLoadingOrders(true);
      apiClient.get<Order[]>('/orders/me')
      .then(data => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Erro ao buscar pedidos', err);
        setLoadingOrders(false);
      });
    }
  }, [token]);

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
      await apiClient.put('/users/me/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

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
      await apiClient.put<any>('/users/me', {
        name: profileData.name || undefined,
        phone: profileData.phone || undefined,
        userType: profileData.userType,
        period: profileData.userType === 'ALUNO' ? profileData.period : undefined
      });

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
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Minha Conta</h1>
              <p className="text-sm text-gray-500 mt-1">Gerencie suas configurações, segurança e veja seus pedidos.</p>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-lg hover:bg-red-100 transition-colors border border-red-200">
              <LogOut size={16} /> Sair da Conta
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col lg:flex-row gap-8">
        {/* Lado Esquerdo - Perfil */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name} <span className="text-sm font-normal text-gray-500">(você)</span></h2>
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
          
          {!showPasswordForm ? (
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-4">Sua senha é privada. Recomendamos o uso de senhas fortes.</p>
              <button 
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-300 transition-colors"
              >
                Alterar minha senha
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.currentPassword}
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.newPassword}
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-gray-800 text-white font-bold hover:bg-black transition-all shadow-md disabled:bg-gray-400 text-sm"
                >
                  {loading ? 'Salvando...' : 'Confirmar Alteração'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Histórico de Pedidos Abaixo */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-800 text-white p-4 flex items-center gap-3">
          <Package size={20} />
          <h3 className="font-mono text-sm tracking-[0.2em] uppercase font-bold">
            HISTÓRICO DE PEDIDOS
          </h3>
        </div>
        <div className="p-6">
          {loadingOrders ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-800" size={32} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-mono text-sm border border-dashed border-gray-300 rounded-lg">
              Nenhum pedido encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-mono text-[10px] text-gray-400 mb-1">ID: {order.id.slice(0, 8)}</div>
                      <div className="text-xs font-medium text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-mono font-bold text-slate-800">R$ {Number(order.amount).toFixed(2).replace('.', ',')}</span>
                      <span className={`text-[10px] px-2 py-1 font-mono font-bold rounded-full ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-800 border border-green-300' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-slate-200 pt-3 mt-1 flex flex-col gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{item.quantity}x</span>
                            <span className="truncate max-w-[150px]">{item.productName}</span>
                            {item.productSize && <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">{item.productSize}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  </div>
</>
  );
}
