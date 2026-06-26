import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trophy, Settings, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminChampionships() {
  const { token } = useAuth();
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showModalityModal, setShowModalityModal] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  const [currentChamp, setCurrentChamp] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    enrollmentDeadline: '',
    documentsDeadline: '',
    status: 'OPEN',
    settings: {
      requireRg: false,
      requireEnrollment: false,
      customDocuments: '',
      locations: ''
    }
  });

  const [modalityData, setModalityData] = useState({
    name: '',
    type: 'INDIVIDUAL',
    price: 0,
    minAthletes: 0,
    maxAthletes: 99,
    minAge: 0,
    maxAge: 99,
    gender: 'MISTO'
  });

  const fetchChampionships = () => {
    fetch(`${API_URL}/championships`)
      .then(res => res.json())
      .then(data => {
        setChampionships(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao buscar campeonatos');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChampionships();
  }, []);

  const handleSaveChamp = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!currentChamp;
    const url = isEdit ? `${API_URL}/championships/${currentChamp.id}` : `${API_URL}/championships`;
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      settings: {
        ...formData.settings,
        customDocuments: formData.settings.customDocuments.split(',').map(s => s.trim()).filter(s => s),
        locations: formData.settings.locations.split(',').map(s => s.trim()).filter(s => s)
      }
    };

    fetch(url, {
      method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao salvar campeonato');
      return res.json();
    })
    .then(() => {
      toast.success(isEdit ? 'Campeonato atualizado!' : 'Campeonato criado!');
      setShowModal(false);
      fetchChampionships();
    })
    .catch(err => toast.error(err.message));
  };

  const handleAddModality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChamp) return;

    fetch(`${API_URL}/championships/${currentChamp.id}/modalities`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modalityData)
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao adicionar modalidade');
      return res.json();
    })
    .then(() => {
      toast.success('Modalidade adicionada!');
      setModalityData({ name: '', type: 'INDIVIDUAL', price: 0, minAthletes: 0, maxAthletes: 99, minAge: 0, maxAge: 99, gender: 'MISTO' });
      fetchChampionships(); // refresh to see new modality
    })
    .catch(err => toast.error(err.message));
  };

  const handleRemoveModality = (champId: string, modId: string) => {
    if (!window.confirm('Remover esta modalidade?')) return;
    
    fetch(`${API_URL}/championships/${champId}/modalities/${modId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao remover modalidade');
      return res.json();
    })
    .then(() => {
      toast.success('Modalidade removida!');
      fetchChampionships();
    })
    .catch(err => toast.error(err.message));
  };

  const openEditModal = (champ: any) => {
    setCurrentChamp(champ);
    setFormData({
      name: champ.name,
      description: champ.description || '',
      startDate: champ.startDate ? new Date(champ.startDate).toISOString().split('T')[0] : '',
      endDate: champ.endDate ? new Date(champ.endDate).toISOString().split('T')[0] : '',
      enrollmentDeadline: champ.enrollmentDeadline ? new Date(champ.enrollmentDeadline).toISOString().split('T')[0] : '',
      documentsDeadline: champ.documentsDeadline ? new Date(champ.documentsDeadline).toISOString().split('T')[0] : '',
      status: champ.status,
      settings: champ.settings ? {
        requireRg: !!champ.settings.requireRg,
        requireEnrollment: !!champ.settings.requireEnrollment,
        customDocuments: champ.settings.customDocuments ? champ.settings.customDocuments.join(', ') : '',
        locations: champ.settings.locations ? champ.settings.locations.join(', ') : ''
      } : { requireRg: false, requireEnrollment: false, customDocuments: '', locations: '' }
    });
    setShowModal(true);
  };

  const openModalityModal = (champ: any) => {
    setCurrentChamp(champ);
    setShowModalityModal(true);
  };

  const filteredChampionships = championships.filter(champ => 
    champ.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (champ.description && champ.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredChampionships.length / itemsPerPage);
  const paginatedChampionships = filteredChampionships.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight uppercase">Campeonatos</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">Gerencie os campeonatos e as modalidades disponíveis para as atléticas.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentChamp(null);
            setFormData({ name: '', description: '', startDate: '', endDate: '', enrollmentDeadline: '', documentsDeadline: '', status: 'OPEN', settings: { requireRg: false, requireEnrollment: false, customDocuments: '', locations: '' } });
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 font-bold font-mono text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> NOVO CAMPEONATO
        </button>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar campeonatos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-black" size={32} /></div>
        ) : paginatedChampionships.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            {searchQuery ? 'Nenhum campeonato encontrado na busca.' : 'Nenhum campeonato criado ainda.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paginatedChampionships.map((champ) => (
              <div key={champ.id} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => openEditModal(champ)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg uppercase tracking-tight flex items-center gap-2 text-gray-900 group-hover:text-blue-700 transition-colors">
                      <Trophy size={18} className="text-blue-600" />
                      {champ.name}
                    </h3>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Status: <span className="font-bold text-gray-800">{champ.status}</span> | 
                      Início: {champ.startDate ? new Date(champ.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(champ); }}
                      className="text-gray-600 hover:text-gray-900 bg-white border border-gray-200 p-1.5 hover:bg-gray-100 transition-all rounded-lg shadow-sm"
                      title="Editar Campeonato"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openModalityModal(champ); }}
                      className="text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 p-1.5 hover:bg-blue-100 transition-all rounded-lg flex items-center gap-1 shadow-sm font-medium text-xs"
                      title="Gerenciar Modalidades"
                    >
                      <Settings size={14} /> Modalidades
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm mt-3 shadow-sm">
                  <div className="font-bold mb-2 text-gray-800 text-xs">Modalidades Cadastradas ({champ.modalities?.length || 0}):</div>
                  {champ.modalities?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {champ.modalities.map((mod: any) => (
                        <div key={mod.id} className="bg-gray-50 border border-gray-200 px-2.5 py-1 flex items-center gap-1.5 rounded-lg">
                          <span className="text-gray-700 font-medium text-xs">{mod.name} <span className="text-gray-400">({mod.type} - {mod.gender})</span></span>
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md">R$ {Number(mod.price).toFixed(2)}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveModality(champ.id, mod.id); }} className="text-red-500 hover:text-red-700 ml-1 p-0.5 hover:bg-red-50 rounded transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Nenhuma modalidade configurada.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredChampionships.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modal Campeonato */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-6 max-w-4xl w-full rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-mono text-gray-800">{currentChamp ? 'Editar Campeonato' : 'Novo Campeonato'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveChamp} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Nome</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Ex: Inter-Atléticas 2026" />
                </div>
                
                <div className="md:col-span-1">
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white">
                    <option value="OPEN">Inscrições Abertas</option>
                    <option value="CLOSED">Inscrições Fechadas</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="FINISHED">Finalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Data Início</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>
                
                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Data Fim</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Prazo de Inscrição</label>
                  <input type="date" value={formData.enrollmentDeadline} onChange={e => setFormData({...formData, enrollmentDeadline: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 transition-all" />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Prazo p/ Documentos</label>
                  <input type="date" value={formData.documentsDeadline} onChange={e => setFormData({...formData, documentsDeadline: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 transition-all" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Locais dos Jogos</label>
                  <input type="text" value={formData.settings.locations} onChange={e => setFormData({...formData, settings: {...formData.settings, locations: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Ex: Ginásio Central, Quadra B" />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-gray-600 mb-1 font-medium text-sm">Descrição</label>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Detalhes do evento..."></textarea>
                </div>
                
                <div className="md:col-span-3 border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2">Configurações e Regras de Inscrição</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="flex gap-5">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.settings.requireRg} onChange={e => setFormData({...formData, settings: {...formData.settings, requireRg: e.target.checked}})} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" />
                          <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none pb-0.5">&#10003;</div>
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors text-sm">Exigir RG/Documento</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={formData.settings.requireEnrollment} onChange={e => setFormData({...formData, settings: {...formData.settings, requireEnrollment: e.target.checked}})} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" />
                          <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none pb-0.5">&#10003;</div>
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors text-sm">Exigir Matrícula</span>
                      </label>
                    </div>
                    <div>
                      <input type="text" value={formData.settings.customDocuments} onChange={e => setFormData({...formData, settings: {...formData.settings, customDocuments: e.target.value}})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" placeholder="Docs Adicionais (separados por vírgula)" />
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-3 pt-2">
                  <button type="submit" className="w-full bg-blue-600 text-white rounded-lg p-3.5 font-bold hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md">
                    SALVAR
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modalidades */}
      {showModalityModal && currentChamp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-6 max-w-2xl w-full rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Modalidades: {currentChamp.name}</h2>
              <button onClick={() => setShowModalityModal(false)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddModality} className="flex flex-col gap-3 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-600">Nome</label>
                  <input type="text" required value={modalityData.name} onChange={e => setModalityData({...modalityData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm" placeholder="Ex: Futsal Masculino" />
                </div>
                <div className="w-32">
                  <label className="text-xs font-bold text-gray-600">Tipo</label>
                  <select value={modalityData.type} onChange={e => setModalityData({...modalityData, type: e.target.value as any})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm bg-white">
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COLETIVO">Coletivo</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-xs font-bold text-gray-600">Gênero</label>
                  <select value={modalityData.gender} onChange={e => setModalityData({...modalityData, gender: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm bg-white">
                    <option value="MISTO">Misto</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs font-bold text-gray-600">Preço</label>
                  <input type="number" step="0.01" required value={modalityData.price} onChange={e => setModalityData({...modalityData, price: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm" placeholder="R$ 0,00" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1/4">
                  <label className="text-xs font-bold text-gray-600">Mínimo Atletas</label>
                  <input type="number" required value={modalityData.minAthletes} onChange={e => setModalityData({...modalityData, minAthletes: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="w-1/4">
                  <label className="text-xs font-bold text-gray-600">Máximo Atletas</label>
                  <input type="number" required value={modalityData.maxAthletes} onChange={e => setModalityData({...modalityData, maxAthletes: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="w-1/4">
                  <label className="text-xs font-bold text-gray-600">Idade Mínima</label>
                  <input type="number" required value={modalityData.minAge} onChange={e => setModalityData({...modalityData, minAge: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="w-1/4">
                  <label className="text-xs font-bold text-gray-600">Idade Máxima</label>
                  <input type="number" required value={modalityData.maxAge} onChange={e => setModalityData({...modalityData, maxAge: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 mt-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm">
                + ADICIONAR MODALIDADE
              </button>
            </form>
            
            <div className="text-center font-mono text-xs text-gray-500">
              As modalidades adicionadas aparecem na listagem principal.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
