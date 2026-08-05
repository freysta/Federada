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
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Resultados & Classificação</h2>
          <p className="text-slate-500 mt-1">Acompanhe a tabela de classificação baseada nos resultados das partidas.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-500"
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
            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {!selectedModality ? (
        <div className="text-center py-20 text-slate-500">Selecione uma modalidade para ver a classificação.</div>
      ) : loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : standings.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-500">Nenhuma partida finalizada para gerar classificação</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
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
            <tbody className="divide-y divide-slate-100">
              {standings.map((team, index) => {
                const avatarUrl = team.avatar?.startsWith('http') ? team.avatar : `${API_URL}${team.avatar}`;
                
                return (
                <tr key={team.id || team.teamId || index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-700">
                    {index === 0 ? <Medal className="inline text-yellow-500" size={20} /> :
                     index === 1 ? <Medal className="inline text-slate-400" size={20} /> :
                     index === 2 ? <Medal className="inline text-amber-700" size={20} /> :
                     index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
                        {team.avatar ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (team.name?.charAt(0) || '?')}
                      </div>
                      <span className="font-bold text-slate-800">{team.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-black text-blue-600 text-lg">{team.points}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.matches}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.wins}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.draws}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.losses}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.goalsFor}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.goalsAgainst}</td>
                  <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.goalDifference}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
