import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/apiClient';
import { DollarSign, Package, ShoppingCart, XCircle, Clock, CheckCircle, Trophy, Users, FileCheck2, Activity, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import type { IOrder } from '../../types';

interface StoreStats {
  totalRevenue: number;
  totalItemsSold: number;
  ordersCount: number;
  paidCount: number;
  pendingCount: number;
  cancelledCount: number;
  chartData: { date: string; vendas: number }[];
  recentOrders: IOrder[];
}

interface SportsStats {
  totalChampionships: number;
  totalAthletes: number;
  pendingDocuments: number;
  totalSubscriptions: number;
}

export default function AdminOverview() {
  const { user, token } = useAuth();
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [sportsStats, setSportsStats] = useState<SportsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === 'ADMIN';
  const isStoreAdmin = user?.role === 'STORE_ADMIN' || isSuperAdmin;
  const isSportsAdmin = user?.role === 'SPORTS_ADMIN' || isSuperAdmin;

  useEffect(() => {
    const fetchPromises = [];

    if (isStoreAdmin) {
      fetchPromises.push(
        apiClient.get<StoreStats>('/orders/dashboard')
          .then(data => setStoreStats(data))
      );
    }

    if (isSportsAdmin) {
      fetchPromises.push(
        apiClient.get<SportsStats>('/championships/dashboard')
          .then(data => setSportsStats(data))
      );
    }

    Promise.allSettled(fetchPromises).then((results) => {
      const hasError = results.some(r => r.status === 'rejected');
      if (hasError) toast.error('Erro parcial ao carregar os dados do painel');
      setLoading(false);
    });
  }, [token, isStoreAdmin, isSportsAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <LayoutDashboard className="text-blue-600" size={28} /> Visão Geral
        </h1>
        <p className="text-slate-500 text-sm mt-1">Acompanhe métricas, vendas e inscrições do sistema.</p>
      </div>

      {isSportsAdmin && sportsStats && (
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Trophy size={16} className="text-blue-600" /> Hub Esportivo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Campeonatos</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-2">{sportsStats.totalChampionships}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Trophy size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Atletas Registrados</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-2">{sportsStats.totalAthletes}</h3>
                </div>
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Inscrições (Modalidades)</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-2">{sportsStats.totalSubscriptions}</h3>
                </div>
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                  <Activity size={24} />
                </div>
              </div>
            </div>

            <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${
              sportsStats.pendingDocuments > 0 
                ? 'bg-rose-50/50 border-rose-200 text-rose-900' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className={`text-xs font-black uppercase tracking-wider ${sportsStats.pendingDocuments > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Docs Pendentes</p>
                  <h3 className="text-3xl font-black mt-2">{sportsStats.pendingDocuments}</h3>
                </div>
                <div className={`p-3 rounded-xl ${sportsStats.pendingDocuments > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                  <FileCheck2 size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStoreAdmin && storeStats && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-600" /> E-Commerce
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Faturamento Total</p>
                    <h3 className="text-3xl font-black mt-2">R$ {storeStats.totalRevenue?.toFixed(2).replace('.', ',')}</h3>
                  </div>
                  <div className="p-3 bg-white/10 text-white rounded-xl">
                    <DollarSign size={24} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 border-t border-white/10 pt-2 font-mono">Soma apenas pedidos PAGOS</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Itens Vendidos</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{storeStats.totalItemsSold}</h3>
                  </div>
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                    <Package size={24} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">Quantidade de produtos despachados</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Total de Pedidos</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{storeStats.ordersCount}</h3>
                  </div>
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                    <ShoppingCart size={24} />
                  </div>
                </div>
                <div className="flex gap-4 text-[10px] font-bold mt-2 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={12}/> {storeStats.paidCount} Pagos</span>
                  <span className="flex items-center gap-1 text-amber-500"><Clock size={12}/> {storeStats.pendingCount} Pend.</span>
                  <span className="flex items-center gap-1 text-rose-600"><XCircle size={12}/> {storeStats.cancelledCount} Canc.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-6">Vendas por Dia</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storeStats.chartData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '12px'}}
                      formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                    />
                    <Bar dataKey="vendas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Últimos Pedidos</h2>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">VALOR</th>
                      <th className="px-4 py-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {storeStats.recentOrders?.slice(0, 5).map((order: IOrder) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">R$ {Number(order.amount).toFixed(2).replace('.', ',')}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                            order.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {order.status === 'PAID' ? 'PAGO' : order.status === 'PENDING' ? 'PENDENTE' : order.status === 'SHIPPED' ? 'ENVIADO' : 'CANCELADO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!storeStats.recentOrders || storeStats.recentOrders.length === 0) && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-500">Nenhum pedido recente.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
