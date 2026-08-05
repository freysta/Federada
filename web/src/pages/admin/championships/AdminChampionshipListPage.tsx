import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config';
import { apiClient } from '../../../utils/apiClient';
import { Loader2, Plus, Trophy, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../../components/admin/Pagination';

export default function AdminChampionshipListPage() {
  const navigate = useNavigate();
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const filteredChampionships = championships.filter(champ => 
    champ.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (champ.description && champ.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredChampionships.length / itemsPerPage);
  const paginatedChampionships = filteredChampionships.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Campeonatos</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie os eventos esportivos da plataforma.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/championships/new')}
          className="bg-blue-600 text-white px-4 py-2 font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 rounded-lg shadow-sm"
        >
          <Plus size={16} /> Novo Campeonato
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar campeonato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-semibold">Campeonato</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Início</th>
                  <th className="p-4 font-semibold text-center">Modalidades</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedChampionships.map((champ) => (
                  <tr key={champ.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {champ.bannerUrl ? (
                            <img src={`${API_URL}${champ.bannerUrl}`} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <Trophy size={18} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{champ.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{champ.description || 'Sem descrição'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        champ.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                        champ.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {champ.status}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm text-slate-600">
                      {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-center text-sm text-slate-600">
                      {champ.modalities?.length || 0}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/championships/${champ.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
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
          <div className="p-4 border-t border-slate-200">
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
