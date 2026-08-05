import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import AthleteDashboard from '../../components/championships/AthleteDashboard';
import AthleteOnboarding from '../../components/championships/AthleteOnboarding';
import type { IAthleteProfile } from '../../types';

export default function AthleteDashboardPage() {
  const { user, token } = useAuth();
  const [athleteProfile, setAthleteProfile] = useState<IAthleteProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = () => {
    if (!token) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    apiClient.get<any>('/teams/my/profile')
      .then(data => {
        setAthleteProfile(data || null);
        setLoadingProfile(false);
      })
      .catch(err => {
        console.error('Erro ao buscar perfil', err);
        setLoadingProfile(false);
      });
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Faça Login</h2>
        <p className="text-slate-500">Você precisa estar logado para acessar seu painel de atleta.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Meu Painel de Atleta</h1>
      <p className="text-slate-500 mb-8">Gerencie sua equipe, documentos e inscrições.</p>

      {loadingProfile ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : athleteProfile?.team ? (
        <AthleteDashboard />
      ) : (
        <AthleteOnboarding onSuccess={fetchProfile} />
      )}
    </div>
  );
}
