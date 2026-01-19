import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import NewRequest from "./pages/NewRequest";
import TrackRequest from "./pages/TrackRequest";
import MyRequests from "./pages/MyRequests";
import EditRequest from "./pages/EditRequest";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardRequests from "./pages/dashboard/DashboardRequests";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import NewsManagement from "./pages/dashboard/NewsManagement";
import TeamManagement from "./pages/dashboard/TeamManagement";
import Settings from "./pages/dashboard/Settings";
import AboutCandidate from "./pages/AboutCandidate";
import CandidateManagement from "./pages/dashboard/CandidateManagement";
import Profile from "./pages/Profile";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/about-candidate" element={<AboutCandidate />} />
              <Route path="/login" element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } />
              <Route path="/register" element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Citizen Protected Routes */}
              <Route path="/requests/new" element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <NewRequest />
                </ProtectedRoute>
              } />
              <Route path="/track-request" element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <TrackRequest />
                </ProtectedRoute>
              } />
              <Route path="/requests" element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <MyRequests />
                </ProtectedRoute>
              } />
              <Route path="/requests/edit/:id" element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <EditRequest />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={["citizen", "staff", "candidate", "admin"]}>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Staff/Admin Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={["staff", "candidate", "admin"]}>
                  <DashboardHome />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/requests" element={
                <ProtectedRoute allowedRoles={["staff", "candidate", "admin"]}>
                  <DashboardRequests />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/analytics" element={
                <ProtectedRoute allowedRoles={["candidate", "admin"]}>
                  <DashboardAnalytics />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/news" element={
                <ProtectedRoute allowedRoles={["staff", "candidate", "admin"]}>
                  <NewsManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TeamManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute allowedRoles={["staff", "candidate", "admin"]}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/candidate" element={
                <ProtectedRoute allowedRoles={["candidate", "admin"]}>
                  <CandidateManagement />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
