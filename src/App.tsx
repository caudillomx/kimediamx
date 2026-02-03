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
import NotFound from "./pages/NotFound";

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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
