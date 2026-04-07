import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/Upload";
import HistoryPage from "./pages/History";
import CreditsPage from "./pages/Credits";
import LeaderboardPage from "./pages/Leaderboard";
import ImpactPage from "./pages/Impact";
import MarketplacePage from "./pages/Marketplace";
import PurchasesPage from "./pages/Purchases";
import ProfilePage from "./pages/Profile";
import ESGDashboard from "./pages/ESGDashboard";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";
import ESGDashboard from "./pages/ESGDashboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RootRedirect = () => {
  const user = localStorage.getItem("user");
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/esg" element={<ESGDashboard />} />
          </Route>
          
          <Route path="/verify/:imageHash" element={<Verify />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
