import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QuizPersonalBrand from "./pages/QuizPersonalBrand";
import QuizPyme from "./pages/QuizPyme";
import GuidePersonalBrand from "./pages/GuidePersonalBrand";
import GuidePyme from "./pages/GuidePyme";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Liderazgos from "./pages/Liderazgos";
import LiderazgosPresentation from "./pages/LiderazgosPresentation";

import AdminLiderazgos from "./pages/AdminLiderazgos";
import ParticipantProfile from "./pages/ParticipantProfile";
import KitMarcaPersonal from "./pages/KitMarcaPersonal";
import BrandKitProfile from "./pages/BrandKitProfile";
import KitPyme from "./pages/KitPyme";
import Membership from "./pages/Membership";
import BrandTrivia from "./pages/BrandTrivia";
import SocialSimulator from "./pages/SocialSimulator";
import BrandPuzzle from "./pages/BrandPuzzle";
import NotFound from "./pages/NotFound";
import Tools from "./pages/Tools";
import OperationsLogin from "./pages/OperationsLogin";
import OperationsDashboard from "./pages/OperationsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/diagnostico/marca-personal" element={<QuizPersonalBrand />} />
          <Route path="/diagnostico/pyme" element={<QuizPyme />} />
          <Route path="/guias/marca-personal" element={<GuidePersonalBrand />} />
          <Route path="/guias/pyme" element={<GuidePyme />} />
          <Route path="/aviso-de-privacidad" element={<PrivacyPolicy />} />
          <Route path="/liderazgos" element={<Liderazgos />} />
          <Route path="/liderazgos/presentacion" element={<LiderazgosPresentation />} />
          
          <Route path="/liderazgos/perfil/:id" element={<ParticipantProfile />} />
          <Route path="/kit/marca-personal" element={<KitMarcaPersonal />} />
          <Route path="/kit/marca-personal/perfil/:id" element={<BrandKitProfile />} />
          <Route path="/kit/pyme" element={<KitPyme />} />
          <Route path="/kit/pyme/perfil/:id" element={<BrandKitProfile />} />
          <Route path="/membresia" element={<Membership />} />
          <Route path="/trivia" element={<BrandTrivia />} />
          <Route path="/simulador" element={<SocialSimulator />} />
          <Route path="/arcade" element={<BrandPuzzle />} />
          <Route path="/admin/liderazgos" element={<AdminLiderazgos />} />
          <Route path="/admin/operaciones/login" element={<OperationsLogin />} />
          <Route path="/admin/operaciones" element={<OperationsDashboard />} />
          <Route path="/tools" element={<Tools />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
