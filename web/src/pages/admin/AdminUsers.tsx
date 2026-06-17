import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const handlePromote = async (id: string) => {
    if (!confirm('Atenção: Este usuário terá acesso total ao painel. Deseja continuar?')) return;
    
    try {
      const res = await fetch(`${API_URL}/users/${id}/promote`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Erro ao promover');
      toast.success('Usuário promovido a ADMIN!');
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
      <h1 className="text-2xl font-bold font-mono tracking-widest uppercase border-b-2 border-black pb-2">// Usuários Cadastrados</h1>
      
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
    </div>
  );
}
