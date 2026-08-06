import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { API_URL } from '../../../config';
import { ChevronRight, Loader2, Home, Settings, Users, Trophy, Flag, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChampionshipLayout() {
  const { id } = useParams();
  const location = useLocation();
  const [champ, setChamp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/championships/${id}`)
      .then(data => {
        setChamp(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erro ao carregar dados do campeonato');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  if (!champ) {
    return <div className="p-10 text-center text-slate-500">Campeonato não encontrado.</div>;
  }

  const tabs = [
    { path: `/admin/championships/${id}`, label: 'Visão Geral', icon: <Home size={16} /> },
    { path: `/admin/championships/${id}/modalities`, label: 'Modalidades', icon: <Activity size={16} /> },
    { path: `/admin/championships/${id}/subscriptions`, label: 'Inscrições', icon: <Users size={16} /> },
    { path: `/admin/championships/${id}/matches`, label: 'Partidas', icon: <Flag size={16} /> },
    { path: `/admin/championships/${id}/results`, label: 'Resultados', icon: <Trophy size={16} /> },
    { path: `/admin/championships/${id}/settings`, label: 'Configurações', icon: <Settings size={16} /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      
      {/* Breadcrumb */}
      <div className="bg-white px-8 py-4 border-b border-slate-200 flex items-center text-sm text-slate-500 font-sans">
        <Link to="/admin" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/admin/championships" className="hover:text-blue-600 transition-colors">Campeonatos</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="font-bold text-slate-800">{champ.name}</span>
      </div>

      <div className="max-w-7xl mx-auto w-full px-8 py-8 flex flex-col flex-1 font-sans">
        
        {/* Header do Campeonato */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0 overflow-hidden">
            {champ.bannerUrl ? (
              <img src={`${API_URL}${champ.bannerUrl}`} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <Trophy size={32} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{champ.name}</h1>
            <div className="flex gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Activity size={14} /> Status: <span className="font-bold text-slate-700 ml-1">{champ.status}</span></span>
            </div>
          </div>
        </div>

        {/* Abas Internas */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          {tabs.map(tab => {
            const isActive = location.pathname === tab.path;
            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          <Outlet context={{ champ }} />
        </div>

      </div>
    </div>
  );
}
