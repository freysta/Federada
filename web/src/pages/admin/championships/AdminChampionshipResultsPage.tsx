import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_URL } from '../../../config';
import { apiClient } from '../../../utils/apiClient';
import toast from 'react-hot-toast';
import { Loader2, Trophy, Medal, RefreshCcw } from 'lucide-react';

export default function AdminChampionshipResultsPage() {
  const { champ } = useOutletContext<{ champ: any }>();
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (champ?.modalities?.length > 0 && !selectedModality) {
      setSelectedModality(champ.modalities[0].id);
    }
  }, [champ]);

  useEffect(() => {
    if (selectedModality) {
      fetchStandings();
    }
  }, [selectedModality]);

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any[]>(`/championships/${champ.id}/modalities/${selectedModality}/standings`);
      setStandings(data);
    } catch (err) {
      setStandings([]);
      toast.error('Erro ao buscar classificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Trophy className="text-blue-600" size={22} /> Resultados & Classificação
          </h2>
          <p className="text-slate-500 text-sm mt-1">Acompanhe a classificação baseada nos resultados das partidas.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            {champ.modalities?.map((mod: any) => (
              <option key={mod.id} value={mod.id}>{mod.name}</option>
            ))}
            {(!champ.modalities || champ.modalities.length === 0) && (
              <option value="">Nenhuma modalidade</option>
            )}
          </select>
          <button 
            onClick={fetchStandings}
            disabled={loading}
            className="bg-white border border-slate-300 hover:bg-slate-50 p-2.5 rounded-xl transition-all active:scale-95 text-slate-700"
            title="Atualizar Tabela"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {!selectedModality ? (
        <div className="text-center py-20 text-slate-500 font-medium">Selecione uma modalidade para ver a classificação.</div>
      ) : loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : standings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Trophy size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nenhuma partida finalizada para gerar classificação</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100/70 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 w-16 text-center">Pos</th>
                  <th className="py-4 px-6">Participante</th>
                  <th className="py-4 px-6 text-center">Pts</th>
                  <th className="py-4 px-6 text-center">J</th>
                  <th className="py-4 px-6 text-center">V</th>
                  <th className="py-4 px-6 text-center">E</th>
                  <th className="py-4 px-6 text-center">D</th>
                  <th className="py-4 px-6 text-center">GP</th>
                  <th className="py-4 px-6 text-center">GC</th>
                  <th className="py-4 px-6 text-center">SG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {standings.map((team, index) => {
                  const avatarUrl = team.avatar?.startsWith('http') ? team.avatar : `${API_URL}${team.avatar}`;
                  
                  return (
                    <tr key={team.id || team.teamId || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {index === 0 ? <Medal className="inline text-yellow-500" size={20} /> :
                         index === 1 ? <Medal className="inline text-slate-400" size={20} /> :
                         index === 2 ? <Medal className="inline text-amber-700" size={20} /> :
                         index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
                            {team.avatar ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (team.name?.charAt(0) || '?')}
                          </div>
                          <span className="font-bold text-slate-900">{team.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-black text-blue-600 text-base">{team.points}</td>
                      <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.matches}</td>
                      <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.wins}</td>
                      <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.draws}</td>
                      <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.losses}</td>
                      <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.goalsFor}</td>
                      <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.goalsAgainst}</td>
                      <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.goalDifference}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
