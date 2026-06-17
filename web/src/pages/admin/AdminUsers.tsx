import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha na requisição');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handlePromote = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja promover este usuário a Administrador?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}/promote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Erro ao promover');
      toast.success('Usuário promovido com sucesso!');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/admin-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar usuário');
      }
      toast.success('Usuário criado com sucesso!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', cpf: '', phone: '', password: '', role: 'CUSTOMER' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-black" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-wider">Gestão de Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">Controle de acesso e membros da plataforma</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-neutral-800 transition-colors">
          + NOVO USUÁRIO
        </button>
      </div>
      
      <div className="bg-white border border-black shadow-[4px_4px_0_0_#000] overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[600px]">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">NOME / EMAIL</th>
              <th className="p-3">CPF</th>
              <th className="p-3">WHATSAPP</th>
              <th className="p-3">CARGO</th>
              <th className="p-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-bold uppercase">{u.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                </td>
                <td className="p-3 font-mono text-xs">{u.cpf}</td>
                <td className="p-3 font-mono text-xs">{u.phone}</td>
                <td className="p-3">
                  <span className={`text-[10px] font-mono px-2 py-1 font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {u.role !== 'ADMIN' && (
                    <button 
                      onClick={() => handlePromote(u.id)}
                      className="text-[10px] bg-black text-white font-mono px-2 py-1 flex items-center gap-1 hover:bg-neutral-800 ml-auto"
                    >
                      <ShieldAlert size={12} /> VIRAR ADMIN
                    </button>
                  )}
                  {u.id === currentUser?.id && (
                    <span className="text-[10px] font-mono text-gray-400">VOCÊ</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-black shadow-[8px_8px_0_0_#000]">
            <div className="bg-black text-white p-3 font-mono text-xs tracking-widest flex justify-between">
              NOVO USUÁRIO
              <button onClick={() => setIsModalOpen(false)}>FECHAR</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <input required type="text" placeholder="NOME COMPLETO" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="email" placeholder="E-MAIL" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required type="text" placeholder="CPF" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
              <input required type="text" placeholder="WHATSAPP" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required type="password" placeholder="SENHA PROVISÓRIA" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm">
                <option value="CUSTOMER">CLIENTE (TORCEDOR)</option>
                <option value="ADMIN">ADMINISTRADOR</option>
              </select>

              <button type="submit" className="w-full bg-[#00f0ff] text-black font-bold font-mono py-3 border border-black shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all">
                CADASTRAR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
