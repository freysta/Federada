import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { apiClient } from '../../../utils/apiClient';
import { Loader2, Search, CheckCircle, XCircle, DollarSign, Clock, Users, User as UserIcon, Shield, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import ColumnFilterHeader, { FilterOption } from '../../../components/admin/ColumnFilterHeader';

const SUB_STATUS_OPTIONS: FilterOption[] = [
  { label: 'Todos os Status', value: 'ALL' },
  { label: 'Confirmadas / Aprovadas', value: 'CONFIRMED' },
  { label: 'Aguardando Documentos', value: 'PENDING_DOCS' },
  { label: 'Pendente (Pronta)', value: 'PENDING' },
  { label: 'Elenco Incompleto', value: 'PENDING_ROSTER' },
  { label: 'Rejeitadas', value: 'REJECTED' },
];

const PAYMENT_OPTIONS: FilterOption[] = [
  { label: 'Todos os Pagamentos', value: 'ALL' },
  { label: 'Pago', value: 'PAID' },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Isento / Grátis', value: 'FREE' },
];

export default function AdminChampionshipSubscriptionsPage() {
  const { id } = useParams();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Roster Modal State
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedSubRoster, setSelectedSubRoster] = useState<any>(null);

  // Fetch subscriptions when championship is mounted
  useEffect(() => {
    if (!id) return;
    
    setLoadingSubs(true);
    apiClient.get<any[]>(`/championships/${id}/subscriptions`)
      .then(data => {
        setSubscriptions(Array.isArray(data) ? data : []);
        setLoadingSubs(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar inscrições');
        setLoadingSubs(false);
      });
  }, [id]);

  const updateStatus = (subId: string, status: string) => {
    const loadingToast = toast.loading('Atualizando status...');
    apiClient.patch(`/championships/subscription/${subId}/status`, { status })
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
    apiClient.patch(`/championships/subscription/${subId}/payment`, { paymentStatus })
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

  const filteredSubs = (Array.isArray(subscriptions) ? subscriptions : []).filter(sub => {
    if (!sub) return false;
    const search = searchQuery.toLowerCase();
    const teamName = sub.team?.name?.toLowerCase() || '';
    const athleteName = sub.athlete?.user?.name?.toLowerCase() || '';
    const modalityName = sub.modality?.name?.toLowerCase() || '';

    const matchesSearch = teamName.includes(search) || athleteName.includes(search) || modalityName.includes(search);
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'CONFIRMED' && (sub.status === 'CONFIRMED' || sub.status === 'APPROVED' || sub.status === 'DOCS_APPROVED')) ||
      sub.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || sub.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header section without duplicated page title, since Layout already has it */}
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <Users className="text-blue-600" size={22} /> Controle de Inscrições
        </h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie as equipes e atletas inscritos no campeonato.</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por equipe, atleta ou modalidade..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>
          <div className="text-xs font-mono font-bold text-slate-500">
            Total: {filteredSubs.length} inscrições
          </div>
        </div>

        {loadingSubs ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : filteredSubs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-medium">
            {searchQuery ? 'Nenhuma inscrição encontrada na busca.' : 'Este campeonato ainda não tem inscrições.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Inscrito (Equipe / Atleta)</th>
                  <th className="px-6 py-4">Modalidade</th>
                  <th className="px-6 py-4">
                    <ColumnFilterHeader
                      title="STATUS INSCRIÇÃO"
                      options={SUB_STATUS_OPTIONS}
                      selectedValue={statusFilter}
                      onChange={setStatusFilter}
                    />
                  </th>
                  <th className="px-6 py-4">
                    <ColumnFilterHeader
                      title="PAGAMENTO"
                      options={PAYMENT_OPTIONS}
                      selectedValue={paymentFilter}
                      onChange={setPaymentFilter}
                    />
                  </th>
                  <th className="px-6 py-4">Documentos</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubs.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {sub.team ? (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                            {sub.team.logoUrl ? <img src={`${API_URL}${sub.team.logoUrl}`} alt="logo" className="w-full h-full object-cover" /> : <Users size={16} className="text-slate-500" />}
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                            <UserIcon size={16} className="text-blue-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {sub.team ? sub.team.name : sub.athlete?.user?.name || 'Desconhecido'}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {sub.team ? `Inscrição Coletiva • ${sub.athletes?.length || 0} Atletas` : 'Inscrição Individual'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{sub.modality?.name}</div>
                      <div className="text-xs text-slate-500">{sub.modality?.type} • {sub.modality?.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === 'CONFIRMED' || sub.status === 'APPROVED' || sub.status === 'DOCS_APPROVED' ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black tracking-wider uppercase border border-emerald-250">CONFIRMADA</span>
                      ) : sub.status === 'REJECTED' ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black tracking-wider uppercase border border-rose-250">REJEITADA</span>
                      ) : sub.status === 'PENDING' ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black tracking-wider uppercase border border-amber-250">PENDENTE (PRONTA)</span>
                      ) : sub.status === 'PENDING_DOCS' ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black tracking-wider uppercase border border-amber-250">AGUARDANDO DOCS</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black tracking-wider uppercase border border-blue-250">ELENCO INCOMPLETO</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {sub.paymentStatus === 'PAID' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-250 flex items-center gap-1"><CheckCircle size={10}/> PAGO</span>
                        ) : sub.paymentStatus === 'FREE' ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200 flex items-center gap-1"><CheckCircle size={10}/> ISENTO</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold border border-rose-250 flex items-center gap-1"><Clock size={10}/> PENDENTE</span>
                        )}
                        {sub.modality?.price > 0 && <span className="text-[10px] font-mono text-slate-500">R$ {Number(sub.modality.price).toFixed(2)}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.athlete ? (
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Valide no Painel de Docs
                        </div>
                      ) : sub.team ? (
                        <button 
                          onClick={() => { setSelectedSubRoster(sub); setIsRosterModalOpen(true); }}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          title="Ver Elenco"
                        >
                          <Users size={14} /> Ver Elenco ({sub.athletes?.length || 0})
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Pendente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {sub.paymentStatus === 'PENDING' && sub.modality?.price > 0 && (
                        <button 
                          onClick={() => updatePayment(sub.id, 'PAID')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1"
                          title="Confirmar Pagamento"
                        >
                          <DollarSign size={12} /> RECEBIDO
                        </button>
                      )}
                      {sub.status !== 'CONFIRMED' && sub.status !== 'APPROVED' && (
                        <button 
                          onClick={() => updateStatus(sub.id, 'CONFIRMED')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1"
                        >
                          <CheckCircle size={12} /> APROVAR
                        </button>
                      )}
                      {sub.status !== 'REJECTED' && (
                        <button 
                          onClick={() => updateStatus(sub.id, 'REJECTED')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 active:scale-95"
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

      {/* ROSTER MODAL */}
      {isRosterModalOpen && selectedSubRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-500" size={24} />
                <div>
                  <h3 className="font-black text-lg uppercase tracking-wide">{selectedSubRoster.team?.name}</h3>
                  <p className="text-xs text-slate-400">Modalidade: {selectedSubRoster.modality?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsRosterModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!selectedSubRoster.athletes || selectedSubRoster.athletes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold text-sm border border-dashed border-slate-300 rounded-2xl">
                  Nenhum atleta cadastrado neste elenco ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSubRoster.athletes.map((athlete: any) => (
                    <div key={athlete.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {athlete.user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{athlete.user?.name}</div>
                          <div className="text-xs text-slate-500 mt-1 flex gap-3">
                            <span>CPF: {athlete.cpf || '-'}</span>
                            <span>ID: {athlete.athleteIdCode || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button onClick={() => setIsRosterModalOpen(false)} className="px-5 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300">
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
