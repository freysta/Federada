import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { apiClient } from '../../utils/apiClient';
import { Loader2, ChevronDown, ChevronUp, Search, Check, Eye, FileCheck2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [athleteSearchQuery, setAthleteSearchQuery] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // Preview Modal States
  const [previewDoc, setPreviewDoc] = useState<{
    docId: string;
    athleteName: string;
    type: 'rg' | 'enrollment';
    url: string;
    status: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, athleteSearchQuery, showOnlyPending]);

  const fetchDocuments = () => {
    apiClient.get<any[]>('/championships/admin/documents')
    .then(data => {
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        toast.error('Erro ao buscar documentos');
        setDocuments([]);
      }
      setLoading(false);
    })
    .catch(err => {
      toast.error('Erro na requisição: ' + err.message);
      setDocuments([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleConfirmValidation = (status: 'APPROVED' | 'REJECTED') => {
    if (!previewDoc) return;
    
    setSubmittingAction(true);
    apiClient.patch(`/championships/admin/documents/${previewDoc.docId}`, {
      type: previewDoc.type,
      status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
    })
    .then(() => {
      toast.success(`Documento ${status === 'APPROVED' ? 'Aprovado' : 'Reprovado'} com sucesso!`);
      setPreviewDoc(null);
      setShowRejectionInput(false);
      setRejectionReason('');
      fetchDocuments(); // Refresh list
    })
    .catch(err => toast.error(err.message))
    .finally(() => setSubmittingAction(false));
  };

  const handleApproveAllForTeam = (teamData: any) => {
    const pendingDocsToApprove: Promise<any>[] = [];
    
    teamData.athletes.forEach((doc: any) => {
      if (doc.rgStatus === 'PENDING' && doc.rgUrl) {
        pendingDocsToApprove.push(
          apiClient.patch(`/championships/admin/documents/${doc.id}`, { type: 'rg', status: 'APPROVED' })
        );
      }
      if (doc.enrollmentStatus === 'PENDING' && doc.enrollmentUrl) {
        pendingDocsToApprove.push(
          apiClient.patch(`/championships/admin/documents/${doc.id}`, { type: 'enrollment', status: 'APPROVED' })
        );
      }
    });

    if (pendingDocsToApprove.length === 0) {
      toast.error('Nenhum documento pendente para aprovar.');
      return;
    }

    const confirmApprove = window.confirm(`Deseja aprovar todos os ${pendingDocsToApprove.length} documentos pendentes desta equipe?`);
    if (!confirmApprove) return;

    setLoading(true);
    Promise.all(pendingDocsToApprove)
      .then(() => {
        toast.success(`Documentos pendentes foram aprovados!`);
        fetchDocuments();
      })
      .catch(err => {
        toast.error('Erro ao aprovar documentos: ' + err.message);
        fetchDocuments();
      });
  };

  const sortDocuments = (docs: any[]) => {
    return [...docs].sort((a, b) => {
      const aPending = (a.rgStatus === 'PENDING' && a.rgUrl) || (a.enrollmentStatus === 'PENDING' && a.enrollmentUrl);
      const bPending = (b.rgStatus === 'PENDING' && b.rgUrl) || (b.enrollmentStatus === 'PENDING' && b.enrollmentUrl);
      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;
      return (a.athlete?.user?.name || '').localeCompare(b.athlete?.user?.name || '');
    });
  };

  const groupedByTeam = documents.reduce((acc, doc) => {
    const teamName = doc.athlete?.team?.name || 'Sem Equipe';
    if (!acc[teamName]) {
      acc[teamName] = [];
    }
    acc[teamName].push(doc);
    return acc;
  }, {} as Record<string, any[]>);

  let filteredTeams = Object.entries(groupedByTeam).filter(([teamName, teamDocs]: any) => {
    const matchesAthleteSearch = athleteSearchQuery.trim() === '' || 
      teamDocs.some((doc: any) => doc.athlete?.user?.name?.toLowerCase().includes(athleteSearchQuery.toLowerCase()));

    const hasPendingDocs = !showOnlyPending || teamDocs.some((doc: any) => 
      (doc.rgStatus === 'PENDING' && doc.rgUrl) ||
      (doc.enrollmentStatus === 'PENDING' && doc.enrollmentUrl)
    );

    const matchesTeamSearch = teamName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesAthleteSearch && hasPendingDocs && matchesTeamSearch;
  });

  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleTeam = (teamName: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamName) ? prev.filter(name => name !== teamName) : [...prev, teamName]
    );
  };

  const expandAll = () => {
    setExpandedTeams(filteredTeams.map(([teamName]) => teamName));
  };

  const collapseAll = () => {
    setExpandedTeams([]);
  };

  const totalAthletes = documents.length;
  const uniqueTeamsCount = Object.keys(groupedByTeam).length;
  const totalPendingAthletes = documents.filter(doc => 
    (doc.rgStatus === 'PENDING' && doc.rgUrl) ||
    (doc.enrollmentStatus === 'PENDING' && doc.enrollmentUrl)
  ).length;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <FileCheck2 className="text-blue-600" size={28} /> Validação Geral de Documentações
        </h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral unificada de todos os campeonatos da plataforma.</p>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400">
            <FileCheck2 size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide">Gestão Unificada por Campeonato</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Agora você pode gerenciar a documentação dos atletas de forma 100% isolada, com filtros por equipe, tabelas completas e exportação CSV diretamente na aba do campeonato correspondente.
            </p>
          </div>
        </div>
        <a 
          href="/admin/championships" 
          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 whitespace-nowrap active:scale-95"
        >
          Ir para Campeonatos
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Equipes Cadastradas</span>
          <span className="text-3xl font-black text-slate-900 mt-3">{uniqueTeamsCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Total de Atletas</span>
          <span className="text-3xl font-black text-slate-900 mt-3">{totalAthletes}</span>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${totalPendingAthletes > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'}`}>
          <span className={`text-xs font-black uppercase tracking-wider ${totalPendingAthletes > 0 ? 'text-amber-700' : 'text-slate-400'}`}>Pendentes de Aprovação</span>
          <div className="flex items-center gap-3 mt-3">
            <span className={`text-3xl font-black ${totalPendingAthletes > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{totalPendingAthletes}</span>
            {totalPendingAthletes > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por equipe..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por atleta..." 
                value={athleteSearchQuery}
                onChange={(e) => setAthleteSearchQuery(e.target.value)}
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0 justify-between sm:justify-end">
            <button
              onClick={() => setShowOnlyPending(!showOnlyPending)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                showOnlyPending 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Apenas Pendentes</span>
              {showOnlyPending && <Check size={14} />}
            </button>

            <div className="flex gap-2">
              <button
                onClick={expandAll}
                disabled={filteredTeams.length === 0}
                className="px-5 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50 transition-colors uppercase tracking-wider whitespace-nowrap"
              >
                Expandir Todas
              </button>
              <button
                onClick={collapseAll}
                className="px-5 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors uppercase tracking-wider whitespace-nowrap"
              >
                Recolher Todas
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : paginatedTeams.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            Nenhum documento encontrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {paginatedTeams.map(([teamName, teamDocs]: any) => {
              const isExpanded = expandedTeams.includes(teamName);
              const pendingCount = teamDocs.filter((d: any) => (d.rgStatus === 'PENDING' && d.rgUrl) || (d.enrollmentStatus === 'PENDING' && d.enrollmentUrl)).length;
              return (
                <div key={teamName} className="bg-white overflow-hidden transition-colors">
                  <div 
                    className="px-8 py-5 flex justify-between items-center cursor-pointer hover:bg-slate-50/65 transition-colors"
                    onClick={() => toggleTeam(teamName)}
                  >
                    <div>
                      <h3 className="font-black text-lg tracking-tight text-slate-900">{teamName}</h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">
                        Total de atletas: <span className="font-bold text-slate-800">{teamDocs.length}</span> | 
                        Aguardando aprovação: <span className={pendingCount > 0 ? "text-amber-700 font-bold ml-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100" : "text-green-700 font-bold ml-1.5 bg-green-50 px-2.5 py-1 rounded-md border border-green-100"}>{pendingCount}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {pendingCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveAllForTeam({ athletes: teamDocs });
                          }}
                          className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-250 px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                        >
                          Aprovar Pendentes
                        </button>
                      )}
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
 
                  {isExpanded && (
                    <div className="overflow-x-auto border-t border-slate-200 bg-slate-50/50 p-4">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <div className="col-span-3">Atleta</div>
                          <div className="col-span-3">Campeonato</div>
                          <div className="col-span-3 text-center">RG / Doc. Oficial</div>
                          <div className="col-span-3 text-center">Comprovante de Matrícula</div>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {(() => {
                            const sortedDocs = sortDocuments(
                              !showOnlyPending 
                                ? teamDocs 
                                : teamDocs.filter((d: any) => (d.rgStatus === 'PENDING' && d.rgUrl) || (d.enrollmentStatus === 'PENDING' && d.enrollmentUrl))
                            );

                            return sortedDocs.map(doc => {
                              const hasRgPending = doc.rgStatus === 'PENDING' && doc.rgUrl;
                              const hasEnrollmentPending = doc.enrollmentStatus === 'PENDING' && doc.enrollmentUrl;
                              
                              return (
                                <div 
                                  key={doc.id} 
                                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${(hasRgPending || hasEnrollmentPending) ? 'bg-orange-50/30' : ''}`}
                                >
                                  <div className="col-span-3">
                                    <div className="font-bold text-slate-900 truncate">
                                      {doc.athlete?.user?.name || 'Desconhecido'}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      {doc.athlete?.cpf || 'CPF não informado'}
                                    </div>
                                  </div>

                                  <div className="col-span-3">
                                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                      {doc.championship?.name || 'Desconhecido'}
                                    </span>
                                  </div>
                                  
                                  <div className="col-span-3 flex flex-col items-center justify-center">
                                    {doc.rgUrl ? (
                                      <button 
                                        onClick={() => setPreviewDoc({ docId: doc.id, athleteName: doc.athlete?.user?.name, type: 'rg', url: doc.rgUrl, status: doc.rgStatus })}
                                        className={`group relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all w-full max-w-[160px]
                                          ${doc.rgStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 
                                            doc.rgStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 
                                            'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 ring-2 ring-orange-100'}`}
                                      >
                                        <Eye size={14} className="group-hover:scale-110 transition-transform" />
                                        {doc.rgStatus === 'APPROVED' ? 'RG Aprovado' : doc.rgStatus === 'REJECTED' ? 'RG Rejeitado' : 'Analisar RG'}
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Não enviado</span>
                                    )}
                                  </div>

                                  <div className="col-span-3 flex flex-col items-center justify-center">
                                    {doc.enrollmentUrl ? (
                                      <button 
                                        onClick={() => setPreviewDoc({ docId: doc.id, athleteName: doc.athlete?.user?.name, type: 'enrollment', url: doc.enrollmentUrl, status: doc.enrollmentStatus })}
                                        className={`group relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all w-full max-w-[160px]
                                          ${doc.enrollmentStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 
                                            doc.enrollmentStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 
                                            'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 ring-2 ring-orange-100'}`}
                                      >
                                        <Eye size={14} className="group-hover:scale-110 transition-transform" />
                                        {doc.enrollmentStatus === 'APPROVED' ? 'Matrícula Aprovada' : doc.enrollmentStatus === 'REJECTED' ? 'Matrícula Rejeitada' : 'Analisar Matrícula'}
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Não enviado</span>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTeams.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-250">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">
                  Validação de {previewDoc.type === 'rg' ? 'RG' : 'Atestado de Matrícula'}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Atleta: <span className="font-bold text-slate-800">{previewDoc.athleteName}</span></p>
              </div>
              <button 
                onClick={() => {
                  setPreviewDoc(null);
                  setShowRejectionInput(false);
                  setRejectionReason('');
                }}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm uppercase tracking-wider bg-slate-200/50 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center items-center bg-slate-100 min-h-[300px]">
              {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${API_URL}${previewDoc.url}`}
                  title="Visualização do PDF"
                  className="w-full h-[450px] rounded-xl border border-slate-200 shadow-inner bg-white"
                />
              ) : (
                <img
                  src={`${API_URL}${previewDoc.url}`}
                  alt="Visualização do Documento"
                  className="max-w-full max-h-[450px] object-contain rounded-xl shadow-md border border-slate-200 bg-white"
                />
              )}
            </div>

            {showRejectionInput && (
              <div className="p-8 border-t border-slate-100 bg-rose-50/30 flex flex-col gap-3">
                <label className="text-sm font-black uppercase tracking-wider text-rose-700">
                  Motivo da Reprovação (Obrigatório)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Documento vencido, ilegível ou de outro atleta..."
                  rows={3}
                  className="w-full border border-rose-250 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all bg-white"
                />
              </div>
            )}

            <div className="px-8 py-6 border-t border-slate-150 bg-white flex flex-wrap gap-4 justify-end items-center">
              {submittingAction ? (
                <div className="flex items-center gap-3 text-slate-500 font-semibold text-base">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                  Processando...
                </div>
              ) : showRejectionInput ? (
                <>
                  <button
                    onClick={() => {
                      setShowRejectionInput(false);
                      setRejectionReason('');
                    }}
                    className="px-6 py-3.5 rounded-xl border border-slate-250 text-slate-600 font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => handleConfirmValidation('REJECTED')}
                    disabled={!rejectionReason.trim()}
                    className="px-6 py-3.5 rounded-xl bg-rose-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    Confirmar Reprovação
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectionInput(true)}
                    className="px-6 py-3.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm uppercase tracking-wider transition-colors"
                  >
                    Reprovar Documento
                  </button>
                  <button
                    onClick={() => handleConfirmValidation('APPROVED')}
                    className="px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                  >
                    Aprovar Documento
                  </button>
                </>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
