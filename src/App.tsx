import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TransmissionAccess from "./pages/TransmissionAccess";
import SupabaseAuth from "./pages/SupabaseAuth";
import PatientProfile from "./pages/PatientProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TenantProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/supabase" element={<SupabaseAuth />} />
              <Route path="/transmission" element={<TransmissionAccess />} />
              <Route path="/patient" element={<PatientProfile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
