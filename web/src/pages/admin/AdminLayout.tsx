import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Users, KeyRound, LogOut, Image, Calendar, MessageSquare, FileCheck2, Trophy, Store } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || !['ADMIN', 'STORE_ADMIN', 'SPORTS_ADMIN'].includes(user.role)) {
    return <Navigate to="/login" />;
  }

  const isSuperAdmin = user.role === 'ADMIN';
  const isStoreAdmin = user.role === 'STORE_ADMIN' || isSuperAdmin;
  const isSportsAdmin = user.role === 'SPORTS_ADMIN' || isSuperAdmin;

    const menuItems = [
      { type: 'divider', label: 'E-COMMERCE', show: isStoreAdmin },
      { path: '/admin', icon: <LayoutDashboard size={16} />, label: 'Painel de Controle', show: true },
      { path: '/admin/products', icon: <Package size={16} />, label: 'Produtos', show: isStoreAdmin },
      { path: '/admin/orders', icon: <ShoppingBag size={16} />, label: 'Pedidos', show: isStoreAdmin },
      { path: '/admin/users', icon: <Users size={16} />, label: 'Usuários', show: isSuperAdmin },
      
      { type: 'divider', label: 'HUB ESPORTIVO', show: isSportsAdmin },
      { path: '/admin/championships', icon: <Trophy size={16} />, label: 'Campeonatos', show: isSportsAdmin },
      { path: '/admin/documents', icon: <FileCheck2 size={16} />, label: 'Documentos', show: isSportsAdmin },
      
      { type: 'divider', label: 'COMUNICAÇÃO', show: isSportsAdmin || isStoreAdmin },
      { path: '/admin/team', icon: <Image size={16} />, label: 'Diretoria', show: isSuperAdmin },
      { path: '/admin/events', icon: <Calendar size={16} />, label: 'Eventos', show: isSportsAdmin || isStoreAdmin },
      { path: '/admin/news', icon: <MessageSquare size={16} />, label: 'Fórum', show: isSportsAdmin || isStoreAdmin },
      
      { type: 'divider', label: 'SISTEMA', show: true },
      { path: '/admin/profile', icon: <KeyRound size={16} />, label: 'Meu Perfil', show: true },
    ];
  
    const visibleMenuItems = menuItems.filter(item => item.show !== false);
  
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-black text-white flex flex-col border-r border-black/20 shrink-0 md:h-screen md:sticky top-0">
          <div className="p-4 border-b border-white/20 shrink-0">
            <h2 className="font-mono tracking-[0.2em] font-bold text-lg">// FEDERADA</h2>
            <p className="text-[10px] text-gray-400 font-mono mt-1">ADMIN_PANEL v1.0</p>
          </div>
          
          <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto sidebar-scroll relative">
            {visibleMenuItems.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div key={`div-${index}`} className="mt-2 mb-1 px-3 flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">{item.label}</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>
                );
              }
  
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`flex shrink-0 items-center gap-2 px-3 py-1.5 font-mono text-[11px] transition-colors rounded-sm mx-1 ${
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
          .sidebar-scroll::-webkit-scrollbar { width: 4px; }
          .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
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
