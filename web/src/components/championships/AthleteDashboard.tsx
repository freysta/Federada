import { useState, useEffect } from 'react';
import type { IAthleteProfile, ISubscription, IAthleteProfile as ITeamMember } from '../../types';
import { API_URL } from '../../config';
import { apiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Shield, CheckCircle2, Copy, Users, Info, Upload, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import ActiveSubscriptions from './ActiveSubscriptions';

export default function AthleteDashboard() {
  const { user, token } = useAuth();
  const [athleteProfile, setAthleteProfile] = useState<IAthleteProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [mySubscriptions, setMySubscriptions] = useState<ISubscription[]>([]);
  const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const [uploadingRg, setUploadingRg] = useState(false);
  const [uploadingEnrollment, setUploadingEnrollment] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchMySubscriptions();
  }, []);

  const fetchProfile = () => {
    if (!token) return;
    setLoadingProfile(true);
    apiClient.get<any>('/teams/my/profile')
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
    apiClient.get<ISubscription[]>('/championships/my-subscriptions')
    .then(data => setMySubscriptions(data || []))
    .catch(err => console.error('Erro ao buscar inscrições', err));
  };

  const fetchTeamMembers = (teamId: string) => {
    setLoadingMembers(true);
    apiClient.get<ITeamMember[]>(`/teams/${teamId}/members`)
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
    
    apiClient.post(`/teams/my/documents/${type}`, formData)
    .then(() => {
      toast.success('Documento enviado com sucesso!');
      fetchProfile();
    })
    .catch((err: any) => toast.error(err.message))
    .finally(() => {
      if (type === 'rg') setUploadingRg(false);
      else setUploadingEnrollment(false);
    });
  };

  const getDocStatusLabel = (status: string | undefined) => {
    if (status === 'APPROVED') return { label: 'Aprovado', desc: 'Seu documento foi verificado e aprovado.', color: 'bg-green-100 text-green-700 border-green-200' };
    if (status === 'REJECTED') return { label: 'Rejeitado', desc: 'Problema com o documento. Envie novamente.', color: 'bg-red-100 text-red-700 border-red-200' };
    if (status === 'PENDING') return { label: 'Em Avaliação', desc: 'A organização irá analisar em breve.', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: 'Pendente', desc: 'Você precisa fazer o upload deste documento.', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  };

  const getSubStatusLabel = (status: string | undefined) => {
    if (status === 'PENDING_DOCS') return { label: 'Pendência de Docs', desc: 'Atletas possuem documentos pendentes.', color: 'bg-orange-100 text-orange-700' };
    if (status === 'PENDING_ROSTER') return { label: 'Elenco Incompleto', desc: 'A equipe não atingiu o número mínimo.', color: 'bg-orange-100 text-orange-700' };
    if (status === 'PENDING') return { label: 'Em Avaliação', desc: 'Aguardando revisão da organização.', color: 'bg-blue-100 text-blue-700' };
    if (status === 'REJECTED') return { label: 'Rejeitada', desc: 'Inscrição rejeitada.', color: 'bg-red-100 text-red-700' };
    if (status === 'APPROVED' || status === 'CONFIRMED') return { label: 'Confirmada', desc: 'Tudo certo! Aptos a competir.', color: 'bg-green-100 text-green-700' };
    return { label: status || 'Pendente', desc: 'Inscrição pendente de ação.', color: 'bg-slate-100 text-slate-700' };
  };

  if (loadingProfile) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  if (!athleteProfile || !athleteProfile.team) {
    return null; 
  }

  const isPresident = athleteProfile.teamRole === 'PRESIDENT' || athleteProfile.team.owner?.id === user?.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ----------------- COLUNA ESQUERDA (SIDEBAR) ----------------- */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-center relative">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 absolute top-0 w-full z-0"></div>
          
          <div className="relative z-10 pt-12 pb-6 px-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-white p-1 rounded-full shadow-md mb-4">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                {athleteProfile.team.logoUrl ? (
                  <img src={athleteProfile.team.logoUrl} className="w-full h-full object-cover" alt="Team Logo" />
                ) : (
                  <Shield size={40} className="text-blue-500" />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
            <p className="text-sm font-semibold text-blue-600 mb-2">{athleteProfile.team?.name || 'Sem Equipe'}</p>
            
            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {athleteProfile.teamRole === 'PRESIDENT' ? 'Presidente' : 'Atleta'}
            </span>
          </div>
        </div>

        {/* Invite Link Card (If President) */}
        {isPresident && (
          <div className="bg-slate-900 rounded-3xl shadow-lg border border-slate-800 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 pointer-events-none">
              <Key size={120} />
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-white text-lg mb-2">Convide Atletas</h4>
              <p className="text-xs text-slate-400 mb-4">Compartilhe o link abaixo para novos atletas ingressarem na sua equipe.</p>
              
              <div className="font-mono text-[11px] sm:text-xs text-slate-300 mb-4 bg-black/50 p-3 rounded-lg border border-slate-700 break-all select-all">
                {window.location.origin}/invite/{athleteProfile.team?.inviteCode}
              </div>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/invite/${athleteProfile.team?.inviteCode}`);
                  setCopiedCode(true);
                  toast.success('Link copiado!');
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-900/20"
              >
                {copiedCode ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {copiedCode ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>
        )}
      </div>


      {/* ----------------- COLUNA DIREITA (CONTEÚDO PRINCIPAL) ----------------- */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Active Subscriptions */}
        <ActiveSubscriptions subscriptions={mySubscriptions} getSubStatusLabel={getSubStatusLabel} />

        {/* Documentação */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload size={20} className="text-blue-500" /> Documentação Pessoal
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RG */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">Documento com Foto</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Obrigatório para jogos.</p>
                  </div>
                  {(() => {
                    const statusInfo = getDocStatusLabel(athleteProfile.documentRgStatus);
                    return (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>
                
                {athleteProfile.documentRgStatus === 'REJECTED' && athleteProfile.documentRgRejectionReason && (
                  <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs mb-4 border border-red-100">
                    <strong>Motivo:</strong> {athleteProfile.documentRgRejectionReason}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <label className="flex-1 cursor-pointer bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-center shadow-sm">
                  {uploadingRg ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Upload'}
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => {
                    if (e.target.files && e.target.files[0]) handleUploadDocument('rg', e.target.files[0]);
                  }} disabled={uploadingRg} />
                </label>
                {athleteProfile.documentRgUrl && (
                  <a href={`${API_URL}${athleteProfile.documentRgUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-center flex items-center justify-center gap-1 shadow-sm">
                    Visualizar
                  </a>
                )}
              </div>
            </div>

            {/* Matricula */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-slate-800 text-sm">Atestado de Matrícula</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Comprova o vínculo.</p>
                  </div>
                  {(() => {
                    const statusInfo = getDocStatusLabel(athleteProfile.documentEnrollmentStatus);
                    return (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>
                
                {athleteProfile.documentEnrollmentStatus === 'REJECTED' && athleteProfile.documentEnrollmentRejectionReason && (
                  <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs mb-4 border border-red-100">
                    <strong>Motivo:</strong> {athleteProfile.documentEnrollmentRejectionReason}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <label className="flex-1 cursor-pointer bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-center shadow-sm">
                  {uploadingEnrollment ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Upload'}
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => {
                    if (e.target.files && e.target.files[0]) handleUploadDocument('enrollment', e.target.files[0]);
                  }} disabled={uploadingEnrollment} />
                </label>
                {athleteProfile.documentEnrollmentUrl && (
                  <a href={`${API_URL}${athleteProfile.documentEnrollmentUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-center flex items-center justify-center gap-1 shadow-sm">
                    Visualizar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gestão de Elenco (Se Presidente) */}
        {isPresident && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Users className="text-blue-500" size={20} />
              <h4 className="font-bold text-slate-800">Elenco da Equipe</h4>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                {teamMembers.length} Atletas
              </span>
            </div>

            <div className="p-0">
              {loadingMembers ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-400" size={32} /></div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Nenhum atleta se vinculou ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold">Atleta</th>
                        <th className="px-6 py-3 font-semibold text-center">RG</th>
                        <th className="px-6 py-3 font-semibold text-center">Matrícula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 flex items-center gap-2">
                              {member.user?.name || '---'} 
                              {member.user?.id === user?.id && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">(você)</span>}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">CPF: {member.cpf || 'Não informado'}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {(() => {
                              const statusInfo = getDocStatusLabel(member.documentRgStatus);
                              const hasDoc = !!member.documentRgUrl;
                              const content = (
                                <div className="group relative inline-flex items-center justify-center">
                                  <span className={`font-bold text-[9px] px-2 py-1 rounded uppercase border ${statusInfo.color} ${hasDoc ? 'cursor-pointer hover:opacity-80' : ''}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>
                              );
                              
                              if (hasDoc) {
                                return (
                                  <a href={`${API_URL}${member.documentRgUrl}`} target="_blank" rel="noreferrer" title="Ver Documento">
                                    {content}
                                  </a>
                                );
                              }
                              return content;
                            })()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {(() => {
                              const statusInfo = getDocStatusLabel(member.documentEnrollmentStatus);
                              const hasDoc = !!member.documentEnrollmentUrl;
                              const content = (
                                <div className="group relative inline-flex items-center justify-center">
                                  <span className={`font-bold text-[9px] px-2 py-1 rounded uppercase border ${statusInfo.color} ${hasDoc ? 'cursor-pointer hover:opacity-80' : ''}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>
                              );
                              
                              if (hasDoc) {
                                return (
                                  <a href={`${API_URL}${member.documentEnrollmentUrl}`} target="_blank" rel="noreferrer" title="Ver Documento">
                                    {content}
                                  </a>
                                );
                              }
                              return content;
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
        )}

      </div>
    </div>
  );
}
