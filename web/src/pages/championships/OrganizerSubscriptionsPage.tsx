import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, Search, CheckCircle, XCircle, Clock, DollarSign, Users, User as UserIcon } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function AdminSubscriptions() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [championships, setChampionships] = useState<any[]>([]);
  const [selectedChampId, setSelectedChampId] = useState<string>(searchParams.get('champId') || '');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch championships for the dropdown
  useEffect(() => {
    fetch(`${API_URL}/championships`)
      .then(res => res.json())
      .then(data => {
        setChampionships(data);
        if (data.length > 0 && !selectedChampId) {
          setSelectedChampId(data[0].id);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar campeonatos');
        setLoading(false);
      });
  }, [selectedChampId]);

  // Fetch subscriptions when a championship is selected
  useEffect(() => {
    if (!selectedChampId) return;
    
    setLoadingSubs(true);
    fetch(`${API_URL}/championships/${selectedChampId}/subscriptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSubscriptions(Array.isArray(data) ? data : []);
        setLoadingSubs(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar inscrições');
        setLoadingSubs(false);
      });
  }, [selectedChampId, token]);

  const updateStatus = (subId: string, status: string) => {
    const loadingToast = toast.loading('Atualizando status...');
    fetch(`${API_URL}/championships/subscription/${subId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao atualizar');
      return res.json();
    })
    .then(() => {
      toast.dismiss(loadingToast);
      toast.success('Status atualizado!');
      setSubscriptions(subs => subs.map(s => s.id === subId ? { ...s, status } : s));
    })
    .catch(err => {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    });
  };

  const updatePayment = (subId: string, paymentStatus: string) => {
    const loadingToast = toast.loading('Atualizando pagamento...');
    fetch(`${API_URL}/championships/subscription/${subId}/payment`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentStatus })
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao atualizar');
      return res.json();
    })
    .then(() => {
      toast.dismiss(loadingToast);
      toast.success('Pagamento atualizado!');
      setSubscriptions(subs => subs.map(s => s.id === subId ? { ...s, paymentStatus } : s));
    })
    .catch(err => {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    });
  };

  const filteredSubs = subscriptions.filter(sub => {
    const search = searchQuery.toLowerCase();
    const teamName = sub.team?.name?.toLowerCase() || '';
    const athleteName = sub.athlete?.user?.name?.toLowerCase() || '';
    const modalityName = sub.modality?.name?.toLowerCase() || '';
    return teamName.includes(search) || athleteName.includes(search) || modalityName.includes(search);
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold border border-green-200">APROVADA</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold border border-red-200">REJEITADA</span>;
      case 'PENDING': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-bold border border-yellow-200">PENDENTE (PRONTA)</span>;
      case 'PENDING_DOCS': return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-md text-xs font-bold border border-orange-200">AGUARDANDO DOCS</span>;
      case 'PENDING_ROSTER': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold border border-blue-200">ELENCO INCOMPLETO</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-bold border border-gray-200">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold border border-green-200 flex items-center gap-1"><CheckCircle size={10}/> PAGO</span>;
      case 'FREE': return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold border border-gray-200 flex items-center gap-1"><CheckCircle size={10}/> ISENTO</span>;
      default: return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold border border-red-200 flex items-center gap-1"><Clock size={10}/> PENDENTE</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black" size={32} /></div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-28 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tight uppercase text-slate-800">Inscrições</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">Gerencie as atléticas inscritas e aprove documentos.</p>
          </div>
          <button onClick={() => navigate('/campeonatos')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 font-bold font-mono text-sm hover:bg-gray-50 rounded-lg">
            VOLTAR
          </button>
        </div>

        <div className="bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Selecione o Campeonato</label>
              <select 
                value={selectedChampId} 
                onChange={e => setSelectedChampId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 font-mono text-sm bg-gray-50"
              >
                {championships.map(champ => (
                  <option key={champ.id} value={champ.id}>{champ.name} ({champ.status})</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Buscar Inscrição</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar por atlética, atleta ou modalidade..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
          {loadingSubs ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
          ) : filteredSubs.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm font-mono">
              {searchQuery ? 'Nenhuma inscrição encontrada na busca.' : 'Este campeonato ainda não tem inscrições.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                    <th className="p-4">Inscrito (Atlética / Atleta)</th>
                    <th className="p-4">Modalidade</th>
                    <th className="p-4">Status Inscrição</th>
                    <th className="p-4">Pagamento</th>
                    <th className="p-4 text-right">Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubs.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {sub.team ? (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center shrink-0 border border-gray-300">
                              {sub.team.logoUrl ? <img src={`${API_URL}${sub.team.logoUrl}`} alt="logo" className="w-full h-full object-cover" /> : <Users size={14} className="text-gray-500" />}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                              <UserIcon size={14} className="text-blue-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {sub.team ? sub.team.name : sub.athlete?.user?.name || 'Desconhecido'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {sub.team ? `Inscrição Coletiva • ${sub.athletes?.length || 0} Atletas` : 'Inscrição Individual'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-sm">{sub.modality?.name}</div>
                        <div className="text-xs text-gray-500">{sub.modality?.type} - {sub.modality?.gender}</div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getPaymentBadge(sub.paymentStatus)}
                          {sub.modality?.price > 0 && <span className="text-[10px] font-mono text-gray-500">R$ {Number(sub.modality.price).toFixed(2)}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {sub.paymentStatus === 'PENDING' && sub.modality?.price > 0 && (
                          <button 
                            onClick={() => updatePayment(sub.id, 'PAID')}
                            className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                            title="Confirmar Pagamento"
                          >
                            <DollarSign size={12} /> RECEBIDO
                          </button>
                        )}
                        {sub.status !== 'APPROVED' && (
                          <button 
                            onClick={() => updateStatus(sub.id, 'APPROVED')}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1"
                          >
                            <CheckCircle size={12} /> APROVAR
                          </button>
                        )}
                        {sub.status !== 'REJECTED' && (
                          <button 
                            onClick={() => updateStatus(sub.id, 'REJECTED')}
                            className="bg-white text-red-600 hover:bg-red-50 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <XCircle size={12} /> REJEITAR
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
