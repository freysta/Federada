import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar pedidos');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-black" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-mono tracking-widest uppercase border-b-2 border-black pb-2">// Pedidos Recebidos</h1>
      
      <div className="bg-white border border-black shadow-[4px_4px_0_0_#000] overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[800px]">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">ID / DATA</th>
              <th className="p-3">CLIENTE</th>
              <th className="p-3">ITENS</th>
              <th className="p-3">TOTAL</th>
              <th className="p-3">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-mono font-bold text-xs">{o.id.slice(0,8)}</div>
                  <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('pt-BR')}</div>
                </td>
                <td className="p-3">
                  <div className="font-bold">{o.user?.name}</div>
                  <div className="text-xs text-gray-500">{o.user?.phone}</div>
                </td>
                <td className="p-3">
                  <div className="text-xs font-mono max-w-[250px]">
                    {o.items?.map((i: any) => `${i.quantity}x ${i.productName} ${i.productSize ? `(${i.productSize})` : ''}`).join(', ')}
                  </div>
                </td>
                <td className="p-3 font-mono font-bold whitespace-nowrap">
                  R$ {Number(o.amount).toFixed(2).replace('.', ',')}
                </td>
                <td className="p-3">
                  <span className={`text-[10px] font-mono px-2 py-1 font-bold ${
                    o.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    o.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
