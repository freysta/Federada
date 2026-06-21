import { X, Package, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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

export default function DashboardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PEDIDOS' | 'ATLETICA'>('PEDIDOS');
  
  // Atlética State
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');

  useEffect(() => {
    if (isOpen && token && activeTab === 'PEDIDOS') {
      setLoading(true);
      fetch(`${API_URL}/orders/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao buscar pedidos');
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar pedidos', err);
        setLoading(false);
      });
    }
    
    if (isOpen && token && activeTab === 'ATLETICA') {
      setLoadingProfile(true);
      fetch(`${API_URL}/teams/my/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setAthleteProfile(data || null);
        setLoadingProfile(false);
      })
      .catch(err => {
        console.error('Erro ao buscar perfil de atleta', err);
        setLoadingProfile(false);
      });
    }
  }, [isOpen, token, activeTab]);

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode, cpf, birthDate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao entrar na Atlética');
      
      toast.success('Entrou na Atlética com sucesso!');
      setAthleteProfile(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-3xl shadow-2xl border border-black flex flex-col max-h-[90vh] rounded-t-2xl md:rounded-none animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
        <div className="bg-black text-white p-4 flex justify-between items-center shrink-0 rounded-t-xl md:rounded-none">
          <div className="flex items-center gap-3">
            <Package size={20} />
            <h3 className="font-mono text-sm tracking-[0.2em] uppercase">
              MINHA CONTA :: {user?.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-black shrink-0 bg-white">
          <button 
            onClick={() => setActiveTab('PEDIDOS')}
            className={`flex-1 py-3 text-sm font-bold font-mono transition-colors ${activeTab === 'PEDIDOS' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            PEDIDOS
          </button>
          <button 
            onClick={() => setActiveTab('ATLETICA')}
            className={`flex-1 py-3 text-sm font-bold font-mono transition-colors border-l border-black ${activeTab === 'ATLETICA' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
          >
            MINHA ATLÉTICA
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-neutral-50">
          
          {activeTab === 'PEDIDOS' && (
            <>
              <h4 className="font-bold text-lg mb-6 border-b border-black pb-2">HISTÓRICO DE PEDIDOS</h4>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-mono text-sm border border-dashed border-gray-300">
                  Nenhum pedido encontrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-black p-4 flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <div className="font-mono text-[10px] text-gray-400 mb-1">ID: {order.id.slice(0, 8)}</div>
                          <div className="text-xs text-gray-600">
                            Data: {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="font-mono font-bold">R$ {Number(order.amount).toFixed(2).replace('.', ',')}</span>
                          <span className={`text-[10px] px-2 py-1 font-mono font-bold border ${
                            order.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-300' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-gray-200 pt-2 space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-600">
                              <span>
                                {item.quantity}x {item.productName}
                                {item.productSize ? ` (${item.productSize})` : ''}
                                {item.customName ? ` — ${item.customName} #${item.customNumber} (${item.playerType})` : ''}
                              </span>
                              <span className="font-mono">R$ {Number(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'ATLETICA' && (
            <>
              <h4 className="font-bold text-lg mb-6 border-b border-black pb-2">PERFIL DE ATLETA</h4>
              {loadingProfile ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              ) : athleteProfile && athleteProfile.team ? (
                <div className="bg-white border-2 border-black p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center font-bold text-2xl border border-black overflow-hidden">
                    {athleteProfile.team.logoUrl ? <img src={athleteProfile.team.logoUrl} className="w-full h-full object-cover" /> : athleteProfile.team.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold uppercase">{athleteProfile.team.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{athleteProfile.team.university}</p>
                  
                  <div className="w-full text-left bg-gray-50 p-4 border border-gray-200 mt-4">
                    <h5 className="font-mono font-bold text-xs text-gray-500 mb-2 uppercase">Seus Dados</h5>
                    <p className="text-sm"><strong>CPF:</strong> {athleteProfile.cpf}</p>
                    <p className="text-sm"><strong>Data de Nasc:</strong> {athleteProfile.birthDate}</p>
                    <p className="text-sm"><strong>Status Doc:</strong> {athleteProfile.status}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-black p-6">
                  <h5 className="font-bold mb-2">Vincular a uma Atlética</h5>
                  <p className="text-sm text-gray-600 mb-6">Para participar dos campeonatos, você precisa se juntar a uma Atlética usando um Código de Convite fornecido pelo presidente.</p>
                  
                  <form onSubmit={handleJoinTeam} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold font-mono mb-1">CÓDIGO DE CONVITE</label>
                      <input 
                        required
                        type="text" 
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                        placeholder="Ex: FEDE-1234"
                        className="w-full border border-black p-2 font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold font-mono mb-1">CPF DO ATLETA</label>
                      <input 
                        required
                        type="text" 
                        value={cpf}
                        onChange={e => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full border border-black p-2 font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold font-mono mb-1">DATA DE NASCIMENTO</label>
                      <input 
                        required
                        type="date" 
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                        className="w-full border border-black p-2 font-mono" 
                      />
                    </div>
                    <button type="submit" className="w-full bg-black text-white font-bold py-3 mt-4 hover:bg-neutral-800 transition-colors">
                      ENTRAR PARA ATLÉTICA
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>

        <div className="p-4 bg-white border-t border-black shrink-0 flex justify-between items-center">
          {user?.role === 'ADMIN' ? (
            <Link to="/admin" onClick={onClose} className="text-xs font-mono font-bold text-blue-600 hover:underline">
              [ PAINEL ADMIN ]
            </Link>
          ) : <div></div>}
          <button onClick={() => { logout(); onClose(); }} className="text-xs font-mono font-bold text-red-600 hover:underline">
            [ SAIR DA CONTA ]
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
