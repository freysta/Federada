import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { DollarSign, Package, ShoppingCart, XCircle, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function AdminOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/orders/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar os dados do painel');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-mono tracking-widest uppercase border-b-2 border-black pb-2">// Visão Geral</h1>
      
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-black text-white p-6 border border-black shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-mono text-gray-400">FATURAMENTO TOTAL</p>
              <h3 className="text-3xl font-bold mt-1">R$ {stats.totalRevenue?.toFixed(2).replace('.', ',')}</h3>
            </div>
            <DollarSign className="text-[#00f0ff]" size={32} />
          </div>
          <p className="text-[10px] font-mono text-gray-400 border-t border-white/20 pt-2">Soma apenas pedidos PAGOS</p>
        </div>

        <div className="bg-white text-black p-6 border border-black shadow-[4px_4px_0_0_#000]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-mono text-gray-500">ITENS VENDIDOS</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalItemsSold}</h3>
            </div>
            <Package className="text-black" size={32} />
          </div>
          <p className="text-[10px] font-mono text-gray-500 border-t border-black/20 pt-2">Quantidade de produtos despachados</p>
        </div>

        <div className="bg-white text-black p-6 border border-black shadow-[4px_4px_0_0_#000]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-mono text-gray-500">TOTAL DE PEDIDOS</p>
              <h3 className="text-3xl font-bold mt-1">{stats.ordersCount}</h3>
            </div>
            <ShoppingCart className="text-black" size={32} />
          </div>
          <div className="flex gap-4 text-[10px] font-mono font-bold mt-2 pt-2 border-t border-black/20">
            <span className="flex items-center gap-1 text-green-600"><CheckCircle size={10}/> {stats.paidCount} Pagos</span>
            <span className="flex items-center gap-1 text-yellow-600"><Clock size={10}/> {stats.pendingCount} Pend.</span>
            <span className="flex items-center gap-1 text-red-600"><XCircle size={10}/> {stats.cancelledCount} Canc.</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold font-mono tracking-widest uppercase mb-4">Últimos Pedidos</h2>
        <div className="bg-white border border-black overflow-hidden shadow-[4px_4px_0_0_#000]">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-black text-white font-mono text-xs">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">DATA</th>
                <th className="p-3">VALOR</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{order.id.slice(0,8)}</td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 font-bold">R$ {Number(order.amount).toFixed(2).replace('.', ',')}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-mono px-2 py-1 font-bold ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentOrders?.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500 font-mono text-xs">Nenhum pedido recente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
