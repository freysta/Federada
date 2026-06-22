import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDocuments() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = () => {
    fetch(`${API_URL}/teams/admin/documents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setDocuments(data);
      setLoading(false);
    })
    .catch(err => {
      toast.error('Erro ao buscar documentos');
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleValidation = (id: string, type: 'rg' | 'enrollment', status: 'APPROVED' | 'REJECTED') => {
    fetch(`${API_URL}/teams/admin/documents/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, status })
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight uppercase">Validação de Documentos</h1>
        <p className="text-gray-500 font-mono text-sm mt-1">Verifique e aprove os documentos (RG e Matrícula) dos atletas para liberar a participação.</p>
      </div>

      <div className="bg-white border border-black shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" size={32} /></div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-mono text-sm border border-dashed border-gray-300">
            Nenhum documento pendente de validação no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3">Atleta</th>
                  <th className="p-3">Equipe</th>
                  <th className="p-3 text-center">RG</th>
                  <th className="p-3 text-center">Matrícula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-bold">{doc.user?.name}</div>
                      <div className="text-xs text-gray-500">ID: {doc.athleteIdCode}</div>
                      <div className="text-xs text-gray-500">CPF: {doc.cpf}</div>
                    </td>
                    <td className="p-3">{doc.team?.name}</td>
                    <td className="p-3 text-center">
                      {doc.documentRgStatus === 'PENDING' && doc.documentRgUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <a href={`${API_URL}${doc.documentRgUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                            <FileText size={16} /> Ver RG
                          </a>
                          <div className="flex gap-2">
                            <button onClick={() => handleValidation(doc.id, 'rg', 'APPROVED')} className="text-green-600 hover:bg-green-100 p-1 rounded" title="Aprovar">
                              <CheckCircle2 size={20} />
                            </button>
                            <button onClick={() => handleValidation(doc.id, 'rg', 'REJECTED')} className="text-red-600 hover:bg-red-100 p-1 rounded" title="Reprovar">
                              <XCircle size={20} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-bold ${
                          doc.documentRgStatus === 'APPROVED' ? 'text-green-700 bg-green-100' :
                          doc.documentRgStatus === 'REJECTED' ? 'text-red-700 bg-red-100' : 'text-gray-400'
                        }`}>
                          {doc.documentRgStatus}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {doc.documentEnrollmentStatus === 'PENDING' && doc.documentEnrollmentUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <a href={`${API_URL}${doc.documentEnrollmentUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                            <FileText size={16} /> Ver Atestado
                          </a>
                          <div className="flex gap-2">
                            <button onClick={() => handleValidation(doc.id, 'enrollment', 'APPROVED')} className="text-green-600 hover:bg-green-100 p-1 rounded" title="Aprovar">
                              <CheckCircle2 size={20} />
                            </button>
                            <button onClick={() => handleValidation(doc.id, 'enrollment', 'REJECTED')} className="text-red-600 hover:bg-red-100 p-1 rounded" title="Reprovar">
                              <XCircle size={20} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-bold ${
                          doc.documentEnrollmentStatus === 'APPROVED' ? 'text-green-700 bg-green-100' :
                          doc.documentEnrollmentStatus === 'REJECTED' ? 'text-red-700 bg-red-100' : 'text-gray-400'
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
    </div>
  );
}
