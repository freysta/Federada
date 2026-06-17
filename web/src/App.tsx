import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./contexts/CartContext";

import StoreFront from "./pages/StoreFront";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <CartProvider>
      <div className="bg-white min-h-screen selection:bg-black selection:text-white">
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '0', border: '1px solid black', background: '#fff', color: '#000', fontFamily: 'monospace' } }} />
        
        <Routes>
          {/* Rota Principal da Loja */}
          <Route path="/" element={<StoreFront />} />

          {/* Rotas do Painel Administrativo */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </div>
    </CartProvider>
  );
}

export default App;
