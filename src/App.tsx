
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ModuleProvider } from "@/contexts/ModuleContext";
import { TenantProvider } from "@/contexts/TenantContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TransmissionAccess from "./pages/TransmissionAccess";
import SupabaseAuth from "./pages/SupabaseAuth";
import PatientProfile from "./pages/PatientProfile";
import ClaimPatient from "./pages/ClaimPatient";
import AppDownload from "./pages/AppDownload";

const queryClient = new QueryClient();

import { QRDisplayProvider } from '@/contexts/QRDisplayContext';
import MainLayout from './components/layout/MainLayout';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <TenantProvider>
          <ModuleProvider>
            <QRDisplayProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/supabase" element={<SupabaseAuth />} />
                  <Route path="/transmission" element={<TransmissionAccess />} />
                  <Route path="/patient" element={<PatientProfile />} />
                  <Route path="/claim" element={<ClaimPatient />} />
                  <Route path="/download" element={<AppDownload />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </QRDisplayProvider>
          </ModuleProvider>
        </TenantProvider>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
