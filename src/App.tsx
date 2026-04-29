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
import CursoIaGobiernoGto from "./pages/CursoIaGobiernoGto";
import CursoIaGobiernoGtoAdmin from "./pages/CursoIaGobiernoGtoAdmin";
import CursoGtoEntregables from "./pages/CursoGtoEntregables";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/parrilla" element={<ContentEngine />} />
          <Route path="/parrilla/:profileId" element={<ContentCycleDetail />} />
          <Route path="/propuesta-pan-yucatan" element={<PropuestaPanYucatan />} />
          <Route path="/curso/ia-gobierno-gto" element={<CursoIaGobiernoGto />} />
          <Route path="/curso/ia-gobierno-gto/admin" element={<CursoIaGobiernoGtoAdmin />} />
          <Route path="/curso/ia-gobierno-gto/entregables" element={<CursoGtoEntregables />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
