import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./contexts/CartContext";

import StoreFront from "./pages/StoreFront";
import Forum from "./pages/Forum";
import GalleryPage from "./pages/GalleryPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminNews from "./pages/admin/AdminNews";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from "./components/NotFound";

function App() {
  return (
    <CartProvider>
      <div className="bg-white min-h-screen selection:bg-black selection:text-white">
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '0', border: '1px solid black', background: '#fff', color: '#000', fontFamily: 'monospace' } }} />
        
        <Routes>
          {/* Rota Principal da Loja */}
          <Route path="/" element={<StoreFront />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/gallery" element={<GalleryPage />} />

          {/* Rotas do Painel Administrativo */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </CartProvider>
  );
}

export default App;
