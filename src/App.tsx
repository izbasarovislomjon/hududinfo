import { useState, useEffect } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SplashScreen } from "@/components/SplashScreen";
import { Chatbot } from "@/components/Chatbot";
import Index from "./pages/Index";
import Feedbacks from "./pages/Feedbacks";
import FeedbackDetail from "./pages/FeedbackDetail";
import Statistics from "./pages/Statistics";
import PriorityRanking from "./pages/PriorityRanking";
import Profile from "./pages/Profile";
import ObjectDetail from "./pages/ObjectDetail";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import SubmitReport from "./pages/SubmitReport";
import Budget from "./pages/Budget";
import Checklist from "./pages/Checklist";
import Leaderboard from "./pages/Leaderboard";
import MyFeedbacks from "./pages/MyFeedbacks";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFeedbacks from "./pages/admin/AdminFeedbacks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminObjects from "./pages/admin/AdminObjects";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminNews from "./pages/admin/AdminNews";
import AdminBudget from "./pages/admin/AdminBudget";

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
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <NotificationsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                {showSplash && !hasVisited && (
                  <SplashScreen onComplete={handleSplashComplete} />
                )}
                <BottomNav />
                <Chatbot />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/feedbacks" element={<Feedbacks />} />
                  <Route path="/feedbacks/:id" element={<FeedbackDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/priority" element={<PriorityRanking />} />
                  <Route path="/object/:id" element={<ObjectDetail />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/submit" element={<SubmitReport />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/my-feedbacks" element={<MyFeedbacks />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/objects" element={<AdminObjects />} />
                  <Route path="/admin/news" element={<AdminNews />} />
                  <Route path="/admin/budget" element={<AdminBudget />} />
                  <Route path="/admin/statistics" element={<AdminStatistics />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </NotificationsProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
