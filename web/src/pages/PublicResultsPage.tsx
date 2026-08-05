import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import type { IChampionship, IMatch } from '../types';
import { Loader2, Trophy, Medal, Flag, ArrowLeft } from 'lucide-react';

export default function PublicResultsPage() {
  const { id } = useParams();
  
  const [champ, setChamp] = useState<IChampionship | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModality, setSelectedModality] = useState<string>('');
  
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'MATCHES' | 'STANDINGS'>('STANDINGS');

  useEffect(() => {
    setLoading(true);
    apiClient.get<IChampionship>(`/championships/${id}`)
      .then(data => {
        setChamp(data);
        if (data?.modalities && data.modalities.length > 0) {
          setSelectedModality(data.modalities[0].id);
        }
      })
      .catch(err => {
        console.error(err);
        setChamp(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (selectedModality) {
      fetchData();
    }
  }, [selectedModality]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [resMatches, resStandings] = await Promise.all([
        apiClient.get<IMatch[]>(`/championships/${id!}/modalities/${selectedModality}/matches`),
        apiClient.get<any[]>(`/championships/${id!}/modalities/${selectedModality}/standings`)
      ]);
      
      setMatches(resMatches);
      setStandings(resStandings);
    } catch (err) {
      console.error(err);
      setMatches([]);
      setStandings([]);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </>
    );
  }

  if (!champ) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Campeonato não encontrado</h2>
          <Link to="/campeonatos" className="text-blue-600 hover:underline">Voltar para a lista</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-24 text-slate-800 pt-20">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <Link to={`/campeonatos/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
                <ArrowLeft size={16} /> Voltar ao Campeonato
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <Trophy className="text-yellow-500" /> Resultados e Chaves
              </h1>
              <p className="text-slate-500 mt-2">{champ.name}</p>
            </div>
            
            <select 
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-500 w-full md:w-auto"
            >
              {champ.modalities?.map((mod: any) => (
                <option key={mod.id} value={mod.id}>{mod.name}</option>
              ))}
              {(!champ.modalities || champ.modalities.length === 0) && (
                <option value="">Nenhuma modalidade</option>
              )}
            </select>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('STANDINGS')}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'STANDINGS' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Classificação
            </button>
            <button
              onClick={() => setActiveTab('MATCHES')}
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'MATCHES' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Partidas / Chaves
            </button>
          </div>

          {loadingData ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : activeTab === 'STANDINGS' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              {standings.length === 0 ? (
                <div className="text-center py-20 bg-slate-50">
                  <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-lg font-bold text-slate-500">Nenhuma partida finalizada ainda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                        <th className="py-4 px-6 text-center">SG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {standings.map((team, index) => (
                        <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 text-center font-bold text-slate-700">
                            {index === 0 ? <Medal className="inline text-yellow-500" size={20} /> :
                             index === 1 ? <Medal className="inline text-slate-400" size={20} /> :
                             index === 2 ? <Medal className="inline text-amber-700" size={20} /> :
                             index + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-800">{team.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center font-black text-blue-600 text-lg">{team.points}</td>
                          <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.matches}</td>
                          <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.wins}</td>
                          <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.draws}</td>
                          <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.losses}</td>
                          <td className="py-4 px-6 text-center text-slate-600 font-semibold">{team.goalDifference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {matches.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
                  <Flag size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-lg font-bold text-slate-500">Chaveamento não gerado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map(match => {
                    const nameA = match.teamA?.name || match.athleteA?.user?.name || 'A Definir';
                    const nameB = match.teamB?.name || match.athleteB?.user?.name || 'A Definir';
                    
                    return (
                      <div key={match.id} className={`border rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between ${match.status === 'FINISHED' ? 'border-slate-300 opacity-70' : 'border-blue-200'}`}>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            Rodada {match.round} {match.bracketPosition ? `• Jogo ${match.bracketPosition}` : ''}
                          </span>
                          <div className={`text-xs font-bold px-2 py-1 rounded-md ${match.status === 'IN_PROGRESS' ? 'bg-red-100 text-red-600 animate-pulse' : match.status === 'FINISHED' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                            {match.status === 'IN_PROGRESS' ? 'AO VIVO' : match.status === 'FINISHED' ? 'ENCERRADO' : 'AGENDADO'}
                          </div>
                        </div>

                        <div className="space-y-3 flex-1 flex flex-col justify-center">
                          <div className={`flex justify-between items-center ${(match.scoreA ?? 0) > (match.scoreB ?? 0) && match.status === 'FINISHED' ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                            <span className="truncate pr-4">{nameA}</span>
                            <div className="text-xl font-bold font-mono px-3 py-1 bg-gray-100 rounded text-center min-w-[3rem] shadow-inner border border-gray-200">
                              {match.scoreA !== undefined && match.scoreA !== null ? match.scoreA : '-'}
                            </div>
                          </div>
                          <span className="text-gray-400 font-bold text-center">X</span>
                          <div className={`flex justify-between items-center ${(match.scoreB ?? 0) > (match.scoreA ?? 0) && match.status === 'FINISHED' ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                            <span className="truncate pr-4">{nameB}</span>
                            <div className="text-xl font-bold font-mono px-3 py-1 bg-gray-100 rounded text-center min-w-[3rem] shadow-inner border border-gray-200">
                              {match.scoreB !== undefined && match.scoreB !== null ? match.scoreB : '-'}
                            </div>
                          </div>
                        </div>

                        {(match.date || match.location) && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs text-slate-500 font-semibold">
                            {match.date && !isNaN(new Date(match.date).getTime()) && <span>{new Date(match.date).toLocaleString()}</span>}
                            {match.location && <span>Local: {match.location}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
