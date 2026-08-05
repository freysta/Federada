
import { X, CheckCircle2, Loader2 } from 'lucide-react';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubscription: any;
  teamMembers: any[];
  teamAvailabilities: any[];
  loadingMembers: boolean;
  onAddToRoster: (subId: string, athleteId: string) => void;
  onRemoveFromRoster: (subId: string, athleteId: string) => void;
}

export default function RosterModal({
  isOpen,
  onClose,
  selectedSubscription,
  teamMembers,
  teamAvailabilities,
  loadingMembers,
  onAddToRoster,
  onRemoveFromRoster
}: RosterModalProps) {
  if (!isOpen || !selectedSubscription) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-8 py-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-2xl">{selectedSubscription.modality?.name}</h3>
            <p className="text-blue-200 text-sm">{selectedSubscription.modality?.championship?.name}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto bg-white flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Available Team Members */}
          <div>
            <h4 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">Seu Plantel</h4>
            {loadingMembers ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {[...teamMembers].sort((a, b) => {
                  const availA = teamAvailabilities.some(av => av.athleteProfile?.id === a.id && av.status === 'AVAILABLE');
                  const availB = teamAvailabilities.some(av => av.athleteProfile?.id === b.id && av.status === 'AVAILABLE');
                  if (availA && !availB) return -1;
                  if (!availA && availB) return 1;
                  return 0;
                }).map((member: any) => {
                  const isInRoster = selectedSubscription.athletes?.some((a: any) => a.id === member.id);
                  if (isInRoster) return null; // already in roster

                  const isMemberAvailable = teamAvailabilities.some(av => av.athleteProfile?.id === member.id && av.status === 'AVAILABLE');

                  return (
                    <div key={member.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center hover:bg-white hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-sm">{member.user?.name}</p>
                          {isMemberAvailable && (
                            <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                              <CheckCircle2 size={10} /> Disponível
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{member.cpf} | {member.gender || 'N/A'}</p>
                      </div>
                      <button 
                        onClick={() => onAddToRoster(selectedSubscription.id, member.id)}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  );
                })}
                {teamMembers.filter(m => !selectedSubscription.athletes?.some((a: any) => a.id === m.id)).length === 0 && (
                  <p className="text-sm text-slate-500 italic text-center py-4">Nenhum atleta disponível para adicionar.</p>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Modality Roster */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col">
            <h4 className="font-bold text-lg text-slate-800 mb-1 border-b border-slate-200 pb-2 flex justify-between items-center">
              <span>Elenco Inscrito</span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                selectedSubscription.athletes?.length >= selectedSubscription.modality?.minAthletes ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {selectedSubscription.athletes?.length || 0} / {selectedSubscription.modality?.maxAthletes || '∞'}
              </span>
            </h4>
            
            <div className="space-y-2 mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {selectedSubscription.athletes?.map((athlete: any) => (
                <div key={athlete.id} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{athlete.user?.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{athlete.cpf}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveFromRoster(selectedSubscription.id, athlete.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                    title="Remover do Elenco"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {(!selectedSubscription.athletes || selectedSubscription.athletes.length === 0) && (
                <p className="text-sm text-slate-500 italic text-center py-8">Nenhum atleta no elenco ainda.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
