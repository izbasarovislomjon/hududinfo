import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import Feedbacks from "./pages/Feedbacks";
import Statistics from "./pages/Statistics";
import PriorityRanking from "./pages/PriorityRanking";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import MyFeedbacks from "./pages/MyFeedbacks";
import ObjectDetail from "./pages/ObjectDetail";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import Games from "./pages/Games";
import Budget from "./pages/Budget";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFeedbacks from "./pages/admin/AdminFeedbacks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminObjects from "./pages/admin/AdminObjects";
import AdminStatistics from "./pages/admin/AdminStatistics";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    // Check if user has visited before in this session
    const visited = sessionStorage.getItem("hududinfo_visited");
    if (visited) {
      setShowSplash(false);
      setHasVisited(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("hududinfo_visited", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && !hasVisited && (
            <SplashScreen onComplete={handleSplashComplete} />
          )}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/feedbacks" element={<Feedbacks />} />
              <Route path="/my-feedbacks" element={<MyFeedbacks />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/priority" element={<PriorityRanking />} />
              <Route path="/object/:id" element={<ObjectDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/games" element={<Games />} />
              <Route path="/budget" element={<Budget />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/objects" element={<AdminObjects />} />
              <Route path="/admin/statistics" element={<AdminStatistics />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
