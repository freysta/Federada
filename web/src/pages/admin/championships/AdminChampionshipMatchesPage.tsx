import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import toast from 'react-hot-toast';
import { Loader2, Flag, MapPin, Calendar, RefreshCcw, Paperclip, Save, FileText } from 'lucide-react';

export default function AdminChampionshipMatchesPage() {
  const { champ } = useOutletContext<{ champ: any }>();

  
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState('SINGLE_ELIMINATION');
  const [editedScores, setEditedScores] = useState<Record<string, { scoreA?: string, scoreB?: string }>>({});

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

  const handleScoreChange = (matchId: string, team: 'A' | 'B', val: string) => {
    setEditedScores(prev => {
      const current = prev[matchId] || {};
      return {
        ...prev,
        [matchId]: { ...current, [`score${team}`]: val }
      };
    });
  };

  const saveScores = (match: any) => {
    const scores = editedScores[match.id];
    if (!scores) {
      toast.error('Nenhuma alteração para salvar');
      return;
    }
    const scoreA = scores.scoreA !== undefined ? (scores.scoreA !== '' ? parseInt(scores.scoreA) : null) : match.scoreA;
    const scoreB = scores.scoreB !== undefined ? (scores.scoreB !== '' ? parseInt(scores.scoreB) : null) : match.scoreB;
    updateMatch(match.id, { scoreA, scoreB });
  };

  const uploadSummary = async (matchId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post(`/championships/${champ?.id}/modalities/${selectedModality}/matches/${matchId}/summary`, formData);
      toast.success('Súmula enviada!');
      fetchMatches();
    } catch (err) {
      toast.error('Erro ao enviar súmula');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Flag className="text-blue-600" size={22} /> Partidas & Chaves
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie as partidas e atualize os placares.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <select 
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
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
        <div className="text-center py-20 text-slate-500 font-medium">Selecione uma modalidade para ver as partidas.</div>
      ) : (
        <>
          {/* Action Box to Generate Bracket */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-100">Gerar Nova Chave</h3>
              <p className="text-xs text-slate-400 mt-1">Apenas participantes com inscrição <b>APROVADA</b> serão incluídos.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-white/40 cursor-pointer"
              >
                <option value="SINGLE_ELIMINATION" className="text-slate-900 font-bold">Mata-mata Simples</option>
                <option value="ROUND_ROBIN" className="text-slate-900 font-bold">Todos contra Todos</option>
              </select>
              <button 
                onClick={generateBracket}
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                Gerar Chave
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Flag size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nenhuma partida gerada</p>
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map(match => {
                const nameA = match.teamA?.name || match.athleteA?.user?.name || 'A Definir';
                const nameB = match.teamB?.name || match.athleteB?.user?.name || 'A Definir';
                
                return (
                  <div key={match.id} className={`border rounded-2xl p-6 flex flex-col lg:flex-row gap-6 shadow-sm transition-all hover:shadow-md ${
                    match.status === 'FINISHED' ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 bg-white'
                  }`}>
                    
                    {/* Infos */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                          Rodada {match.round} {match.bracketPosition ? `• Jogo ${match.bracketPosition}` : ''}
                        </span>
                        
                        <select 
                          value={match.status}
                          onChange={(e) => updateMatch(match.id, { status: e.target.value })}
                          className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full outline-none cursor-pointer border ${
                            match.status === 'FINISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            match.status === 'ONGOING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="SCHEDULED">Agendado</option>
                          <option value="ONGOING">Em Andamento</option>
                          <option value="FINISHED">Finalizado</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1.5"><Calendar size={12}/> Data/Hora</label>
                          <input 
                            key={`date-${match.date || 'none'}`}
                            type="datetime-local" 
                            defaultValue={formatLocalIso(match.date)}
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateMatch(match.id, { date: new Date(e.target.value).toISOString() })
                              }
                            }}
                            className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-600 transition-all bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1.5"><MapPin size={12}/> Local</label>
                          <input 
                            key={`loc-${match.location || 'none'}`}
                            type="text" 
                            placeholder="Ex: Quadra 1"
                            defaultValue={match.location || ''}
                            onBlur={(e) => updateMatch(match.id, { location: e.target.value })}
                            className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-600 transition-all bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Placar */}
                    <div className="flex-1 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-2xl p-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-sm font-bold text-slate-800 pr-4 truncate" title={nameA}>{nameA}</div>
                          <input 
                            type="number" 
                            className="w-16 h-10 text-center text-lg font-black bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 transition-all"
                            value={editedScores[match.id]?.scoreA !== undefined ? editedScores[match.id].scoreA : (match.scoreA !== null ? match.scoreA : '')}
                            onChange={(e) => handleScoreChange(match.id, 'A', e.target.value)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-sm font-bold text-slate-800 pr-4 truncate" title={nameB}>{nameB}</div>
                          <input 
                            type="number" 
                            className="w-16 h-10 text-center text-lg font-black bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 transition-all"
                            value={editedScores[match.id]?.scoreB !== undefined ? editedScores[match.id].scoreB : (match.scoreB !== null ? match.scoreB : '')}
                            onChange={(e) => handleScoreChange(match.id, 'B', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-5 border-t border-slate-200 pt-4">
                        {match.summaryFileUrl && (
                          <a href={match.summaryFileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-black uppercase tracking-wider mr-auto transition-colors">
                            <FileText size={14} /> Súmula
                          </a>
                        )}
                        <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-sm">
                          <Paperclip size={14} /> Upload
                          <input type="file" className="hidden" accept="application/pdf" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadSummary(match.id, file);
                          }} />
                        </label>
                        <button 
                          onClick={() => saveScores(match)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-blue-600/10"
                        >
                          <Save size={14} /> Salvar
                        </button>
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
