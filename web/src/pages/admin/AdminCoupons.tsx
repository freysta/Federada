import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, Trash2, Search, Ticket, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';
import { apiClient } from '../../utils/apiClient';

interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxUses: '',
    expiresAt: '',
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      const data = await apiClient.get<Coupon[]>('/coupons');
      setCoupons(data);
    } catch (err) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        maxUses: coupon.maxUses ? coupon.maxUses.toString() : '',
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
        isActive: coupon.isActive
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        maxUses: '',
        expiresAt: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const payload = {
      code: formData.code,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxUses: formData.maxUses ? Number(formData.maxUses) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      isActive: formData.isActive
    };

    try {
      if (editingCoupon) {
        await apiClient.patch(`/coupons/${editingCoupon.id}`, payload);
        toast.success('Cupom atualizado com sucesso!');
      } else {
        await apiClient.post('/coupons', payload);
        toast.success('Cupom criado com sucesso!');
      }
      closeModal();
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar cupom');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      toast.success('Cupom excluído!');
      fetchCoupons();
    } catch (err) {
      toast.error('Erro ao excluir cupom');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Ticket className="text-blue-600" size={28} /> Cupons de Desconto
          </h1>
          <p className="text-slate-500 text-sm mt-1">Crie e gerencie cupons promocionais para a loja virtual.</p>
        </div>

        <button 
          onClick={() => openModal()} 
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Plus size={18} /> Novo Cupom
        </button>
      </div>

      {/* Standard Card & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>
          <div className="text-xs font-mono font-bold text-slate-500">
            Total: {filteredCoupons.length} cupons
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-medium">
              Nenhum cupom encontrado.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">CÓDIGO</th>
                  <th className="px-6 py-4">DESCONTO</th>
                  <th className="px-6 py-4 text-center">USOS</th>
                  <th className="px-6 py-4 text-center">VALIDADE</th>
                  <th className="px-6 py-4 text-center">STATUS</th>
                  <th className="px-6 py-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{coupon.code}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                      {coupon.usesCount} / {coupon.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR') : 'Sem expiração'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        coupon.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {coupon.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openModal(coupon)} 
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center" 
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)} 
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center" 
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          totalItems={filteredCoupons.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold tracking-tight">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cupom *</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black uppercase" 
                  placeholder="EX: BIXO10"
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Desconto</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED'})}
                  >
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Desconto *</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    placeholder={formData.discountType === 'PERCENTAGE' ? "10" : "50.00"}
                    value={formData.discountValue} 
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Usos</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black" 
                    placeholder="Vazio = ilimitado"
                    value={formData.maxUses} 
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Expiração</label>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black text-sm" 
                    value={formData.expiresAt} 
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})} 
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-black transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-black rounded focus:ring-black"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <span className="font-medium text-gray-900">Cupom Ativo</span>
              </label>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-3 font-medium text-gray-600 hover:text-black transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm">
                  {editingCoupon ? 'Atualizar' : 'Criar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
