import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { CartProvider } from "./contexts/CartContext";

import MainLayout from "./layouts/MainLayout";
import ChampionshipLayout from "./layouts/ChampionshipLayout";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound";
import CartSidebar from "./components/CartSidebar";

// Lazy-loaded pages
const StoreFront = lazy(() => import("./pages/StoreFront"));
const Store = lazy(() => import("./pages/Store"));
const Forum = lazy(() => import("./pages/Forum"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const CaadsPage = lazy(() => import("./pages/CaadsPage"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ChampionshipsPage = lazy(() => import("./pages/ChampionshipsPage"));
const AthleteDashboardPage = lazy(() => import("./pages/championships/AthleteDashboardPage"));
const ChampionshipDetailPage = lazy(() => import("./pages/ChampionshipDetailPage"));
const PublicResultsPage = lazy(() => import("./pages/PublicResultsPage"));
const MatchesView = lazy(() => import("./pages/championships/MatchesView"));
const TeamsView = lazy(() => import("./pages/championships/TeamsView"));
const RankingView = lazy(() => import("./pages/championships/RankingView"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminTeamsPage = lazy(() => import("./pages/admin/AdminTeamsPage"));
const AthleteProfilePage = lazy(() => import("./pages/teams/AthleteProfilePage"));
const TeamPage = lazy(() => import("./pages/teams/TeamPage"));
const AdminChampionshipListPage = lazy(() => import('./pages/admin/championships/AdminChampionshipListPage'));
const AdminChampionshipCreatePage = lazy(() => import('./pages/admin/championships/AdminChampionshipCreatePage'));
const AdminChampionshipLayout = lazy(() => import('./pages/admin/championships/AdminChampionshipLayout'));
const AdminChampionshipSettingsPage = lazy(() => import('./pages/admin/championships/AdminChampionshipSettingsPage'));
const AdminChampionshipSubscriptionsPage = lazy(() => import('./pages/admin/championships/AdminChampionshipSubscriptionsPage'));
const AdminChampionshipMatchesPage = lazy(() => import('./pages/admin/championships/AdminChampionshipMatchesPage'));
const AdminChampionshipResultsPage = lazy(() => import('./pages/admin/championships/AdminChampionshipResultsPage'));
const AdminChampionshipModalitiesPage = lazy(() => import('./pages/admin/championships/AdminChampionshipModalitiesPage'));
const InvitePage = lazy(() => import('./pages/teams/InvitePage'));
const TeamsDirectoryPage = lazy(() => import('./pages/TeamsDirectoryPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 text-slate-400">
      <Loader2 className="animate-spin text-[#ff5722]" size={36} />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <div className="bg-white min-h-screen selection:bg-black selection:text-white">
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '0', border: '1px solid black', background: '#fff', color: '#000', fontFamily: 'monospace' } }} />
        
        <Suspense fallback={<PageLoader />}>
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
              <Route path="/atleticas" element={<TeamsDirectoryPage />} />
              <Route path="/invite/:code" element={<InvitePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* 2. CHAMPIONSHIP LAYOUT (Módulo Esportivo - Workspace) */}
            <Route path="/campeonatos" element={<ChampionshipLayout />}>
              <Route index element={<ChampionshipsPage />} />
              <Route path="jogos" element={<MatchesView />} />
              <Route path="times" element={<TeamsView />} />
              <Route path="ranking" element={<RankingView />} />
              <Route path="perfil" element={<PrivateRoute><AthleteProfilePage defaultTab="perfil" /></PrivateRoute>} />
              <Route path="minha-equipe" element={<PrivateRoute><AthleteProfilePage defaultTab="atletica" /></PrivateRoute>} />
              {/* Mantido painel para compatibilidade temporária */}
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
              <Route path="teams" element={<AdminTeamsPage />} />

              <Route path="championships">
                <Route index element={<AdminChampionshipListPage />} />
                <Route path="create" element={<AdminChampionshipCreatePage />} />
                
                <Route path=":id" element={<AdminChampionshipLayout />}>
                  <Route index element={<div className="p-8 text-slate-500 font-sans">Bem-vindo ao painel deste campeonato. Selecione uma opção acima.</div>} />
                  <Route path="modalities" element={<AdminChampionshipModalitiesPage />} />
                  <Route path="subscriptions" element={<AdminChampionshipSubscriptionsPage />} />
                  <Route path="settings" element={<AdminChampionshipSettingsPage />} />
                  <Route path="matches" element={<AdminChampionshipMatchesPage />} />
                  <Route path="results" element={<AdminChampionshipResultsPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
        <CartSidebar />
      </div>
    </CartProvider>
  );
}

export default App;
