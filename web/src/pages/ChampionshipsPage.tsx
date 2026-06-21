import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy, Users, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChampionshipsPage() {
  const { token, user } = useAuth();
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/championships`)
      .then(res => res.json())
      .then(data => {
        setChampionships(data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Erro ao buscar campeonatos');
        setLoading(false);
      });
  }, []);

  const handleSubscribe = async (modalityId: string) => {
    if (!user) {
      toast.error('Faça login para se inscrever!');
      return;
    }

    const toastId = toast.loading('Processando inscrição...');
    try {
      const res = await fetch(`${API_URL}/championships/${modalityId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Erro ao se inscrever');
      }

      toast.success('Inscrição realizada com sucesso!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-black" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Trophy className="mx-auto mb-6 text-yellow-400" size={64} />
          <h1 className="text-4xl md:text-6xl font-bold font-mono tracking-widest uppercase mb-4">
            CAMPEONATOS FEDERADA
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A arena oficial das Atléticas. Inscreva-se, defenda as cores da sua equipe e conquiste a glória universitária.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {championships.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-bold font-mono text-gray-500">NENHUM CAMPEONATO ABERTO NO MOMENTO</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {championships.map(champ => (
              <div key={champ.id} className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 pb-6 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-xs font-bold font-mono ${champ.status === 'OPEN' ? 'bg-green-100 text-green-700 border border-green-700' : 'bg-gray-100 text-gray-700 border border-gray-700'}`}>
                        {champ.status === 'OPEN' ? 'INSCRIÇÕES ABERTAS' : 'ENCERRADO'}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold uppercase">{champ.name}</h2>
                    <p className="text-gray-600 mt-2">{champ.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-left md:text-right font-mono text-sm">
                    <div><strong>Início:</strong> {champ.startDate ? new Date(champ.startDate).toLocaleDateString() : 'A definir'}</div>
                    <div><strong>Término:</strong> {champ.endDate ? new Date(champ.endDate).toLocaleDateString() : 'A definir'}</div>
                  </div>
                </div>

                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <Shield size={24} /> MODALIDADES
                </h3>

                {champ.modalities && champ.modalities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {champ.modalities.map((mod: any) => (
                      <div key={mod.id} className="border border-gray-300 p-6 hover:border-black transition-colors flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-lg uppercase">{mod.name}</h4>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 font-mono">{mod.type}</span>
                        </div>
                        <div className="mt-auto pt-6 flex items-center justify-between">
                          <span className="font-mono font-bold text-lg">
                            {Number(mod.price) === 0 ? 'GRÁTIS' : `R$ ${Number(mod.price).toFixed(2).replace('.', ',')}`}
                          </span>
                          <button 
                            onClick={() => handleSubscribe(mod.id)}
                            disabled={champ.status !== 'OPEN'}
                            className="bg-black text-white px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            INSCREVER-SE <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Nenhuma modalidade cadastrada ainda.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
