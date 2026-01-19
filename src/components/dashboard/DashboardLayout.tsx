import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
  BarChart3,
  Bell,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
  { name: "الطلبات", href: "/dashboard/requests", icon: FileText },
  { name: "الأخبار", href: "/dashboard/news", icon: Newspaper },
  { name: "التحليلات", href: "/dashboard/analytics", icon: BarChart3 },
];

const teamNavigation = [
  { name: "فريق العمل", href: "/dashboard/team", icon: Users },
  { name: "الإعدادات", href: "/dashboard/settings", icon: Settings },
];

const candidateNavigation = [
  { name: "صفحة المرشح", href: "/dashboard/candidate", icon: User },
];

const adminNavigation = [
  { name: "السجل الرقابي", href: "/dashboard/audit", icon: BarChart3 }, // Assuming an audit trail page
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, userRole, signOut, isAdmin, isStaffOrCandidate } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Define navigation based on role
  const allNavigation = [...navigation];

  if (isStaffOrCandidate) {
    allNavigation.push(...teamNavigation);
  }

  if (isAdmin || userRole?.role === "candidate") {
    allNavigation.push(...candidateNavigation);
  }

  if (isAdmin) {
    allNavigation.push(...adminNavigation);
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "المسؤول";
      case "candidate":
        return "المرشح";
      case "staff":
        return "فريق الحملة";
      default:
        return "مواطن";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col bg-[#002B49] border-l border-white/5 shadow-2xl">
          {/* Logo */}
          <div className="flex h-24 items-center justify-between px-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold shadow-lg shadow-gold/20">
                <span className="text-xl font-bold text-white">م</span>
              </div>
              <div>
                <p className="text-lg font-bold text-white tracking-tight">نظام تواصل</p>
                <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">المركز الرقمي</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-1.5">
              <p className="px-4 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">القائمة الرئيسية</p>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 group",
                      isActive
                        ? "bg-gold text-white shadow-lg shadow-gold/20 translate-x-1"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {isStaffOrCandidate && (
              <div className="space-y-1.5 pt-4">
                <p className="px-4 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">الإدارة والتحكم</p>
                {teamNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 group",
                        isActive
                          ? "bg-gold text-white shadow-lg shadow-gold/20"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {(isAdmin || userRole?.role === "candidate") && (
              <div className="space-y-1.5 pt-4">
                <p className="px-4 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">بيانات المرشح</p>
                {candidateNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 group",
                        isActive
                          ? "bg-gold text-white shadow-lg shadow-gold/20"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User section */}
          <div className="p-6 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center">
                <span className="text-sm font-bold text-gold">
                  {profile?.name?.charAt(0) || "م"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {profile?.name || "مستخدم"}
                </p>
                <p className="text-[11px] text-white/40 truncate mt-0.5">
                  {getRoleLabel(userRole?.role || "citizen")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 rounded-xl text-white/60 hover:bg-white/5 hover:text-white justify-center"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 ml-2" />
                الرئيسية
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 rounded-xl text-white/60 hover:bg-white/5 hover:text-white justify-center"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:mr-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-24 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-1">لوحة الإدارة</p>
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  {allNavigation.find((n) => n.href === location.pathname)?.name || "الرئيسية"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="hidden sm:flex items-center gap-3 pr-3 border-r border-border">
                <div className="text-left">
                  <p className="text-sm font-medium">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(userRole?.role || "citizen")}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {profile?.name?.charAt(0) || "م"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
