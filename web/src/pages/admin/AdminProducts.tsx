import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trash2, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    sizes: '',
    category: 'GERAL',
    isCustomizable: false
  });
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Simulador
  const [costPrice, setCostPrice] = useState<string>('');
  const [margin, setMargin] = useState<number>(30);
  const [simulatedPrice, setSimulatedPrice] = useState<number | null>(null);

  useEffect(() => {
    if (costPrice && !isNaN(Number(costPrice))) {
      // Preço final = (Custo × (1 + margem)) ÷ (1 - 0,04)
      const cost = Number(costPrice);
      const m = margin / 100;
      const finalPrice = (cost * (1 + m)) / 0.96;
      setSimulatedPrice(finalPrice);
    } else {
      setSimulatedPrice(null);
    }
  }, [costPrice, margin]);

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
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
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
      originalPrice: prod.originalPrice ? prod.originalPrice.toString() : '',
      category: prod.category || 'GERAL',
      isCustomizable: prod.isCustomizable || false,
      sizes: prod.sizes ? prod.sizes.join(', ') : ''
    });
    const imgs = [];
    if (prod.imageUrl) imgs.push(prod.imageUrl);
    if (prod.extraImages?.length) imgs.push(...prod.extraImages);
    setExistingImages(imgs);
    setNewFiles([]);
    setCostPrice('');
    setMargin(30);
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
    setFormData({ name: '', description: '', price: '', originalPrice: '', sizes: '', category: 'GERAL', isCustomizable: false });
    setExistingImages([]);
    setNewFiles([]);
    setCostPrice('');
    setMargin(30);
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end border-b-2 border-black pb-2">
        <h1 className="text-2xl font-bold font-mono tracking-widest uppercase">// Produtos</h1>
        <button onClick={openNewModal} className="bg-black text-white px-4 py-2 font-mono text-sm hover:bg-neutral-800 transition-colors flex items-center gap-2">
          <Plus size={16} /> NOVO
        </button>
      </div>
      
      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
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
                <th className="px-4 py-3 text-left">PRODUTO</th>
                <th className="px-4 py-3 text-left">PREÇO</th>
                <th className="px-4 py-3 text-left">CATEGORIA</th>
                <th className="px-4 py-3 text-left">TAMANHOS</th>
                <th className="px-4 py-3 text-right">AÇÕES</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleEdit(p)}>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 overflow-hidden rounded-lg mr-3 border border-gray-300 shrink-0">
                      {p.imageUrl && <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API_URL}${p.imageUrl}`} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 leading-tight">{p.name}</div>
                      {p.isCustomizable && <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Customizável</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 font-mono font-bold text-gray-700">R$ {Number(p.price).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-2 text-gray-700">{p.category}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{p.sizes ? p.sizes.join(', ') : '-'}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"><Edit size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold font-mono text-gray-800">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar bg-gray-50/30">
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2 shadow-sm">
                <h3 className="font-semibold text-sm mb-3 text-blue-900 flex items-center gap-2"><Loader2 size={16} className={costPrice ? "animate-spin text-blue-600" : "hidden"}/> SIMULADOR DE PREÇO (Calcula Taxa de 4%)</h3>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">CUSTO (R$)</label>
                    <input type="number" step="0.01" className="w-full border border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none" placeholder="Ex: 50.00" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1">MARGEM DE LUCRO (%)</label>
                    <select className="w-full border border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-300 outline-none bg-white" value={margin} onChange={e => setMargin(Number(e.target.value))}>
                      <option value={20}>20%</option>
                      <option value={30}>30%</option>
                      <option value={40}>40%</option>
                      <option value={50}>50%</option>
                    </select>
                  </div>
                </div>
                {simulatedPrice !== null && (
                  <div className="flex justify-between items-center bg-blue-600 text-white rounded-lg p-3 mt-4 shadow-sm">
                    <span className="text-sm font-medium">Preço Sugerido:</span>
                    <span className="text-lg font-bold">R$ {simulatedPrice.toFixed(2).replace('.', ',')}</span>
                    <button type="button" onClick={() => setFormData({...formData, price: simulatedPrice.toFixed(2)})} className="bg-white text-blue-700 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm">USAR PREÇO</button>
                  </div>
                )}
                <p className="text-[11px] text-blue-600 mt-2 font-medium opacity-80">Fórmula: (Custo × (1 + margem)) ÷ (1 - 0.04). Use esse preço base. Dê de 3% a 5% de desconto no PIX depois.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                  <input required placeholder="Ex: Camiseta Universitária" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Venda (R$)*</label>
                  <input required type="number" step="0.01" placeholder="EX: 139.90" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-red-600">Preço Antigo (Riscado)</label>
                  <input type="number" step="0.01" placeholder="EX: 159.90 (Opcional)" className="w-full border border-red-200 rounded-lg p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-red-600" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea placeholder="Detalhes do produto..." rows={3} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white">
                    <option value="GERAL">Geral</option>
                    <option value="CAMISAS">Camisas</option>
                    <option value="CANECAS">Canecas</option>
                    <option value="ACESSORIOS">Acessórios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamanhos Disponíveis</label>
                  <input placeholder="Ex: P, M, G, GG" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
                </div>

                <div className="md:col-span-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagens do Produto</label>
                  
                  {/* Image Gallery Preview */}
                  {(existingImages.length > 0 || newFiles.length > 0) && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
                      {existingImages.map((imgUrl, idx) => (
                        <div key={`existing-${idx}`} className="relative border border-gray-200 rounded-lg aspect-square group overflow-hidden shadow-sm">
                          <img src={imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <X size={12} />
                          </button>
                          {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[9px] font-bold tracking-wider text-center py-1">CAPA</span>}
                        </div>
                      ))}
                      {newFiles.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative border border-gray-200 rounded-lg aspect-square group overflow-hidden shadow-sm">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" />
                          <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <X size={12} />
                          </button>
                          {(idx === 0 && existingImages.length === 0) && <span className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[9px] font-bold tracking-wider text-center py-1">CAPA</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  <p className="text-xs text-gray-500 mt-2">A primeira imagem será usada como capa. Você pode selecionar múltiplas imagens de uma vez.</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mt-2 bg-white flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800 block">Personalização</span>
                  <span className="text-xs text-gray-500">Permitir que o cliente insira Nome e Número ao comprar</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.isCustomizable} onChange={e => setFormData({...formData, isCustomizable: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
