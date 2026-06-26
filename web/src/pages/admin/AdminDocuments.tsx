import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/admin/Pagination';

export default function AdminDocuments() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchDocuments = () => {
    fetch(`${API_URL}/teams/admin/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        toast.error(data.message || 'Erro ao buscar documentos');
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
  }, [token]);

  const handleValidation = (id: string, type: 'rg' | 'enrollment', status: 'APPROVED' | 'REJECTED') => {
    let rejectionReason = undefined;
    if (status === 'REJECTED') {
      const reason = window.prompt(`Motivo da rejeição para ${type === 'rg' ? 'o RG' : 'o Atestado'}:`);
      if (reason === null) return; // cancelou
      if (!reason.trim()) {
        toast.error('O motivo da rejeição é obrigatório.');
        return;
      }
      rejectionReason = reason;
    }

    fetch(`${API_URL}/teams/admin/documents/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, status, rejectionReason })
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao validar documento');
      return res.json();
    })
    .then(() => {
      toast.success(`Documento ${status === 'APPROVED' ? 'Aprovado' : 'Reprovado'} com sucesso!`);
      fetchDocuments(); // Refresh list
    })
    .catch(err => toast.error(err.message));
  };

  // Agrupa os atletas por atlética
  const teamsMap = new Map<string, { teamName: string, athletes: any[], pendingCount: number }>();
  documents.forEach(doc => {
    if (!doc.team) return;
    if (!teamsMap.has(doc.team.id)) {
      teamsMap.set(doc.team.id, { teamName: doc.team.name, athletes: [], pendingCount: 0 });
    }
    const teamData = teamsMap.get(doc.team.id)!;
    teamData.athletes.push(doc);
    
    // Check if there's any pending document
    const isRgPending = doc.documentRgStatus === 'PENDING' && doc.documentRgUrl;
    const isEnrollmentPending = doc.documentEnrollmentStatus === 'PENDING' && doc.documentEnrollmentUrl;
    if (isRgPending || isEnrollmentPending) {
      teamData.pendingCount++;
    }
  });

  const teams = Array.from(teamsMap.entries());

  const filteredTeams = teams.filter(([_, teamData]) => 
    teamData.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight uppercase">Validação de Documentos</h1>
        <p className="text-gray-500 font-mono text-sm mt-1">Verifique e aprove os documentos (RG e Matrícula) dos atletas agrupados por equipe.</p>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar atlética..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" size={32} /></div>
        ) : paginatedTeams.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            {searchQuery ? 'Nenhuma atlética encontrada na busca.' : 'Nenhuma atlética com atletas cadastrados no momento.'}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedTeams.map(([teamId, teamData]) => (
              <div key={teamId} className="border-b border-gray-200 last:border-b-0 overflow-hidden">
                <div 
                  className="bg-white px-5 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedTeam(expandedTeam === teamId ? null : teamId)}
                >
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-tight text-gray-900">{teamData.teamName}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Total de atletas: <span className="font-bold text-gray-800">{teamData.athletes.length}</span> | 
                      Aguardando aprovação: <span className={teamData.pendingCount > 0 ? "text-red-600 font-bold ml-1 bg-red-50 px-1.5 py-0.5 rounded-md" : "text-green-600 font-bold ml-1 bg-green-50 px-1.5 py-0.5 rounded-md"}>{teamData.pendingCount}</span>
                    </p>
                  </div>
                  <div className="text-gray-400">
                    {expandedTeam === teamId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {expandedTeam === teamId && (
                  <div className="overflow-x-auto border-t border-gray-200 bg-gray-50 p-3">
                    <table className="w-full text-left font-sans text-sm bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <thead className="bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3">Atleta</th>
                          <th className="px-4 py-3 text-center">RG</th>
                          <th className="px-4 py-3 text-center">Matrícula</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {teamData.athletes.map((doc: any) => (
                          <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2">
                              <div className="font-bold text-gray-900 leading-tight">{doc.user?.name}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5 font-mono">ID: {doc.athleteIdCode}</div>
                              <div className="text-[10px] text-gray-500 font-mono">CPF: {doc.cpf}</div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              {doc.documentRgStatus === 'PENDING' && doc.documentRgUrl ? (
                                <div className="flex flex-col items-center gap-1.5">
                                  <a href={`${API_URL}${doc.documentRgUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium text-[11px]">
                                    <FileText size={12} /> Ver RG
                                  </a>
                                  <div className="flex gap-1.5">
                                    <button onClick={() => handleValidation(doc.id, 'rg', 'APPROVED')} className="text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 p-1 rounded transition-colors" title="Aprovar">
                                      <CheckCircle2 size={16} />
                                    </button>
                                    <button onClick={() => handleValidation(doc.id, 'rg', 'REJECTED')} className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 p-1 rounded transition-colors" title="Reprovar">
                                      <XCircle size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                                  doc.documentRgStatus === 'APPROVED' ? 'text-green-700 bg-green-100 border border-green-200' :
                                  doc.documentRgStatus === 'REJECTED' ? 'text-red-700 bg-red-100 border border-red-200' : 'text-gray-500 bg-gray-100 border border-gray-200'
                                }`}>
                                  {doc.documentRgStatus}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {doc.documentEnrollmentStatus === 'PENDING' && doc.documentEnrollmentUrl ? (
                                <div className="flex flex-col items-center gap-1.5">
                                  <a href={`${API_URL}${doc.documentEnrollmentUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium text-[11px]">
                                    <FileText size={12} /> Ver Atestado
                                  </a>
                                  <div className="flex gap-1.5">
                                    <button onClick={() => handleValidation(doc.id, 'enrollment', 'APPROVED')} className="text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 p-1 rounded transition-colors" title="Aprovar">
                                      <CheckCircle2 size={16} />
                                    </button>
                                    <button onClick={() => handleValidation(doc.id, 'enrollment', 'REJECTED')} className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 p-1 rounded transition-colors" title="Reprovar">
                                      <XCircle size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                  doc.documentEnrollmentStatus === 'APPROVED' ? 'text-green-700 bg-green-100 border border-green-200' :
                                  doc.documentEnrollmentStatus === 'REJECTED' ? 'text-red-700 bg-red-100 border border-red-200' : 'text-gray-500 bg-gray-100 border border-gray-200'
                                }`}>
                                  {doc.documentEnrollmentStatus}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
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
    </div>
  );
}
