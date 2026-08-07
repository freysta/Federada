import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Loader2, Search, Download, X, Truck, CheckCircle, Package, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import ColumnFilterHeader, { FilterOption } from '../../components/admin/ColumnFilterHeader';

const ORDER_STATUS_OPTIONS: FilterOption[] = [
  { label: 'Todos os Status', value: 'ALL' },
  { label: 'Pago', value: 'PAID' },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Enviado', value: 'SHIPPED' },
  { label: 'Estornado', value: 'REFUNDED' },
  { label: 'Cancelado', value: 'CANCELLED' },
];

export default function AdminOrders() {
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
    apiClient.get<any>('/orders')
      .then(result => {
        setOrders(result.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar pedidos');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrder = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await apiClient.patch(`/orders/${orderId}`, {
        status: newStatus,
        ...(trackingCode ? { trackingCode } : {})
      });
      
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

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(o => {
    if (!o) return false;
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
    <div className="space-y-6 font-sans">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-blue-600" size={28} /> Gestão de Pedidos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Acompanhe as vendas da loja, altere status de envio e exporte relatórios.</p>
        </div>

        <button 
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      {/* Standard Card & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-xl font-semibold text-sm outline-none focus:border-blue-600 bg-white cursor-pointer"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PAID">Pago</option>
              <option value="PENDING">Pendente</option>
              <option value="SHIPPED">Enviado</option>
              <option value="REFUNDED">Estornado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <div className="text-xs font-mono font-bold text-slate-500 shrink-0">
              Total: {filteredOrders.length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px] border-collapse">
            <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID / DATA</th>
                <th className="px-6 py-4">CLIENTE</th>
                <th className="px-6 py-4">TOTAL</th>
                <th className="px-6 py-4">
                  <ColumnFilterHeader
                    title="STATUS"
                    options={ORDER_STATUS_OPTIONS}
                    selectedValue={statusFilter}
                    onChange={setStatusFilter}
                  />
                </th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">Nenhum pedido encontrado.</td>
                </tr>
              ) : (
                paginatedOrders.map(o => (
                  <tr 
                    key={o.id} 
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900">#{o.id.slice(0,8)}</div>
                      <div className="text-xs text-slate-500 font-mono">{new Date(o.createdAt).toLocaleString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 leading-tight">{o.user?.name}</div>
                      <div className="text-xs text-slate-500">{o.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      R$ {Number(o.amount).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        o.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        (o.status === 'CANCELLED' || o.status === 'REFUNDED') ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        o.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {translateStatus(o.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedOrder(o);
                          setTrackingCode(o.trackingCode || '');
                        }}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                            await apiClient.post(`/orders/${selectedOrder.id}/refund`, {});
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
