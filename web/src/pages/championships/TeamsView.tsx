import { Shield, Loader2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { useParams, Link } from 'react-router-dom';
import type { IChampionship } from '../../types';

export default function TeamsView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
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
          const resTeams = await apiClient.get<any[]>(`/championships/${currentId}/teams`);
          setTeams(resTeams || []);
        } else {
          setError('Nenhum campeonato encontrado.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Não foi possível carregar as equipes. Verifique os resultados do campeonato.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, championshipId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col items-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-900/30 rounded-full flex items-center justify-center text-green-400 mb-4 sm:mb-6 border border-green-500/30">
        <Shield size={32} className="sm:w-10 sm:h-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-mono font-bold uppercase tracking-wider text-white mb-2 sm:mb-4 text-center">Atléticas Participantes</h1>
      <p className="text-slate-400 max-w-lg text-sm sm:text-lg text-center mb-8 sm:mb-12">
        Conheça as equipes que disputam os torneios desta temporada.
      </p>

      {loading ? (
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-green-500" size={32} />
          <p>Carregando atléticas...</p>
        </div>
      ) : error ? (
        <div className="mt-8 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm text-center">
          {error}
          {championshipId && (
            <div className="mt-4">
              <Link to={`/campeonatos/${championshipId}/resultados`} className="text-green-400 hover:underline">
                Ver equipes no campeonato
              </Link>
            </div>
          )}
        </div>
      ) : teams.length === 0 ? (
        <div className="mt-8 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl font-medium text-sm text-center">
          Nenhuma equipe encontrada no momento.
          {championshipId && (
            <div className="mt-4">
              <Link to={`/campeonatos/${championshipId}/resultados`} className="text-green-400 hover:underline">
                Ir para a página de resultados
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {teams.map((team, idx) => (
            <div key={team.id || idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 shadow-sm hover:border-green-500/50 hover:-translate-y-1 transition-all">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 border-4 border-slate-700 overflow-hidden flex items-center justify-center">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                  <Shield size={32} className="text-slate-600 sm:w-10 sm:h-10" />
                )}
              </div>
              <div className="text-center w-full">
                <h3 className="font-black text-white uppercase tracking-wide text-sm sm:text-base truncate">{team.name || 'Atlética Desconhecida'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 truncate">{team.university || 'Universidade'}</p>
              </div>
              <div className="w-full h-px bg-slate-700 mt-1 mb-1 sm:mt-2 sm:mb-2"></div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Users size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span>{team.athletesCount || 0} Atletas</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
