import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, ShieldAlert, Edit, Ban, CheckCircle, Package, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
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
      
      <div className="bg-white border border-black shadow-[4px_4px_0_0_#000] overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[600px]">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">NOME / EMAIL</th>
              <th className="p-3">TIPO</th>
              <th className="p-3">WHATSAPP</th>
              <th className="p-3">STATUS / CARGO</th>
              <th className="p-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => openDetails(u)}>
                <td className="p-3">
                  <div className="font-bold uppercase flex items-center gap-2">
                    {u.name} {u.id === currentUser?.id && <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">VOCÊ</span>}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                </td>
                <td className="p-3">
                  <div className="text-xs font-bold">{u.userType || 'N/A'}</div>
                  {u.period && <div className="text-[10px] text-gray-500">{u.period}</div>}
                </td>
                <td className="p-3 font-mono text-xs">{u.phone || '-'}</td>
                <td className="p-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`text-[9px] font-mono px-2 py-0.5 font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}>
                      {u.role}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 font-bold ${u.isActive !== false ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                      {u.isActive !== false ? 'ATIVO' : 'DESATIVADO'}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(u); }} className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors">
                    <Edit size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDetailsOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl border border-black shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gray-100 border-b border-gray-300 text-black p-4 font-mono text-xs tracking-widest flex justify-between shrink-0 font-bold">
              DETALHES DO USUÁRIO
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-500 hover:text-black">FECHAR</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold uppercase">{selectedUser.name}</h2>
                  <p className="text-gray-500 font-mono text-sm">{selectedUser.email}</p>
                  <p className="text-gray-500 font-mono text-sm">CPF: {selectedUser.cpf || 'Não informado'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(selectedUser)} className="flex items-center gap-1 bg-gray-100 px-3 py-1 text-xs font-bold border border-gray-300 hover:bg-gray-200">
                    <Edit size={14} /> EDITAR
                  </button>
                  <button 
                    onClick={() => handleToggleActive(selectedUser)} 
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold border ${selectedUser.isActive !== false ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                  >
                    {selectedUser.isActive !== false ? <><Ban size={14} /> DESATIVAR</> : <><CheckCircle size={14} /> ATIVAR</>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 bg-white p-5 border border-gray-200 rounded-sm">
                <div>
                  <div className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wider">TIPO DE VÍNCULO</div>
                  <div className="font-mono text-sm font-bold">{selectedUser.userType || 'N/A'} {selectedUser.period && `(${selectedUser.period})`}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wider">CARGO NO SISTEMA</div>
                  <div className="font-mono text-sm font-bold">{selectedUser.role}</div>
                </div>
                {selectedUser.phone && (
                  <div className="col-span-2 pt-2 border-t border-gray-100">
                    <div className="text-[10px] text-gray-500 font-mono mb-3 uppercase tracking-wider">CONTATO DIRETO</div>
                    <a href={`https://wa.me/55${selectedUser.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-2.5 text-xs font-mono font-bold rounded hover:bg-[#20bd5a] transition-colors shadow-sm w-full sm:w-auto">
                      <MessageCircle size={16} /> CHAMAR NO WHATSAPP
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold font-mono border-b border-black pb-2 mb-4 flex items-center gap-2">
                  <Package size={18} /> HISTÓRICO DE PEDIDOS
                </h3>
                <div className="space-y-3">
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
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg border border-black shadow-[8px_8px_0_0_#000]">
            <div className="bg-gray-100 border-b border-gray-300 text-black p-4 font-mono text-xs tracking-widest flex justify-between shrink-0 font-bold">
              {editingId ? 'EDITAR USUÁRIO' : 'NOVO USUÁRIO'}
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">FECHAR</button>
            </div>
            <form onSubmit={handleSubmitUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-gray-600 mb-1">NOME COMPLETO</label>
                  <input required type="text" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-gray-600 mb-1">E-MAIL</label>
                  <input required type="email" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-600 mb-1">CPF (Opcional)</label>
                  <input type="text" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-600 mb-1">WHATSAPP</label>
                  <input required type="text" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-gray-600 mb-1">SENHA {editingId && '(Deixe em branco para não alterar)'}</label>
                  <input type="password" minLength={6} required={!editingId} className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <hr className="border-gray-200 my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-600 mb-1">TIPO DE VÍNCULO</label>
                  <select value={formData.userType} onChange={e => setFormData({...formData, userType: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm bg-white">
                    <option value="ALUNO">Aluno</option>
                    <option value="PROFESSOR">Professor</option>
                    <option value="FAMILIAR">Familiar / Apoiador</option>
                  </select>
                </div>
                {formData.userType === 'ALUNO' && (
                  <div>
                    <label className="block text-xs font-mono text-gray-600 mb-1">PERÍODO</label>
                    <input type="text" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-gray-600 mb-1">CARGO NO SISTEMA</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm bg-white">
                    <option value="CUSTOMER">CLIENTE (Padrão)</option>
                    <option value="ADMIN">ADMINISTRADOR</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#00f0ff] text-black font-bold font-mono py-3 mt-4 border border-black shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all">
                {editingId ? 'SALVAR ALTERAÇÕES' : 'CRIAR USUÁRIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
