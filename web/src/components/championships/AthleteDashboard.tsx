import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Shield, Trophy, CheckCircle2, Copy, Users, Info, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AthleteDashboard() {
  const { token, user } = useAuth();
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const [uploadingRg, setUploadingRg] = useState(false);
  const [uploadingEnrollment, setUploadingEnrollment] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchMySubscriptions();
  }, [token]);

  const fetchProfile = () => {
    if (!token) return;
    setLoadingProfile(true);
    fetch(`${API_URL}/teams/my/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setAthleteProfile(data || null);
      setLoadingProfile(false);
      if (data?.team?.owner?.id === user?.id) {
        fetchTeamMembers(data.team.id);
      }
    })
    .catch(err => {
      console.error('Erro ao buscar perfil', err);
      setLoadingProfile(false);
    });
  };

  const fetchMySubscriptions = () => {
    if (!token) return;
    fetch(`${API_URL}/championships/my-subscriptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setMySubscriptions(data || []))
    .catch(err => console.error('Erro ao buscar inscrições', err));
  };

  const fetchTeamMembers = (teamId: string) => {
    setLoadingMembers(true);
    fetch(`${API_URL}/teams/${teamId}/members`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setTeamMembers(data);
      setLoadingMembers(false);
    })
    .catch(err => {
      console.error('Erro ao buscar membros', err);
      setLoadingMembers(false);
    });
  };

  const handleUploadDocument = (type: 'rg' | 'enrollment', file: File) => {
    if (!token) return;
    const formData = new FormData();
    formData.append('file', file);
    
    if (type === 'rg') setUploadingRg(true);
    else setUploadingEnrollment(true);
    
    fetch(`${API_URL}/teams/my/documents/${type}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    .then(res => {
      if (!res.ok) throw new Error('Falha no upload');
      return res.json();
    })
    .then(() => {
      toast.success('Documento enviado com sucesso!');
      fetchProfile();
    })
    .catch(err => toast.error(err.message))
    .finally(() => {
      if (type === 'rg') setUploadingRg(false);
      else setUploadingEnrollment(false);
    });
  };

  const getDocStatusLabel = (status: string | undefined) => {
    if (status === 'APPROVED') return { label: 'Aprovado', desc: 'Seu documento foi verificado e aprovado pela organização.', color: 'bg-green-100 text-green-700' };
    if (status === 'REJECTED') return { label: 'Rejeitado', desc: 'Houve um problema com seu documento. Veja o motivo e envie novamente.', color: 'bg-red-100 text-red-700' };
    if (status === 'PENDING') return { label: 'Em Avaliação', desc: 'A organização do campeonato irá analisar o documento em breve.', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Pendente Envio', desc: 'Você precisa fazer o upload deste documento para competir.', color: 'bg-orange-100 text-orange-700' };
  };

  const getSubStatusLabel = (status: string | undefined) => {
    if (status === 'PENDING_DOCS') return { label: 'Pendência de Docs', desc: 'Atletas inscritos possuem documentos pendentes ou rejeitados.', color: 'bg-orange-100 text-orange-700' };
    if (status === 'PENDING_ROSTER') return { label: 'Elenco Incompleto', desc: 'A equipe não atingiu o número mínimo de atletas.', color: 'bg-orange-100 text-orange-700' };
    if (status === 'PENDING') return { label: 'Em Avaliação', desc: 'Aguardando revisão da organização.', color: 'bg-blue-100 text-blue-700' };
    if (status === 'REJECTED') return { label: 'Rejeitada', desc: 'Inscrição não foi aceita pela organização.', color: 'bg-red-100 text-red-700' };
    if (status === 'APPROVED' || status === 'CONFIRMED') return { label: 'Confirmada', desc: 'Tudo certo! Equipe apta a competir.', color: 'bg-green-100 text-green-700' };
    return { label: status || 'Pendente', desc: 'Inscrição pendente de ação.', color: 'bg-slate-100 text-slate-700' };
  };

  if (loadingProfile) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  if (!athleteProfile || !athleteProfile.team) {
    return null; // Component should only be rendered if user has a team
  }

  const isPresident = athleteProfile.teamRole === 'PRESIDENT' || athleteProfile.team.owner?.id === user?.id;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Atleta e Documentos */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            {athleteProfile.team.logoUrl ? (
              <img src={athleteProfile.team.logoUrl} className="w-full h-full rounded-full object-cover" />
            ) : (
              <Shield size={32} />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
            <p className="text-slate-500 font-medium">
              Atleta da <span className="text-blue-600 font-bold">{athleteProfile.team.name}</span>
            </p>
          </div>
        </div>

        <div className="p-8">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Upload size={20} className="text-blue-500" /> Documentação Pessoal
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RG */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-bold text-slate-800">Documento com Foto (RG)</div>
                  <p className="text-xs text-slate-500">Obrigatório para identificação nos jogos.</p>
                </div>
                {(() => {
                  const statusInfo = getDocStatusLabel(athleteProfile.documentRgStatus);
                  return (
                    <div className="group relative flex items-center gap-1 cursor-help">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <Info size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                        <div className="bg-slate-800 text-white text-[10px] rounded-lg p-2 shadow-xl border border-slate-700">
                          {statusInfo.desc}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {athleteProfile.documentRgStatus === 'REJECTED' && athleteProfile.documentRgRejectionReason && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                  <strong>Motivo:</strong> {athleteProfile.documentRgRejectionReason}
                </div>
              )}
              
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors text-center shadow-sm">
                  {uploadingRg ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Fazer Upload'}
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => {
                    if (e.target.files && e.target.files[0]) handleUploadDocument('rg', e.target.files[0]);
                  }} disabled={uploadingRg} />
                </label>
                {athleteProfile.documentRgUrl && (
                  <a href={`${API_URL}${athleteProfile.documentRgUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors text-center flex items-center justify-center gap-2 shadow-sm">
                    Ver Documento
                  </a>
                )}
              </div>
            </div>

            {/* Matricula */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-bold text-slate-800">Atestado de Matrícula</div>
                  <p className="text-xs text-slate-500">Comprova seu vínculo com a universidade.</p>
                </div>
                {(() => {
                  const statusInfo = getDocStatusLabel(athleteProfile.documentEnrollmentStatus);
                  return (
                    <div className="group relative flex items-center gap-1 cursor-help">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <Info size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                        <div className="bg-slate-800 text-white text-[10px] rounded-lg p-2 shadow-xl border border-slate-700">
                          {statusInfo.desc}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {athleteProfile.documentEnrollmentStatus === 'REJECTED' && athleteProfile.documentEnrollmentRejectionReason && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                  <strong>Motivo:</strong> {athleteProfile.documentEnrollmentRejectionReason}
                </div>
              )}
              
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors text-center shadow-sm">
                  {uploadingEnrollment ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Fazer Upload'}
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => {
                    if (e.target.files && e.target.files[0]) handleUploadDocument('enrollment', e.target.files[0]);
                  }} disabled={uploadingEnrollment} />
                </label>
                {athleteProfile.documentEnrollmentUrl && (
                  <a href={`${API_URL}${athleteProfile.documentEnrollmentUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors text-center flex items-center justify-center gap-2 shadow-sm">
                    Ver Documento
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Inscrições Ativas */}
      {mySubscriptions.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" /> Suas Inscrições
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySubscriptions.map(sub => {
              const mod = sub.modality;
              if (!mod) return null;
              return (
                <div key={sub.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-200 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">{mod.championship?.name}</span>
                    <p className="font-bold text-slate-800 leading-tight">{mod.name} {mod.type}</p>
                  </div>
                  <div className="group relative flex items-center gap-1 cursor-help">
                    <span className={`font-bold text-[10px] uppercase px-3 py-1.5 rounded-full ${getSubStatusLabel(sub.status).color}`}>
                      {getSubStatusLabel(sub.status).label}
                    </span>
                    <Info size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                      <div className="bg-slate-800 text-white text-[10px] rounded-lg p-2 shadow-xl border border-slate-700">
                        {getSubStatusLabel(sub.status).desc}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Painel do Presidente (se for dono) */}
      {isPresident && (
        <div className="bg-slate-900 rounded-3xl shadow-lg border border-slate-800 overflow-hidden text-white">
          <div className="px-8 py-6 border-b border-slate-800 flex items-center gap-3">
            <Users className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold">Gestão da Atlética</h3>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ml-2">Presidente</span>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="md:col-span-1">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                  <h4 className="font-semibold text-slate-400 text-xs mb-2 uppercase tracking-wide">Código de Convite</h4>
                  <p className="font-mono text-3xl font-bold text-white mb-4">{athleteProfile.team.inviteCode}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(athleteProfile.team.inviteCode);
                      setCopiedCode(true);
                      toast.success('Código copiado!');
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {copiedCode ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    {copiedCode ? 'Copiado!' : 'Copiar Código'}
                  </button>
                  <p className="text-xs text-slate-400 mt-4 text-center">Compartilhe este código para atletas entrarem no seu time.</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-bold text-lg mb-4">Elenco Ativo ({teamMembers.length})</h4>
                
                {loadingMembers ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-400" size={32} /></div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                    <Users size={32} className="mx-auto text-slate-500 mb-3" />
                    <p className="text-slate-400">Nenhum atleta se vinculou ainda.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-800 text-slate-300">
                          <th className="p-4 font-semibold">Atleta</th>
                          <th className="p-4 font-semibold text-center">RG</th>
                          <th className="p-4 font-semibold text-center">Matrícula</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {teamMembers.map((member: any) => (
                          <tr key={member.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-white">{member.user?.name || '---'}</p>
                              <p className="text-xs text-slate-400 font-mono">{member.cpf}</p>
                            </td>
                            <td className="p-4 text-center">
                              {(() => {
                                const statusInfo = getDocStatusLabel(member.documentRgStatus);
                                return (
                                  <div className="group relative inline-flex items-center gap-1 cursor-help justify-center">
                                    <span className={`font-bold text-[10px] px-2 py-1 rounded-md uppercase ${statusInfo.color}`}>
                                      {statusInfo.label}
                                    </span>
                                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                                      <div className="bg-slate-900 text-white text-[10px] rounded-lg p-2 shadow-xl border border-slate-700">
                                        {statusInfo.desc}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="p-4 text-center">
                              {(() => {
                                const statusInfo = getDocStatusLabel(member.documentEnrollmentStatus);
                                return (
                                  <div className="group relative inline-flex items-center gap-1 cursor-help justify-center">
                                    <span className={`font-bold text-[10px] px-2 py-1 rounded-md uppercase ${statusInfo.color}`}>
                                      {statusInfo.label}
                                    </span>
                                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                                      <div className="bg-slate-900 text-white text-[10px] rounded-lg p-2 shadow-xl border border-slate-700">
                                        {statusInfo.desc}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
