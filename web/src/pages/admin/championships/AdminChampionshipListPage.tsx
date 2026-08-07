import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config';
import { apiClient } from '../../../utils/apiClient';
import { Loader2, Plus, Trophy, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../../components/admin/Pagination';
import ColumnFilterHeader, { type FilterOption } from '../../../components/admin/ColumnFilterHeader';

const STATUS_OPTIONS: FilterOption[] = [
  { label: 'Todos os Status', value: 'ALL' },
  { label: 'Rascunho (DRAFT)', value: 'DRAFT' },
  { label: 'Publicado (PUBLISHED)', value: 'PUBLISHED' },
  { label: 'Inscrições Abertas (OPEN)', value: 'OPEN' },
  { label: 'Inscrições Encerradas (CLOSED)', value: 'CLOSED' },
  { label: 'Em Andamento (ONGOING)', value: 'ONGOING' },
  { label: 'Finalizado (FINISHED)', value: 'FINISHED' },
];

const FOCUS_OPTIONS: FilterOption[] = [
  { label: 'Todos os Públicos', value: 'ALL' },
  { label: 'Geral', value: 'GENERAL' },
  { label: 'Universitário', value: 'UNIVERSITY' },
  { label: 'Escolar', value: 'SCHOOL' },
  { label: 'Cidade / Região', value: 'CITY' },
];

export default function AdminChampionshipListPage() {
  const navigate = useNavigate();
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [focusFilter, setFocusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, focusFilter]);

  const fetchChampionships = () => {
    setLoading(true);
    apiClient.get<any>('/championships')
      .then(data => {
        setChampionships(data.data || []);
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

  const filteredChampionships = (Array.isArray(championships) ? championships : []).filter(champ => {
    if (!champ) return false;
    const search = (searchQuery || '').toLowerCase();
    const name = String(champ.name || '').toLowerCase();
    const description = String(champ.description || '').toLowerCase();
    const matchesSearch = name.includes(search) || description.includes(search);
    const matchesStatus = statusFilter === 'ALL' || champ.status === statusFilter;
    const matchesFocus = focusFilter === 'ALL' || champ.audienceFocus === focusFilter;
    return matchesSearch && matchesStatus && matchesFocus;
  });

  const totalPages = Math.ceil(filteredChampionships.length / itemsPerPage);
  const paginatedChampionships = filteredChampionships.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Trophy className="text-blue-600" size={28} /> Campeonatos & Eventos Esportivos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os campeonatos, modalidades, chaves de jogos e resultados.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/championships/create')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Plus size={18} /> Novo Campeonato
        </button>
      </div>

      {/* Standard Card & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar campeonato por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>
          <div className="text-xs font-mono font-bold text-slate-500">
            Total: {filteredChampionships.length} campeonatos
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : paginatedChampionships.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 text-lg">Nenhum campeonato encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px] border-collapse">
              <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">CAMPEONATO</th>
                  <th className="px-6 py-4 text-center">
                    <ColumnFilterHeader 
                      title="STATUS"
                      options={STATUS_OPTIONS}
                      selectedValue={statusFilter}
                      onChange={setStatusFilter}
                      align="center"
                    />
                  </th>
                  <th className="px-6 py-4 text-center">
                    <ColumnFilterHeader 
                      title="PÚBLICO ALVO"
                      options={FOCUS_OPTIONS}
                      selectedValue={focusFilter}
                      onChange={setFocusFilter}
                      align="center"
                    />
                  </th>
                  <th className="px-6 py-4 text-center">INÍCIO</th>
                  <th className="px-6 py-4 text-center">MODALIDADES</th>
                  <th className="px-6 py-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedChampionships.map((champ) => (
                  <tr key={champ.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {champ.bannerUrl ? (
                            <img src={`${API_URL}${champ.bannerUrl}`} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <Trophy size={22} className="text-blue-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{champ.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{champ.description || 'Sem descrição'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        champ.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        champ.status === 'DRAFT' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {champ.status === 'OPEN' ? 'Inscrições Abertas' : champ.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                      {champ.startDate ? new Date(champ.startDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-800">
                      {champ.modalities?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/championships/${champ.id}`)}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredChampionships.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
