import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Users, KeyRound, LogOut, Image, Calendar, MessageSquare, FileCheck2, Trophy, Store } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { type: 'divider', label: 'E-COMMERCE' },
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Painel de Controle' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Produtos' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Pedidos' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Usuários' },
    
    { type: 'divider', label: 'HUB ESPORTIVO' },
    { path: '/admin/championships', icon: <Trophy size={20} />, label: 'Campeonatos' },
    { path: '/admin/documents', icon: <FileCheck2 size={20} />, label: 'Documentos' },
    
    { type: 'divider', label: 'COMUNICAÇÃO' },
    { path: '/admin/team', icon: <Image size={20} />, label: 'Diretoria' },
    { path: '/admin/events', icon: <Calendar size={20} />, label: 'Eventos' },
    { path: '/admin/news', icon: <MessageSquare size={20} />, label: 'Fórum' },
    
    { type: 'divider', label: 'SISTEMA' },
    { path: '/admin/profile', icon: <KeyRound size={20} />, label: 'Meu Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white flex flex-col border-r border-black/20 shrink-0">
        <div className="p-6 border-b border-white/20">
          <h2 className="font-mono tracking-[0.2em] font-bold text-xl">// FEDERADA</h2>
          <p className="text-xs text-gray-400 font-mono mt-2">ADMIN_PANEL v1.0</p>
        </div>
        
        <nav className="flex md:flex-col gap-2 md:gap-0 md:space-y-2 py-4 md:py-6 px-4 overflow-x-auto hide-scrollbar whitespace-nowrap border-b border-white/20 md:border-b-0">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={`div-${index}`} className="mt-4 mb-2 px-4 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{item.label}</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex shrink-0 items-center gap-3 px-4 py-2.5 font-mono text-sm transition-colors rounded-sm mx-2 ${
                  isActive 
                    ? 'bg-white text-black font-bold' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className="p-4 border-t-0 md:border-t border-white/20 mt-auto md:mt-0 flex flex-col md:block hidden md:flex">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-gray-400">LOGADO COMO</span>
              <span className="text-sm font-sans font-semibold tracking-normal truncate max-w-[150px]">{user.name}</span>
            </div>
          </div>
          <Link 
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-sm py-2 transition-colors mb-2"
          >
            <Store size={16} />
            IR PARA A LOJA
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-mono text-sm py-2 transition-colors"
          >
            <LogOut size={16} />
            SAIR DO SISTEMA
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
