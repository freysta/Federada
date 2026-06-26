import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Search, Download, X, Truck, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = () => {
    fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha');
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar pedidos');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleUpdateOrder = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          ...(trackingCode ? { trackingCode } : {})
        })
      });
      
      if (!res.ok) throw new Error();
      
      toast.success('Pedido atualizado com sucesso!');
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error('Erro ao atualizar pedido');
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(['ID', 'Data', 'Cliente', 'Email', 'Telefone', 'Status', 'Total', 'Itens'].join(','));

    filteredOrders.forEach(o => {
      const date = new Date(o.createdAt).toLocaleString('pt-BR');
      const items = o.items?.map((i: any) => `${i.quantity}x ${i.productName} (${i.productSize || '-'})`).join('; ');
      csvRows.push([
        o.id,
        `"${date}"`,
        `"${o.user?.name || ''}"`,
        `"${o.user?.email || ''}"`,
        `"${o.user?.phone || ''}"`,
        o.status,
        Number(o.amount).toFixed(2),
        `"${items}"`
      ].join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos_federada_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.includes(searchTerm) || o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-black" size={32} /></div>;
  }

  const translateStatus = (status: string) => {
    if (status === 'PAID') return 'PAGO';
    if (status === 'PENDING') return 'PENDENTE';
    if (status === 'CANCELLED') return 'CANCELADO';
    if (status === 'SHIPPED') return 'ENVIADO';
    if (status === 'REFUNDED') return 'ESTORNADO';
    return status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold font-mono tracking-widest uppercase">// Pedidos Recebidos</h1>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 font-mono text-sm hover:bg-neutral-800 transition-colors shadow-[4px_4px_0_0_#ccc]"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome do cliente ou ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-mono text-sm focus:outline-none focus:ring-0"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-black font-mono text-sm focus:outline-none bg-white cursor-pointer"
        >
          <option value="ALL">Todos os Status</option>
          <option value="PAID">Pago</option>
          <option value="PENDING">Pendente</option>
          <option value="SHIPPED">Enviado</option>
          <option value="REFUNDED">Estornado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">ID / DATA</th>
              <th className="px-4 py-3">CLIENTE</th>
              <th className="px-4 py-3">TOTAL</th>
              <th className="px-4 py-3">STATUS</th>
              <th className="px-4 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedOrders.map(o => (
              <tr 
                key={o.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedOrder(o);
                  setTrackingCode(o.trackingCode || '');
                }}
              >
                <td className="px-4 py-2">
                  <div className="font-mono font-bold text-gray-800">{o.id.slice(0,8)}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{new Date(o.createdAt).toLocaleString('pt-BR')}</div>
                </td>
                <td className="px-4 py-2">
                  <div className="font-bold text-gray-800 leading-tight">{o.user?.name}</div>
                  <div className="text-xs text-gray-500">{o.user?.email}</div>
                </td>
                <td className="px-4 py-2 font-mono font-bold whitespace-nowrap text-gray-800">
                  R$ {Number(o.amount).toFixed(2).replace('.', ',')}
                </td>
                <td className="px-4 py-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    o.status === 'PAID' ? 'bg-green-100 text-green-800 border border-green-200' :
                    (o.status === 'CANCELLED' || o.status === 'REFUNDED') ? 'bg-red-100 text-red-800 border border-red-200' : 
                    o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {translateStatus(o.status)}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(o);
                      setTrackingCode(o.trackingCode || '');
                    }}
                    className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
                  >
                    VER DETALHES
                  </button>
                </td>
              </tr>
            ))}
            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Nenhum pedido encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white shrink-0">
              <h2 className="font-mono font-bold text-xl flex items-center gap-2 text-gray-800">
                <Package size={24} className="text-blue-600" /> Pedido: {selectedOrder.id.split('-')[0]}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <div>
                  <h3 className="font-semibold text-xs text-gray-500 mb-3 uppercase tracking-wider">Dados do Cliente</h3>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p className="flex justify-between"><span className="text-gray-500">Nome:</span> <span className="font-medium">{selectedOrder.user?.name}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedOrder.user?.email}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Telefone:</span> <span className="font-medium">{selectedOrder.user?.phone || '-'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">CPF:</span> <span className="font-medium">{selectedOrder.user?.cpf || '-'}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-gray-500 mb-3 uppercase tracking-wider">Status e Pagamento</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-md border ${
                        selectedOrder.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-200' :
                        (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'REFUNDED') ? 'bg-red-100 text-red-800 border-red-200' : 
                        selectedOrder.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {translateStatus(selectedOrder.status)}
                      </span>
                    </div>
                    <p className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Total:</span> 
                      <span className="text-lg font-bold text-gray-900">R$ {Number(selectedOrder.amount).toFixed(2).replace('.', ',')}</span>
                    </p>
                    <p className="flex justify-between text-xs text-gray-400">
                      <span>Data:</span> 
                      <span>{new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h3 className="font-bold text-gray-800">Itens do Pedido</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-left font-sans text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Produto</th>
                        <th className="px-6 py-3 font-semibold">Tamanho</th>
                        <th className="px-6 py-3 font-semibold">Personalização</th>
                        <th className="px-6 py-3 font-semibold text-right">Qtd</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.productName}</td>
                          <td className="px-6 py-4 text-gray-600">{item.productSize || '-'}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {item.customName ? <span className="block">Nome: {item.customName}</span> : null}
                            {item.customNumber ? <span className="block">Nº: {item.customNumber}</span> : null}
                            {!item.customName && !item.customNumber && '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Ações e Envio</h3>
                
                {selectedOrder.status === 'PAID' && (
                  <div className="space-y-4 bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código de Rastreio (Correios/Transportadora):</label>
                      <input 
                        type="text" 
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="Ex: BR123456789"
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => handleUpdateOrder(selectedOrder.id, 'SHIPPED')}
                        disabled={updating}
                        className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-50"
                      >
                        {updating ? <Loader2 className="animate-spin" size={20} /> : <Truck size={20} />}
                        Marcar como Enviado
                      </button>
                      
                      <button 
                        onClick={async () => {
                          if (!window.confirm('ATENÇÃO: O estorno pelo Mercado Pago é irreversível. Deseja devolver o dinheiro para o cliente e cancelar este pedido?')) return;
                          setUpdating(true);
                          try {
                            const res = await fetch(`${API_URL}/orders/${selectedOrder.id}/refund`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            if (!res.ok) throw new Error();
                            toast.success('Pedido estornado com sucesso!');
                            setSelectedOrder(null);
                            fetchOrders();
                          } catch {
                            toast.error('Erro ao estornar pedido (verifique o Mercado Pago)');
                          } finally {
                            setUpdating(false);
                          }
                        }}
                        disabled={updating}
                        className="flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 border border-red-200 rounded-lg transition-all disabled:opacity-50"
                      >
                        {updating ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                        Estornar Valor
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                  <div className="bg-green-50 border border-green-200 p-5 rounded-xl shadow-sm text-green-800 text-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <CheckCircle size={24} /> Pedido Despachado
                    </div>
                    <p className="mt-1"><strong className="font-medium text-green-900">Rastreio:</strong> <span className="bg-white px-2 py-1 rounded border border-green-100 font-mono">{selectedOrder.trackingCode || 'Não informado'}</span></p>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
