import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Search, Download, X, Truck, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

      <div className="bg-white border border-black shadow-[4px_4px_0_0_#000] overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[800px]">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">ID / DATA</th>
              <th className="p-3">CLIENTE</th>
              <th className="p-3">TOTAL</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-mono font-bold text-xs">{o.id.slice(0,8)}</div>
                  <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('pt-BR')}</div>
                </td>
                <td className="p-3">
                  <div className="font-bold">{o.user?.name}</div>
                  <div className="text-xs text-gray-500">{o.user?.email}</div>
                </td>
                <td className="p-3 font-mono font-bold whitespace-nowrap">
                  R$ {Number(o.amount).toFixed(2).replace('.', ',')}
                </td>
                <td className="p-3">
                  <span className={`text-[10px] font-mono px-2 py-1 font-bold ${
                    o.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    (o.status === 'CANCELLED' || o.status === 'REFUNDED') ? 'bg-red-100 text-red-800' : 
                    o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {translateStatus(o.status)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => {
                      setSelectedOrder(o);
                      setTrackingCode(o.trackingCode || '');
                    }}
                    className="text-xs font-mono bg-black text-white px-3 py-1 hover:bg-neutral-800 transition-colors"
                  >
                    VER DETALHES
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 font-mono text-sm">Nenhum pedido encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_0_#000]">
            <div className="flex justify-between items-center p-4 border-b-2 border-black bg-neutral-100">
              <h2 className="font-mono font-bold text-lg flex items-center gap-2">
                <Package size={20} /> Pedido: {selectedOrder.id.slice(0,8)}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="hover:text-red-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-mono font-bold text-xs text-gray-500 mb-2">DADOS DO CLIENTE</h3>
                  <div className="font-sans text-sm">
                    <p><strong>Nome:</strong> {selectedOrder.user?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.user?.phone || '-'}</p>
                    <p><strong>CPF:</strong> {selectedOrder.user?.cpf || '-'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-mono font-bold text-xs text-gray-500 mb-2">STATUS E PAGAMENTO</h3>
                  <div className="font-sans text-sm">
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`text-xs font-mono px-2 py-0.5 font-bold ${
                        selectedOrder.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'REFUNDED') ? 'bg-red-100 text-red-800' : 
                        selectedOrder.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {translateStatus(selectedOrder.status)}
                      </span>
                    </p>
                    <p><strong>Total:</strong> R$ {Number(selectedOrder.amount).toFixed(2).replace('.', ',')}</p>
                    <p><strong>Data:</strong> {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-mono font-bold text-xs text-gray-500 mb-2">ITENS DO PEDIDO</h3>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left font-sans text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-2">Produto</th>
                        <th className="p-2">Tamanho</th>
                        <th className="p-2">Personalização</th>
                        <th className="p-2 text-right">Qtd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 last:border-0">
                          <td className="p-2 font-bold">{item.productName}</td>
                          <td className="p-2">{item.productSize || '-'}</td>
                          <td className="p-2 text-xs">
                            {item.customName ? `Nome: ${item.customName}` : ''}
                            {item.customNumber ? ` | Nº: ${item.customNumber}` : ''}
                            {!item.customName && !item.customNumber && '-'}
                          </td>
                          <td className="p-2 text-right font-mono">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t-2 border-black pt-4 mt-4 space-y-4">
                <h3 className="font-mono font-bold text-sm mb-2">ATUALIZAR ENVIO</h3>
                
                {selectedOrder.status === 'PAID' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono mb-1">Código de Rastreio (Correios/Transportadora):</label>
                      <input 
                        type="text" 
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="Ex: BR123456789"
                        className="w-full p-2 border-2 border-black font-mono text-sm focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleUpdateOrder(selectedOrder.id, 'SHIPPED')}
                      disabled={updating}
                      className="w-full flex justify-center items-center gap-2 bg-[#00f0ff] hover:bg-[#00c0cc] text-black font-bold font-mono py-3 border-2 border-black shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                    >
                      {updating ? <Loader2 className="animate-spin" size={20} /> : <Truck size={20} />}
                      MARCAR COMO ENVIADO
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
                      className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold font-mono py-3 border-2 border-black shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 mt-4"
                    >
                      {updating ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                      ESTORNAR VALOR
                    </button>
                  </div>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded text-green-800 text-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle size={20} /> Pedido Despachado
                    </div>
                    <p><strong>Rastreio:</strong> {selectedOrder.trackingCode || 'Não informado'}</p>
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
