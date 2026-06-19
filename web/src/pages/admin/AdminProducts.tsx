import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  extraImages: string[];
  sizes: string[];
  category: string;
  isCustomizable: boolean;
}

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sizes: '',
    category: 'GERAL',
    isCustomizable: false
  });
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Falha');
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

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_URL}/upload`, { 
      method: 'POST', 
      body: fd,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Falha no upload da imagem');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loadingToast = toast.loading('Salvando produto...');
      
      let finalUrls = [...existingImages];

      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(file => uploadImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        finalUrls.push(...uploadedUrls);
      }

      const imageUrl = finalUrls[0] || '';
      const extraImages = finalUrls.slice(1);

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        isCustomizable: formData.isCustomizable,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        imageUrl,
        extraImages
      };

      const url = editingProduct ? `${API_URL}/products/${editingProduct.id}` : `${API_URL}/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      toast.dismiss(loadingToast);

      if (!res.ok) throw new Error('Erro ao salvar produto');

      toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
      setIsModalOpen(false);
      setNewFiles([]);
      setExistingImages([]);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (prod: Product) => {
    setFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price.toString(),
      category: prod.category || 'GERAL',
      isCustomizable: prod.isCustomizable || false,
      sizes: prod.sizes ? prod.sizes.join(', ') : ''
    });
    const imgs = [];
    if (prod.imageUrl) imgs.push(prod.imageUrl);
    if (prod.extraImages?.length) imgs.push(...prod.extraImages);
    setExistingImages(imgs);
    setNewFiles([]);
    setEditingProduct(prod);
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
    setFormData({ name: '', description: '', price: '', sizes: '', category: 'GERAL', isCustomizable: false });
    setExistingImages([]);
    setNewFiles([]);
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles([...newFiles, ...Array.from(e.target.files)]);
    }
    // reset the input so same files can be selected again if removed
    e.target.value = '';
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const removeNewFile = (idx: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== idx));
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
              <th className="px-6 py-3 text-left">PRODUTO</th>
              <th className="px-6 py-3 text-left">PREÇO</th>
              <th className="px-6 py-3 text-left">CATEGORIA</th>
              <th className="px-6 py-3 text-left">TAMANHOS</th>
              <th className="px-6 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 overflow-hidden mr-4">
                      {p.imageUrl && <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-bold">{p.name}</div>
                      {p.isCustomizable && <span className="text-[10px] bg-blue-100 text-blue-800 px-1">Customizável</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono">R$ {Number(p.price).toFixed(2).replace('.', ',')}</td>
                <td className="px-6 py-4">{p.category}</td>
                <td className="px-6 py-4 font-mono text-xs">{p.sizes ? p.sizes.join(', ') : '-'}</td>
                <td className="px-6 py-4 text-right">
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
          <div className="bg-white w-full max-w-lg border border-black shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-black text-white p-3 font-mono text-xs tracking-widest flex justify-between shrink-0">
              {editingProduct ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
              <button onClick={() => setIsModalOpen(false)}>FECHAR</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <input required placeholder="NOME DO PRODUTO" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="number" step="0.01" placeholder="PREÇO (EX: 50.00)" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <textarea placeholder="DESCRIÇÃO" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 p-2 font-mono text-sm">
                  <option value="GERAL">GERAL</option>
                  <option value="CAMISAS">CAMISAS</option>
                  <option value="CANECAS">CANECAS</option>
                  <option value="ACESSORIOS">ACESSÓRIOS</option>
                </select>
                <input placeholder="TAMANHOS (Ex: P, M, G)" className="w-full border border-gray-300 p-2 font-mono text-sm" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
              </div>

              <div>
                <label className="block font-mono text-xs mb-2">IMAGENS DO PRODUTO</label>
                
                {/* Image Gallery Preview */}
                {(existingImages.length > 0 || newFiles.length > 0) && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {existingImages.map((imgUrl, idx) => (
                      <div key={`existing-${idx}`} className="relative border border-gray-300 aspect-square group">
                        <img src={imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] text-center py-0.5">CAPA</span>}
                      </div>
                    ))}
                    {newFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative border border-gray-300 aspect-square group">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-70" />
                        <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                        {(idx === 0 && existingImages.length === 0) && <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] text-center py-0.5">CAPA</span>}
                      </div>
                    ))}
                  </div>
                )}

                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="w-full border border-gray-300 p-2 font-mono text-sm" />
                <p className="text-[10px] text-gray-500 mt-1">A primeira imagem será usada como capa. Você pode selecionar múltiplas imagens.</p>
              </div>

              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={formData.isCustomizable} onChange={e => setFormData({...formData, isCustomizable: e.target.checked})} className="w-4 h-4 border-black" />
                <span className="font-mono text-sm">Permitir Customização (Nome/Número)</span>
              </label>
              
              <button type="submit" className="w-full bg-black text-white font-bold font-mono py-3 border border-black shadow-[2px_2px_0_0_#000] hover:bg-neutral-800 transition-all mt-4">
                SALVAR PRODUTO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
