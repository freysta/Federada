import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    sizes: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : null,
      };

      const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar produto');

      toast.success(editingId ? 'Produto atualizado!' : 'Produto criado!');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (prod: any) => {
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      imageUrl: prod.imageUrl || '',
      sizes: prod.sizes ? prod.sizes.join(', ') : ''
    });
    setEditingId(prod.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao deletar');
      toast.success('Produto excluído');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openNewModal = () => {
    setFormData({ name: '', description: '', price: '', imageUrl: '', sizes: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-black" size={32} /></div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end border-b-2 border-black pb-2">
        <h1 className="text-2xl font-bold font-mono tracking-widest uppercase">// Produtos</h1>
        <button onClick={openNewModal} className="bg-black text-white px-4 py-2 font-mono text-sm hover:bg-neutral-800 transition-colors flex items-center gap-2">
          <Plus size={16} /> NOVO
        </button>
      </div>
      
      <div className="bg-white border border-black shadow-[4px_4px_0_0_#000] overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[600px]">
          <thead className="bg-black text-white font-mono text-xs">
            <tr>
              <th className="p-3">FOTO</th>
              <th className="p-3">NOME</th>
              <th className="p-3">PREÇO</th>
              <th className="p-3">TAMANHOS</th>
              <th className="p-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="p-3">
                  <div className="w-10 h-10 bg-gray-200 overflow-hidden">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="p-3 font-bold uppercase">{p.name}</td>
                <td className="p-3 font-mono">R$ {Number(p.price).toFixed(2).replace('.', ',')}</td>
                <td className="p-3 font-mono text-xs">{p.sizes ? p.sizes.join(', ') : '-'}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg border border-black shadow-2xl">
            <div className="bg-black text-white p-3 font-mono text-xs tracking-widest flex justify-between">
              {editingId ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
              <button onClick={() => setIsModalOpen(false)}>FECHAR</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input required placeholder="NOME DO PRODUTO" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="number" step="0.01" placeholder="PREÇO (EX: 50.00)" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <textarea placeholder="DESCRIÇÃO" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <input placeholder="URL DA IMAGEM" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              <input placeholder="TAMANHOS (separados por vírgula. Ex: P, M, G)" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
              
              <button type="submit" className="w-full bg-[#00f0ff] text-black font-bold font-mono py-3 border border-black shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all">
                SALVAR PRODUTO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
