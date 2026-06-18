import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, ShoppingBag, Users, LogOut, Package, Image, MessageSquare, KeyRound } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Produtos' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Pedidos' },
    { path: '/admin/team', icon: <Image size={20} />, label: 'Diretoria' },
    { path: '/admin/news', icon: <MessageSquare size={20} />, label: 'Fórum' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Usuários' },
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
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 font-mono text-sm transition-colors ${
                  isActive 
                    ? 'bg-white text-black font-bold border border-transparent' 
                    : 'text-gray-300 hover:bg-neutral-900 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-gray-400">LOGGED AS</span>
              <span className="text-sm font-bold truncate max-w-[150px]">{user.name}</span>
            </div>
          </div>
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
