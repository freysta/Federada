import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../../config';
import { apiClient } from '../../../utils/apiClient';
import { 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Check, 
  Eye, 
  FileCheck2, 
  Download, 
  Filter, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shield, 
  Users, 
  User as UserIcon, 
  List, 
  Grid,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../../components/admin/Pagination';

interface IDocRecord {
  id: string;
  rgUrl?: string;
  rgStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rgRejectionReason?: string;
  enrollmentUrl?: string;
  enrollmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  enrollmentRejectionReason?: string;
  athlete?: {
    id: string;
    teamRole?: string;
    cpf?: string;
    user?: { name: string; email: string };
    team?: { id: string; name: string; logoUrl?: string };
  };
  championship?: { id: string; name: string };
}

export default function AdminChampionshipDocumentsPage() {
  const { id } = useParams();
  const [documents, setDocuments] = useState<IDocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [docTypeFilter, setDocTypeFilter] = useState<'ALL' | 'RG' | 'ENROLLMENT'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Document Inspection Modal State
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewDocType, setPreviewDocType] = useState<'rg' | 'enrollment'>('rg');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchDocuments = () => {
    if (!id) return;
    setLoading(true);
    apiClient.get<IDocRecord[]>(`/championships/admin/documents?championshipId=${id}`)
      .then(data => {
        setDocuments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Erro ao carregar documentos: ' + err.message);
        setDocuments([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTeam, statusFilter, docTypeFilter]);

  // Unique Teams List for Filter Dropdown
  const uniqueTeamsMap = documents.reduce((acc, doc) => {
    const teamId = doc.athlete?.team?.id || 'no-team';
    const teamName = doc.athlete?.team?.name || 'Sem Equipe';
    acc[teamId] = teamName;
    return acc;
  }, {} as Record<string, string>);

  // Validation Actions
  const handleConfirmValidation = (status: 'APPROVED' | 'REJECTED') => {
    if (previewIndex === null || !flattenedFilteredAthletes[previewIndex]) return;
    const athleteDoc = flattenedFilteredAthletes[previewIndex];
    
    setSubmittingAction(true);
    apiClient.patch(`/championships/admin/documents/${athleteDoc.id}`, {
      type: previewDocType,
      status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
    })
    .then(() => {
      toast.success(`Documento ${status === 'APPROVED' ? 'Aprovado' : 'Reprovado'} com sucesso!`);
      setShowRejectionInput(false);
      setRejectionReason('');
      fetchDocuments();
    })
    .catch(err => toast.error(err.message))
    .finally(() => setSubmittingAction(false));
  };

  // Bulk Approval for Team
  const handleApproveAllForTeam = (teamName: string, teamDocs: IDocRecord[]) => {
    const pendingRequests: Promise<any>[] = [];
    
    teamDocs.forEach((doc) => {
      if (doc.rgStatus === 'PENDING' && doc.rgUrl) {
        pendingRequests.push(
          apiClient.patch(`/championships/admin/documents/${doc.id}`, { type: 'rg', status: 'APPROVED' })
        );
      }
      if (doc.enrollmentStatus === 'PENDING' && doc.enrollmentUrl) {
        pendingRequests.push(
          apiClient.patch(`/championships/admin/documents/${doc.id}`, { type: 'enrollment', status: 'APPROVED' })
        );
      }
    });

    if (pendingRequests.length === 0) {
      toast.error('Nenhum documento pendente nesta equipe.');
      return;
    }

    if (!window.confirm(`Aprovar todos os ${pendingRequests.length} documentos pendentes da equipe "${teamName}"?`)) return;

    setLoading(true);
    Promise.all(pendingRequests)
      .then(() => {
        toast.success(`Documentos da equipe ${teamName} aprovados!`);
        fetchDocuments();
      })
      .catch(err => {
        toast.error('Erro ao aprovar equipe: ' + err.message);
        fetchDocuments();
      });
  };

  // CSV Export
  const handleExportCSV = () => {
    if (documents.length === 0) {
      toast.error('Nenhum dado para exportar.');
      return;
    }

    const headers = ['Atleta', 'Email', 'CPF', 'Equipe', 'Status RG', 'Motivo Reprovação RG', 'Status Matrícula', 'Motivo Reprovação Matrícula'];
    const rows = documents.map(doc => [
      `"${doc.athlete?.user?.name || ''}"`,
      `"${doc.athlete?.user?.email || ''}"`,
      `"${doc.athlete?.cpf || ''}"`,
      `"${doc.athlete?.team?.name || 'Sem Equipe'}"`,
      `"${doc.rgStatus || 'NÃO ENVIADO'}"`,
      `"${doc.rgRejectionReason || ''}"`,
      `"${doc.enrollmentStatus || 'NÃO ENVIADO'}"`,
      `"${doc.enrollmentRejectionReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Documentos_Atletas_Campeonato.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório CSV exportado com sucesso!');
  };

  // Filtering Logic
  const filteredDocuments = (Array.isArray(documents) ? documents : []).filter(doc => {
    if (!doc) return false;
    const search = searchQuery.toLowerCase().trim();
    const athleteName = doc.athlete?.user?.name?.toLowerCase() || '';
    const athleteEmail = doc.athlete?.user?.email?.toLowerCase() || '';
    const athleteCpf = doc.athlete?.cpf || '';
    const teamName = doc.athlete?.team?.name?.toLowerCase() || '';

    const matchesSearch = !search || 
      athleteName.includes(search) || 
      athleteEmail.includes(search) || 
      athleteCpf.includes(search) || 
      teamName.includes(search);

    const matchesTeam = selectedTeam === 'ALL' || (doc.athlete?.team?.id || 'no-team') === selectedTeam;

    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'PENDING' && (doc.rgStatus === 'PENDING' || doc.enrollmentStatus === 'PENDING')) ||
      (statusFilter === 'APPROVED' && doc.rgStatus === 'APPROVED' && doc.enrollmentStatus === 'APPROVED') ||
      (statusFilter === 'REJECTED' && (doc.rgStatus === 'REJECTED' || doc.enrollmentStatus === 'REJECTED'));

    const matchesDocType = docTypeFilter === 'ALL' ||
      (docTypeFilter === 'RG' && !!doc.rgUrl) ||
      (docTypeFilter === 'ENROLLMENT' && !!doc.enrollmentUrl);

    return matchesSearch && matchesTeam && matchesStatus && matchesDocType;
  });

  const flattenedFilteredAthletes = filteredDocuments;

  // Group by Team for Accordion View
  const groupedByTeam = filteredDocuments.reduce((acc, doc) => {
    const teamName = doc.athlete?.team?.name || 'Sem Equipe';
    if (!acc[teamName]) acc[teamName] = [];
    acc[teamName].push(doc);
    return acc;
  }, {} as Record<string, IDocRecord[]>);

  const teamEntries = Object.entries(groupedByTeam);
  const totalPages = Math.ceil(teamEntries.length / itemsPerPage);
  const paginatedTeams = teamEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Global Metrics
  const totalAthletes = documents.length;
  const totalTeams = Object.keys(documents.reduce((acc, d) => {
    acc[d.athlete?.team?.name || 'Sem Equipe'] = true;
    return acc;
  }, {} as Record<string, boolean>)).length;

  const totalPending = documents.filter(d => 
    (d.rgStatus === 'PENDING' && d.rgUrl) || (d.enrollmentStatus === 'PENDING' && d.enrollmentUrl)
  ).length;

  const totalApproved = documents.filter(d => 
    d.rgStatus === 'APPROVED' && d.enrollmentStatus === 'APPROVED'
  ).length;

  const totalRejected = documents.filter(d => 
    d.rgStatus === 'REJECTED' || d.enrollmentStatus === 'REJECTED'
  ).length;

  const approvalRate = totalAthletes > 0 ? Math.round((totalApproved / totalAthletes) * 100) : 0;

  const toggleTeam = (teamName: string) => {
    setExpandedTeams(prev => prev.includes(teamName) ? prev.filter(t => t !== teamName) : [...prev, teamName]);
  };

  const currentPreviewDoc = previewIndex !== null ? flattenedFilteredAthletes[previewIndex] : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <FileCheck2 className="text-blue-600" size={24} /> Documentação dos Atletas
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Analise, verifique e aprove os documentos de RG e Matrícula dos atletas deste campeonato.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Download size={16} /> Exportar Relatório CSV
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Equipes</span>
          <span className="text-2xl font-black text-slate-900 mt-2">{totalTeams}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Atletas</span>
          <span className="text-2xl font-black text-slate-900 mt-2">{totalAthletes}</span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
          totalPending > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider ${totalPending > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
            Pendentes
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-2xl font-black ${totalPending > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{totalPending}</span>
            {totalPending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Aprovados</span>
          <span className="text-2xl font-black text-emerald-600 mt-2">{totalApproved}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Taxa de Conformidade</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-blue-600">{approvalRate}%</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${approvalRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar atleta, CPF ou equipe..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Team Dropdown */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-blue-600 transition-all"
            >
              <option value="ALL">Todas as Equipes ({totalTeams})</option>
              {Object.entries(uniqueTeamsMap).map(([teamId, teamName]) => (
                <option key={teamId} value={teamId}>{teamName}</option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-blue-600 transition-all"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PENDING">⚠️ Pendentes ({totalPending})</option>
              <option value="APPROVED">✅ Aprovados ({totalApproved})</option>
              <option value="REJECTED">❌ Reprovados ({totalRejected})</option>
            </select>

            {/* Doc Type Dropdown */}
            <select
              value={docTypeFilter}
              onChange={(e: any) => setDocTypeFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white outline-none focus:border-blue-600 transition-all"
            >
              <option value="ALL">Todos os Documentos</option>
              <option value="RG">Apenas RG</option>
              <option value="ENROLLMENT">Apenas Matrícula</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-slate-300 rounded-xl overflow-hidden bg-white ml-auto lg:ml-0">
              <button
                onClick={() => setViewMode('grouped')}
                className={`p-2 text-xs font-bold transition-colors ${viewMode === 'grouped' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Agrupado por Equipe"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 text-xs font-bold transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Tabela Geral Completa"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-medium space-y-2">
            <AlertCircle className="mx-auto text-slate-400" size={36} />
            <p className="text-sm font-bold text-slate-700 uppercase">Nenhum documento encontrado</p>
            <p className="text-xs text-slate-500">Tente ajustar os filtros ou a busca por nome/equipe.</p>
          </div>
        ) : viewMode === 'grouped' ? (

          /* GROUPED ACCORDION VIEW */
          <div className="divide-y divide-slate-200">
            {paginatedTeams.map(([teamName, teamDocs]) => {
              const isExpanded = expandedTeams.includes(teamName);
              const teamPendingCount = teamDocs.filter(d => 
                (d.rgStatus === 'PENDING' && d.rgUrl) || (d.enrollmentStatus === 'PENDING' && d.enrollmentUrl)
              ).length;

              return (
                <div key={teamName} className="bg-white">
                  <div 
                    onClick={() => toggleTeam(teamName)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 uppercase">
                        {teamName.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase">{teamName}</h4>
                        <span className="text-xs text-slate-500 font-medium">{teamDocs.length} atletas listados</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {teamPendingCount > 0 && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Clock size={12} /> {teamPendingCount} pendente(s)
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveAllForTeam(teamName, teamDocs);
                        }}
                        className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      >
                        <Check size={14} /> Aprovar Tudo da Equipe
                      </button>

                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Athlete Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">Atleta</th>
                              <th className="px-4 py-3">CPF</th>
                              <th className="px-4 py-3">Documento RG</th>
                              <th className="px-4 py-3">Comprovante Matrícula</th>
                              <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {teamDocs.map((doc) => {
                              const globalIndex = flattenedFilteredAthletes.findIndex(d => d.id === doc.id);
                              return (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-slate-900">{doc.athlete?.user?.name || 'Sem Nome'}</div>
                                    <div className="text-[10px] text-slate-400">{doc.athlete?.user?.email}</div>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-600">{doc.athlete?.cpf || '-'}</td>
                                  <td className="px-4 py-3">
                                    {renderBadge(doc.rgStatus, doc.rgUrl, doc.rgRejectionReason)}
                                  </td>
                                  <td className="px-4 py-3">
                                    {renderBadge(doc.enrollmentStatus, doc.enrollmentUrl, doc.enrollmentRejectionReason)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => {
                                        setPreviewIndex(globalIndex);
                                        setPreviewDocType(doc.rgStatus === 'PENDING' && doc.rgUrl ? 'rg' : 'enrollment');
                                      }}
                                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                    >
                                      <Eye size={14} /> Analisar
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (

          /* FLAT FULL DATA TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Atleta</th>
                  <th className="px-5 py-3.5">Equipe</th>
                  <th className="px-5 py-3.5">CPF</th>
                  <th className="px-5 py-3.5">RG</th>
                  <th className="px-5 py-3.5">Matrícula</th>
                  <th className="px-5 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {flattenedFilteredAthletes.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{doc.athlete?.user?.name || 'Sem Nome'}</div>
                      <div className="text-[11px] text-slate-500">{doc.athlete?.user?.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">
                      {doc.athlete?.team?.name || 'Sem Equipe'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{doc.athlete?.cpf || '-'}</td>
                    <td className="px-5 py-3.5">
                      {renderBadge(doc.rgStatus, doc.rgUrl, doc.rgRejectionReason)}
                    </td>
                    <td className="px-5 py-3.5">
                      {renderBadge(doc.enrollmentStatus, doc.enrollmentUrl, doc.enrollmentRejectionReason)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setPreviewIndex(idx);
                          setPreviewDocType(doc.rgStatus === 'PENDING' && doc.rgUrl ? 'rg' : 'enrollment');
                        }}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        <Eye size={14} /> Analisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {viewMode === 'grouped' && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* DOCUMENT INSPECTION MODAL */}
      {currentPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-tight">
                    Verificação: {currentPreviewDoc.athlete?.user?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Equipe: <span className="text-white font-bold">{currentPreviewDoc.athlete?.team?.name || 'Sem Equipe'}</span> • CPF: {currentPreviewDoc.athlete?.cpf || '-'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => { setPreviewIndex(null); setShowRejectionInput(false); }}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Type Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-3">
              <button
                onClick={() => setPreviewDocType('rg')}
                className={`pb-3 text-xs font-extrabold uppercase border-b-2 transition-all flex items-center gap-2 ${
                  previewDocType === 'rg' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>RG / Documento Oficial</span>
                {renderBadge(currentPreviewDoc.rgStatus, currentPreviewDoc.rgUrl, currentPreviewDoc.rgRejectionReason)}
              </button>

              <button
                onClick={() => setPreviewDocType('enrollment')}
                className={`pb-3 text-xs font-extrabold uppercase border-b-2 transition-all flex items-center gap-2 ${
                  previewDocType === 'enrollment' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Comprovante de Matrícula</span>
                {renderBadge(currentPreviewDoc.enrollmentStatus, currentPreviewDoc.enrollmentUrl, currentPreviewDoc.enrollmentRejectionReason)}
              </button>
            </div>

            {/* Modal Body: Document Preview */}
            <div className="p-6 flex-1 overflow-y-auto bg-slate-100 flex flex-col items-center justify-center min-h-[350px]">
              {previewDocType === 'rg' ? (
                currentPreviewDoc.rgUrl ? (
                  currentPreviewDoc.rgUrl.endsWith('.pdf') ? (
                    <iframe src={`${API_URL}${currentPreviewDoc.rgUrl}`} className="w-full h-[450px] rounded-xl border border-slate-300" title="PDF RG" />
                  ) : (
                    <div className="max-w-full max-h-[450px] overflow-auto rounded-xl border border-slate-300 shadow-md bg-white p-2">
                      <img src={`${API_URL}${currentPreviewDoc.rgUrl}`} alt="RG Document" className="max-w-full h-auto object-contain rounded-lg" />
                    </div>
                  )
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm uppercase">Atleta não enviou foto do RG</p>
                  </div>
                )
              ) : (
                currentPreviewDoc.enrollmentUrl ? (
                  currentPreviewDoc.enrollmentUrl.endsWith('.pdf') ? (
                    <iframe src={`${API_URL}${currentPreviewDoc.enrollmentUrl}`} className="w-full h-[450px] rounded-xl border border-slate-300" title="PDF Matrícula" />
                  ) : (
                    <div className="max-w-full max-h-[450px] overflow-auto rounded-xl border border-slate-300 shadow-md bg-white p-2">
                      <img src={`${API_URL}${currentPreviewDoc.enrollmentUrl}`} alt="Matrícula Document" className="max-w-full h-auto object-contain rounded-lg" />
                    </div>
                  )
                ) : (
                  <div className="text-center text-slate-400 py-10">
                    <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm uppercase">Atleta não enviou comprovante de matrícula</p>
                  </div>
                )
              )}
            </div>

            {/* Rejection Input Drawer */}
            {showRejectionInput && (
              <div className="p-4 bg-rose-50 border-t border-rose-200 animate-in slide-in-from-bottom-4 duration-200">
                <p className="text-xs font-black text-rose-800 uppercase mb-2">Informe o motivo da reprovação:</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['Documento Ilegível', 'Foto Cortada', 'Comprovante Vencido', 'Não é documento oficial'].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRejectionReason(chip)}
                      className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Descreva o motivo da recusa..."
                    className="flex-1 border border-rose-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <button
                    onClick={() => handleConfirmValidation('REJECTED')}
                    disabled={submittingAction || !rejectionReason.trim()}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                  >
                    Confirmar Recusa
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
                  disabled={previewIndex === 0}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  title="Atleta Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs text-slate-500 font-mono">
                  {previewIndex !== null ? previewIndex + 1 : 0} de {flattenedFilteredAthletes.length}
                </span>
                <button
                  onClick={() => setPreviewIndex(prev => (prev !== null && prev < flattenedFilteredAthletes.length - 1 ? prev + 1 : prev))}
                  disabled={previewIndex === flattenedFilteredAthletes.length - 1}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  title="Próximo Atleta"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowRejectionInput(!showRejectionInput)}
                  disabled={submittingAction}
                  className="flex-1 sm:flex-initial bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl border border-rose-200 transition-colors"
                >
                  Reprovar
                </button>
                
                <button
                  onClick={() => handleConfirmValidation('APPROVED')}
                  disabled={submittingAction}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase px-6 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <Check size={16} /> Aprovar Documento
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Helper Badge Renderer
function renderBadge(status: string, url?: string, reason?: string) {
  if (!url) {
    return (
      <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[10px] font-bold uppercase border border-slate-200">
        Não Enviado
      </span>
    );
  }
  if (status === 'APPROVED') {
    return (
      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase border border-emerald-200 inline-flex items-center gap-1">
        <CheckCircle2 size={11} /> Aprovado
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span 
        title={reason ? `Motivo: ${reason}` : ''}
        className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10px] font-bold uppercase border border-rose-200 inline-flex items-center gap-1 cursor-help"
      >
        <XCircle size={11} /> Reprovado
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[10px] font-bold uppercase border border-amber-200 inline-flex items-center gap-1">
      <Clock size={11} /> Pendente
    </span>
  );
}
