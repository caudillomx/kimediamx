import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GuidePersonalBrand from "./pages/GuidePersonalBrand";
import GuidePyme from "./pages/GuidePyme";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import KitMarcaPersonal from "./pages/KitMarcaPersonal";
import BrandKitProfile from "./pages/BrandKitProfile";
import KitPyme from "./pages/KitPyme";
import NotFound from "./pages/NotFound";
import OperationsLogin from "./pages/OperationsLogin";
import OperationsDashboard from "./pages/OperationsDashboard";
import ResetPassword from "./pages/ResetPassword";
import ContentEngine from "./pages/ContentEngine";
import ContentCycleDetail from "./pages/ContentCycleDetail";
import AuthPage from "./pages/AuthPage";
import MyStrategy from "./pages/MyStrategy";
import MyStrategyDetail from "./pages/MyStrategyDetail";
import PropuestaPanYucatan from "./pages/PropuestaPanYucatan";
import PropuestaOrtega from "./pages/PropuestaOrtega";
import CursoIaGobiernoGto from "./pages/CursoIaGobiernoGto";
import CursoIaGobiernoGtoAdmin from "./pages/CursoIaGobiernoGtoAdmin";
import CursoGtoEntregables from "./pages/CursoGtoEntregables";
import ClientWorkspace from "./pages/ClientWorkspace";
import AdsProposalView from "./pages/AdsProposalView";
import RetoInfluenSER from "./pages/RetoInfluenSER";
import ClientPortalAdmin from "./pages/admin/ClientPortalAdmin";
import PortalRouter from "./pages/portal/PortalRouter";
import { detectClientPortal } from "./lib/clientPortal";

const queryClient = new QueryClient();

const App = () => {
  // Redirect apex kimedia.mx → www.kimedia.mx (Primary desactivado en hosting)
  if (typeof window !== "undefined" && window.location.hostname === "kimedia.mx") {
    window.location.replace(
      `https://www.kimedia.mx${window.location.pathname}${window.location.search}${window.location.hash}`
    );
    return null;
  }

  const portal = detectClientPortal();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {portal ? (
          <PortalRouter portal={portal} />
        ) : (
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/guias/marca-personal" element={<GuidePersonalBrand />} />
          <Route path="/guias/pyme" element={<GuidePyme />} />
          <Route path="/aviso-de-privacidad" element={<PrivacyPolicy />} />
          <Route path="/kit/marca-personal" element={<KitMarcaPersonal />} />
          <Route path="/kit/marca-personal/perfil/:id" element={<BrandKitProfile />} />
          <Route path="/kit/pyme" element={<KitPyme />} />
          <Route path="/kit/pyme/perfil/:id" element={<BrandKitProfile />} />
          <Route path="/registro" element={<AuthPage />} />
          <Route path="/mi-estrategia" element={<MyStrategy />} />
          <Route path="/mi-estrategia/:profileId" element={<MyStrategyDetail />} />
          <Route path="/admin/operaciones/login" element={<OperationsLogin />} />
          <Route path="/admin/operaciones" element={<OperationsDashboard />} />
          <Route path="/admin/cliente/:clientId" element={<ClientWorkspace />} />
          <Route path="/admin/cliente/:clientId/portal" element={<ClientPortalAdmin />} />
          <Route path="/admin/propuesta/:proposalId" element={<AdsProposalView />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/parrilla" element={<ContentEngine />} />
          <Route path="/parrilla/:profileId" element={<ContentCycleDetail />} />
          <Route path="/propuesta-pan-yucatan" element={<PropuestaPanYucatan />} />
          <Route path="/propuesta/ortega-asociados" element={<PropuestaOrtega />} />
          <Route path="/curso/ia-gobierno-gto" element={<CursoIaGobiernoGto />} />
          <Route path="/curso/ia-gobierno-gto/admin" element={<CursoIaGobiernoGtoAdmin />} />
          <Route path="/curso/ia-gobierno-gto/entregables" element={<CursoGtoEntregables />} />
          <Route path="/reto-influenser" element={<RetoInfluenSER />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        )}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
