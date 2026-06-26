import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Edit, Ban, CheckCircle, Package, MessageCircle, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
    userType: 'ALUNO',
    period: '',
    isActive: true
  });

  const fetchData = async () => {
    try {
      const [resUsers, resOrders] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (!resUsers.ok || !resOrders.ok) throw new Error('Falha na requisição');
      setUsers(await resUsers.json());
      setOrders(await resOrders.json());
    } catch (err) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `${API_URL}/users/${editingId}` : `${API_URL}/users/admin-create`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (!payload.password) {
        delete (payload as any).password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao salvar usuário');
      }
      toast.success(isEdit ? 'Usuário atualizado!' : 'Usuário criado!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', cpf: '', phone: '', password: '', role: 'CUSTOMER', userType: 'ALUNO', period: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setEditingId(u.id);
    setFormData({ 
      name: u.name, email: u.email, cpf: u.cpf || '', phone: u.phone || '', 
      password: '', role: u.role, userType: u.userType || 'ALUNO', period: u.period || '', isActive: u.isActive !== false 
    });
    setIsDetailsOpen(false);
    setIsModalOpen(true);
  };

  const openDetails = (u: any) => {
    setSelectedUser(u);
    setIsDetailsOpen(true);
  };

  const handleToggleActive = async (u: any) => {
    if (!window.confirm(`Deseja ${u.isActive === false ? 'ativar' : 'desativar'} este usuário?`)) return;
    try {
      const res = await fetch(`${API_URL}/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: u.isActive === false ? true : false })
      });
      if (!res.ok) throw new Error('Erro ao alterar status');
      toast.success('Status atualizado!');
      fetchData();
      if (selectedUser?.id === u.id) setSelectedUser({ ...u, isActive: !u.isActive });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (!window.confirm(`ATENÇÃO: Tem certeza que deseja EXCLUIR DEFINITIVAMENTE o usuário ${u.name}? Esta ação não pode ser desfeita e excluirá todos os pedidos relacionados.`)) return;
    try {
      const res = await fetch(`${API_URL}/users/${u.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao excluir usuário');
      toast.success('Usuário excluído com sucesso!');
      setIsDetailsOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.cpf?.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-black" size={32} /></div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Gestão de Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie membros, cargos e visualize históricos</p>
        </div>
        <button onClick={openNewModal} className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-neutral-800 transition-colors">
          + NOVO USUÁRIO
        </button>
      </div>
      
      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou CPF..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">NOME / EMAIL</th>
                <th className="px-4 py-3">TIPO</th>
                <th className="px-4 py-3">WHATSAPP</th>
                <th className="px-4 py-3">STATUS / CARGO</th>
                <th className="px-4 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                paginatedUsers.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => openDetails(u)}>
                <td className="px-4 py-2">
                  <div className="font-bold uppercase flex items-center gap-2 text-gray-800">
                    {u.name} {u.id === currentUser?.id && <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">VOCÊ</span>}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                </td>
                <td className="px-4 py-2">
                  <div className="text-xs font-bold text-gray-800">{u.userType || 'N/A'}</div>
                  {u.period && <div className="text-[10px] text-gray-500">{u.period}</div>}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{u.phone || '-'}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`text-[9px] font-mono px-2.5 py-0.5 font-bold rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                      u.role === 'STORE_ADMIN' ? 'bg-green-100 text-green-800 border border-green-200' :
                      u.role === 'SPORTS_ADMIN' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {u.role === 'ADMIN' ? 'SUPER ADMIN' : u.role === 'STORE_ADMIN' ? 'GERENTE LOJA' : u.role === 'SPORTS_ADMIN' ? 'ORG. ESPORTIVO' : u.role}
                    </span>
                    <span className={`text-[9px] font-mono px-2.5 py-0.5 font-bold rounded-full ${u.isActive !== false ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                      {u.isActive !== false ? 'ATIVO' : 'DESATIVADO'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(u); }} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      </div>
      {isDetailsOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="bg-white border-b border-gray-200 text-gray-800 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold font-mono">Detalhes do Usuário</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gray-50/30">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{selectedUser.email}</p>
                  <p className="text-gray-500 text-sm">CPF: {selectedUser.cpf || 'Não informado'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openEditModal(selectedUser)} className="flex items-center gap-2 bg-white px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                    <Edit size={16} /> Editar
                  </button>
                  <button 
                    onClick={() => handleToggleActive(selectedUser)} 
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${selectedUser.isActive !== false ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}
                  >
                    {selectedUser.isActive !== false ? <><Ban size={16} /> Desativar</> : <><CheckCircle size={16} /> Ativar</>}
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(selectedUser)} 
                    className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Vínculo</div>
                  <div className="text-base font-medium text-gray-900">{selectedUser.userType || 'N/A'} {selectedUser.period && `(${selectedUser.period})`}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Cargo no Sistema</div>
                  <div className="text-base font-medium text-gray-900">{selectedUser.role}</div>
                </div>
                {selectedUser.phone && (
                  <div className="sm:col-span-2 pt-4 border-t border-gray-100 mt-2">
                    <div className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider">Contato</div>
                    <a href={`https://wa.me/55${selectedUser.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 text-sm font-bold rounded-lg hover:bg-[#20bd5a] transition-all shadow-md w-full sm:w-auto">
                      <MessageCircle size={18} /> Chamar no WhatsApp
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                  <Package size={20} className="text-gray-500" />
                  <h3 className="font-bold text-gray-800">Histórico de Pedidos</h3>
                </div>
                <div className="p-6">
                  {orders.filter(o => o.user?.id === selectedUser.id).length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Nenhum pedido encontrado para este usuário.</p>
                  ) : (
                    orders.filter(o => o.user?.id === selectedUser.id).map(o => (
                      <div key={o.id} className="border border-gray-200 p-3 flex justify-between items-center bg-white hover:bg-gray-50">
                        <div>
                          <div className="font-mono text-xs text-gray-500">ID: {o.id.split('-')[0]}</div>
                          <div className="font-bold text-sm">R$ {Number(o.amount).toFixed(2).replace('.', ',')}</div>
                          <div className="text-xs text-gray-500 mt-1">{o.items?.length || 0} itens</div>
                        </div>
                        <div className={`px-2 py-1 text-[10px] font-bold font-mono border ${
                          o.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-300' :
                          o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {o.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold font-mono text-gray-800">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitUser} className="p-6 space-y-5 overflow-y-auto custom-scrollbar bg-gray-50/30">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input required type="text" className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input required type="email" className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Opcional)</label>
                  <input type="text" className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input required type="text" className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha {editingId && <span className="text-gray-500 font-normal text-xs">(Deixe em branco para não alterar)</span>}</label>
                  <input type="password" minLength={6} required={!editingId} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vínculo</label>
                  <select value={formData.userType} onChange={e => setFormData({...formData, userType: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white">
                    <option value="ALUNO">Aluno</option>
                    <option value="PROFESSOR">Professor</option>
                    <option value="FAMILIAR">Familiar / Apoiador</option>
                  </select>
                </div>
                {formData.userType === 'ALUNO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <input type="text" className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo no Sistema</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="block w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white">
                    <option value="CUSTOMER">Cliente (Padrão)</option>
                    <option value="ADMIN">Super Administrador</option>
                    <option value="STORE_ADMIN">Gerente da Loja (E-Commerce/Fórum)</option>
                    <option value="SPORTS_ADMIN">Organizador Esportivo (Campeonatos/Fórum)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md">
                  {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
