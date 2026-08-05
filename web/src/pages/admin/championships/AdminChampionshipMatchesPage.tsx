import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import toast from 'react-hot-toast';
import { Loader2, Flag, MapPin, Calendar, RefreshCcw } from 'lucide-react';

export default function AdminChampionshipMatchesPage() {
  const { champ } = useOutletContext<{ champ: any }>();

  
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState('SINGLE_ELIMINATION');

  const formatLocalIso = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (champ?.modalities?.length > 0 && !selectedModality) {
      setSelectedModality(champ.modalities[0].id);
    }
  }, [champ]);

  useEffect(() => {
    if (selectedModality) {
      fetchMatches();
    }
  }, [selectedModality]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<any[]>(`/championships/${champ?.id}/modalities/${selectedModality}/matches`);
      setMatches(data);
    } catch (err) {
      toast.error('Erro ao buscar partidas');
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    if (!window.confirm(`Isso apagará as partidas existentes e gerará uma nova chave em formato ${format}. Tem certeza?`)) return;
    
    setGenerating(true);
    try {
      await apiClient.post(`/championships/${champ?.id}/modalities/${selectedModality}/generate-bracket`, { format });
      toast.success('Chave gerada com sucesso!');
      fetchMatches();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar chave');
    } finally {
      setGenerating(false);
    }
  };

  const updateMatch = async (matchId: string, data: any) => {
    try {
      await apiClient.patch(`/championships/${champ?.id}/modalities/${selectedModality}/matches/${matchId}`, data);
      toast.success('Partida atualizada!');
      fetchMatches();
    } catch (err) {
      toast.error('Erro de conexão');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Partidas & Chaves</h2>
          <p className="text-slate-500 mt-1">Gerencie as partidas e atualize os placares.</p>
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
        </div>
      </div>

      {!selectedModality ? (
        <div className="text-center py-20 text-slate-500">Selecione uma modalidade para ver as partidas.</div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-blue-900">Gerar Nova Chave</h3>
              <p className="text-sm text-blue-700 mt-1">Apenas participantes com inscrição <b>CONFIRMED</b> serão incluídos.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="SINGLE_ELIMINATION">Mata-mata Simples</option>
                <option value="ROUND_ROBIN">Pontos Corridos (Todos contra Todos)</option>
              </select>
              <button 
                onClick={generateBracket}
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                Gerar Chave
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
              <Flag size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-bold text-slate-500">Nenhuma partida gerada</p>
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map(match => {
                const nameA = match.teamA?.name || match.athleteA?.user?.name || 'A Definir';
                const nameB = match.teamB?.name || match.athleteB?.user?.name || 'A Definir';
                
                return (
                  <div key={match.id} className={`border rounded-2xl p-6 flex flex-col lg:flex-row gap-6 ${match.status === 'FINISHED' ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-white'}`}>
                    
                    {/* Infos */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          Rodada {match.round} {match.bracketPosition ? `• Jogo ${match.bracketPosition}` : ''}
                        </span>
                        
                        <select 
                          value={match.status}
                          onChange={(e) => updateMatch(match.id, { status: e.target.value })}
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full outline-none cursor-pointer ${
                            match.status === 'FINISHED' ? 'bg-green-100 text-green-700' :
                            match.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <option value="SCHEDULED">Agendado</option>
                          <option value="ONGOING">Em Andamento</option>
                          <option value="FINISHED">Finalizado</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1"><Calendar size={12}/> Data/Hora</label>
                          <input 
                            key={`date-${match.date || 'none'}`}
                            type="datetime-local" 
                            defaultValue={formatLocalIso(match.date)}
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateMatch(match.id, { date: new Date(e.target.value).toISOString() })
                              }
                            }}
                            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1"><MapPin size={12}/> Local</label>
                          <input 
                            key={`loc-${match.location || 'none'}`}
                            type="text" 
                            placeholder="Ex: Quadra 1"
                            defaultValue={match.location || ''}
                            onBlur={(e) => updateMatch(match.id, { location: e.target.value })}
                            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Placar */}
                    <div className="flex-1 flex flex-col justify-center bg-slate-50 rounded-xl p-4 border border-slate-100">
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 text-right font-bold text-slate-800 pr-4 truncate" title={nameA}>{nameA}</div>
                        <input 
                          key={`scoreA-${match.scoreA}`}
                          type="number" 
                          className="w-16 h-12 text-center text-xl font-black bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                          defaultValue={match.scoreA !== null ? match.scoreA : ''}
                          onBlur={(e) => {
                            if (e.target.value !== '') {
                              updateMatch(match.id, { scoreA: parseInt(e.target.value) });
                            } else {
                              updateMatch(match.id, { scoreA: null });
                            }
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-right font-bold text-slate-800 pr-4 truncate" title={nameB}>{nameB}</div>
                        <input 
                          key={`scoreB-${match.scoreB}`}
                          type="number" 
                          className="w-16 h-12 text-center text-xl font-black bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                          defaultValue={match.scoreB !== null ? match.scoreB : ''}
                          onBlur={(e) => {
                            if (e.target.value !== '') {
                              updateMatch(match.id, { scoreB: parseInt(e.target.value) });
                            } else {
                              updateMatch(match.id, { scoreB: null });
                            }
                          }}
                        />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
