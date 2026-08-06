import { Trophy, Loader2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { useParams, Link } from 'react-router-dom';
import type { IChampionship, IMatch } from '../../types';

export default function MatchesView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<IMatch[]>([]);
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
          const resMatches = await apiClient.get<IMatch[]>(`/championships/${currentId}/matches`);
          setMatches(resMatches || []);
        } else {
          setError('Nenhum campeonato encontrado.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Não foi possível carregar os jogos. Eles podem estar vinculados por modalidade.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, championshipId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col items-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400 mb-4 sm:mb-6 border border-blue-500/30">
        <Trophy size={32} className="sm:w-10 sm:h-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-mono font-bold uppercase tracking-wider text-white mb-2 sm:mb-4 text-center">Agenda de Jogos</h1>
      <p className="text-slate-400 max-w-lg text-sm sm:text-lg text-center mb-8 sm:mb-12">
        Calendário centralizado com todos os confrontos.
      </p>

      {loading ? (
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p>Carregando jogos...</p>
        </div>
      ) : error ? (
        <div className="mt-8 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm text-center">
          {error}
        </div>
      ) : matches.length === 0 ? (
        <div className="mt-8 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl font-medium text-sm text-center">
          Nenhum jogo encontrado no momento.
          {championshipId && (
            <div className="mt-4">
              <Link to={`/campeonatos/${championshipId}/resultados`} className="text-blue-400 hover:underline">
                Ver resultados detalhados por modalidade
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:border-blue-500/50 transition-colors overflow-hidden">
              <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 font-bold uppercase">
                <span className="flex items-center gap-1"><Calendar size={12} className="sm:w-[14px] sm:h-[14px]" /> {match.date || 'A Definir'}</span>
                <span>{match.status === 'FINISHED' ? 'Finalizado' : 'Agendado'}</span>
              </div>
              <div className="flex justify-between items-center mt-2 font-mono font-black text-sm sm:text-lg">
                <span className="text-white truncate w-1/3 text-left">{match.teamA?.name || 'Equipe A'}</span>
                <span className="text-blue-500 px-2 py-1 sm:px-3 sm:py-1 bg-slate-900 rounded-lg border border-slate-800 shrink-0 text-xs sm:text-sm">
                  {match.scoreA ?? '-'} x {match.scoreB ?? '-'}
                </span>
                <span className="text-white truncate w-1/3 text-right">{match.teamB?.name || 'Equipe B'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
