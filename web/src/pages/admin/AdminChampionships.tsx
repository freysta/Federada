import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Plus, Edit, Trophy, Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChampionships() {
  const { token } = useAuth();
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalityModal, setShowModalityModal] = useState(false);
  
  const [currentChamp, setCurrentChamp] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'OPEN'
  });

  const [modalityData, setModalityData] = useState({
    name: '',
    type: 'INDIVIDUAL',
    price: 0
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

    fetch(url, {
      method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
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
      setModalityData({ name: '', type: 'INDIVIDUAL', price: 0 });
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
      status: champ.status
    });
    setShowModal(true);
  };

  const openModalityModal = (champ: any) => {
    setCurrentChamp(champ);
    setShowModalityModal(true);
  };

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
            setFormData({ name: '', description: '', startDate: '', endDate: '', status: 'OPEN' });
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 font-bold font-mono text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> NOVO CAMPEONATO
        </button>
      </div>

      <div className="bg-white border border-black shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" size={32} /></div>
        ) : championships.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-mono text-sm border border-dashed border-gray-300">
            Nenhum campeonato criado ainda.
          </div>
        ) : (
          <div className="space-y-6">
            {championships.map((champ) => (
              <div key={champ.id} className="border border-gray-300 p-4 rounded-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl uppercase font-mono flex items-center gap-2">
                      <Trophy size={20} className="text-blue-600" />
                      {champ.name}
                    </h3>
                    <div className="text-sm font-mono text-gray-500 mt-1">
                      Status: <span className="font-bold text-black">{champ.status}</span> | 
                      Início: {champ.startDate ? new Date(champ.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(champ)}
                      className="text-gray-500 hover:text-black p-2 border border-transparent hover:border-gray-200 transition-all rounded-sm"
                      title="Editar Campeonato"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => openModalityModal(champ)}
                      className="text-blue-600 hover:text-blue-800 p-2 border border-transparent hover:border-blue-100 transition-all rounded-sm flex items-center gap-1"
                      title="Gerenciar Modalidades"
                    >
                      <Settings size={16} /> Modalidades
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 text-sm font-mono border-t border-gray-200">
                  <div className="font-bold mb-2 text-gray-700">Modalidades Cadastradas ({champ.modalities?.length || 0}):</div>
                  {champ.modalities?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {champ.modalities.map((mod: any) => (
                        <div key={mod.id} className="bg-white border border-gray-300 px-3 py-1 flex items-center gap-2 rounded-sm shadow-sm">
                          <span>{mod.name} ({mod.type})</span>
                          <span className="text-xs font-bold text-green-700">R$ {Number(mod.price).toFixed(2)}</span>
                          <button onClick={() => handleRemoveModality(champ.id, mod.id)} className="text-red-500 hover:text-red-700 ml-1">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Nenhuma modalidade configurada.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Campeonato */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 max-w-md w-full border border-black shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-mono uppercase">{currentChamp ? 'Editar Campeonato' : 'Novo Campeonato'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveChamp} className="space-y-4 font-mono text-sm">
              <div>
                <label className="block text-gray-500 mb-1">Nome</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black" placeholder="Ex: Inter-Atléticas 2026" />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Descrição</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black h-24" placeholder="Detalhes do evento..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1">Data Início</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Data Fim</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black" />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black">
                  <option value="OPEN">Inscrições Abertas (OPEN)</option>
                  <option value="CLOSED">Inscrições Fechadas (CLOSED)</option>
                  <option value="IN_PROGRESS">Em Andamento (IN_PROGRESS)</option>
                  <option value="FINISHED">Finalizado (FINISHED)</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-black text-white p-3 font-bold uppercase hover:bg-gray-800 transition-colors mt-4">
                SALVAR
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modalidades */}
      {showModalityModal && currentChamp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 max-w-md w-full border border-black shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-mono uppercase truncate">Modalidades - {currentChamp.name}</h2>
              <button onClick={() => setShowModalityModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddModality} className="space-y-4 font-mono text-sm bg-gray-50 p-4 border border-gray-200 mb-4">
              <div className="font-bold text-gray-700">Adicionar Nova:</div>
              <div>
                <label className="block text-gray-500 mb-1">Nome</label>
                <input required type="text" value={modalityData.name} onChange={e => setModalityData({...modalityData, name: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black" placeholder="Ex: Futsal Masculino" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1">Tipo</label>
                  <select value={modalityData.type} onChange={e => setModalityData({...modalityData, type: e.target.value})} className="w-full border border-gray-300 p-2 outline-none focus:border-black">
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COLETIVO">Coletivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Preço (R$)</label>
                  <input required type="number" min="0" step="0.01" value={modalityData.price} onChange={e => setModalityData({...modalityData, price: parseFloat(e.target.value)})} className="w-full border border-gray-300 p-2 outline-none focus:border-black" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 text-white p-2 font-bold uppercase hover:bg-blue-700 transition-colors">
                ADICIONAR MODALIDADE
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
