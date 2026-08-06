import { Trophy, Loader2, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { useParams, Link } from 'react-router-dom';
import type { IChampionship } from '../../types';

export default function RankingView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<any[]>([]);
  const [championshipId, setChampionshipId] = useState<string | null>(id || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        let currentId = championshipId;

        // If no ID is provided, try to fetch the first available championship
        if (!currentId) {
          const champs = await apiClient.get<IChampionship[]>('/championships');
          if (champs && champs.length > 0) {
            currentId = champs[0].id;
            setChampionshipId(currentId);
          }
        }

        if (currentId) {
          const resRankings = await apiClient.get<any[]>(`/championships/${currentId}/ranking`);
          setRankings(resRankings || []);
        } else {
          setError('Nenhum campeonato encontrado.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Não foi possível carregar o ranking geral. Verifique os resultados por modalidade.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, championshipId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col items-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-900/30 rounded-full flex items-center justify-center text-orange-400 mb-4 sm:mb-6 border border-orange-500/30">
        <Trophy size={32} className="sm:w-10 sm:h-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-mono font-bold uppercase tracking-wider text-white mb-2 sm:mb-4 text-center">Ranking Geral</h1>
      <p className="text-slate-400 max-w-lg text-sm sm:text-lg text-center mb-8 sm:mb-12">
        Acompanhe a classificação geral das atléticas na temporada.
      </p>

      {loading ? (
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <p>Carregando ranking...</p>
        </div>
      ) : error ? (
        <div className="mt-8 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm text-center">
          {error}
          {championshipId && (
            <div className="mt-4">
              <Link to={`/campeonatos/${championshipId}/resultados`} className="text-orange-400 hover:underline">
                Ver resultados detalhados
              </Link>
            </div>
          )}
        </div>
      ) : rankings.length === 0 ? (
        <div className="mt-8 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl font-medium text-sm text-center">
          Nenhum ranking disponível no momento.
          {championshipId && (
            <div className="mt-4">
              <Link to={`/campeonatos/${championshipId}/resultados`} className="text-orange-400 hover:underline">
                Ver resultados detalhados por modalidade
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-3xl flex flex-col gap-3 overflow-x-auto no-scrollbar">
          <div className="flex flex-col gap-3 min-w-[300px]">
            {rankings.map((team, idx) => (
              <div key={team.id || idx} className="bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-sm hover:border-orange-500/50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-lg sm:text-xl rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                  {idx === 0 ? <Medal className="text-yellow-400" size={20} /> : 
                   idx === 1 ? <Medal className="text-slate-300" size={20} /> : 
                   idx === 2 ? <Medal className="text-amber-600" size={20} /> : 
                   `#${idx + 1}`}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-white uppercase text-sm sm:text-lg truncate">{team.name || team.teamName || 'Equipe Desconhecida'}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">{team.university || 'Universidade'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-orange-500">{team.points || team.score || 0}</span>
                  <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest block font-bold">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
