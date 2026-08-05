import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./contexts/CartContext";

import StoreFront from "./pages/StoreFront";
import Store from "./pages/Store";
import Forum from "./pages/Forum";
import GalleryPage from "./pages/GalleryPage";
import CaadsPage from "./pages/CaadsPage";
import VerifyEmail from "./pages/VerifyEmail";
import ChampionshipsPage from "./pages/ChampionshipsPage";
import AthleteDashboardPage from "./pages/championships/AthleteDashboardPage";
import ChampionshipDetailPage from "./pages/ChampionshipDetailPage";
import PublicResultsPage from "./pages/PublicResultsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import PrivateRoute from "./components/PrivateRoute";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminNews from "./pages/admin/AdminNews";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AthleteProfilePage from "./pages/teams/AthleteProfilePage";
import TeamPage from "./pages/teams/TeamPage";
import AdminChampionshipListPage from './pages/admin/championships/AdminChampionshipListPage';
import AdminChampionshipCreatePage from './pages/admin/championships/AdminChampionshipCreatePage';
import AdminChampionshipLayout from './pages/admin/championships/AdminChampionshipLayout';
import AdminChampionshipSettingsPage from './pages/admin/championships/AdminChampionshipSettingsPage';
import AdminChampionshipSubscriptionsPage from './pages/admin/championships/AdminChampionshipSubscriptionsPage';
import AdminChampionshipMatchesPage from './pages/admin/championships/AdminChampionshipMatchesPage';
import AdminChampionshipResultsPage from './pages/admin/championships/AdminChampionshipResultsPage';
import InvitePage from './pages/teams/InvitePage';
import NotFound from "./components/NotFound";
import CartSidebar from "./components/CartSidebar";

import MainLayout from "./layouts/MainLayout";
import ChampionshipLayout from "./layouts/ChampionshipLayout";

function App() {
  return (
    <CartProvider>
      <div className="bg-white min-h-screen selection:bg-black selection:text-white">
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '0', border: '1px solid black', background: '#fff', color: '#000', fontFamily: 'monospace' } }} />
        
        <Routes>
          {/* 1. MAIN LAYOUT (E-commerce / Institucional) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<StoreFront />} />
            <Route path="/loja" element={<Store />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/caads" element={<CaadsPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/perfil" element={<PrivateRoute><AthleteProfilePage /></PrivateRoute>} />
            <Route path="/equipe" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
            <Route path="/invite/:code" element={<InvitePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* 2. CHAMPIONSHIP LAYOUT (Módulo Esportivo) */}
          <Route path="/campeonatos" element={<ChampionshipLayout />}>
            <Route index element={<ChampionshipsPage />} />
            <Route path="painel" element={<PrivateRoute><AthleteDashboardPage /></PrivateRoute>} />
            <Route path=":id" element={<ChampionshipDetailPage />} />
            <Route path=":id/resultados" element={<PublicResultsPage />} />
          </Route>

          {/* 3. ADMIN LAYOUT */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="documents" element={<AdminDocuments />} />

            <Route path="championships">
              <Route index element={<AdminChampionshipListPage />} />
              <Route path="new" element={<AdminChampionshipCreatePage />} />
              <Route path=":id" element={<AdminChampionshipLayout />}>
                <Route index element={<div className="p-10 text-center text-slate-500">Visão Geral (Em breve)</div>} />
                <Route path="subscriptions" element={<AdminChampionshipSubscriptionsPage />} />
                <Route path="matches" element={<AdminChampionshipMatchesPage />} />
                <Route path="results" element={<AdminChampionshipResultsPage />} />
                <Route path="settings" element={<AdminChampionshipSettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
        <CartSidebar />
      </div>
    </CartProvider>
  );
}

export default App;
