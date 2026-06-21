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

  useEffect(() => {
    if (isOpen && token) {
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
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-neutral-50">
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
