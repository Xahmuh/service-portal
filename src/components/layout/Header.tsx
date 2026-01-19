import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, FileText, Newspaper, Home, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Search } from "lucide-react";

interface HeaderProps {
  onRegisterClick?: () => void;
}

const navigation = [
  { name: "الرئيسية", href: "/", icon: Home },
  { name: "تقديم طلب", href: "/requests/new", icon: FileText },
  { name: "تتبع طلب", href: "/track-request", icon: Search },
  { name: "عن النائب", href: "/about-candidate", icon: User },
  { name: "أخبار الدائرة", href: "/news", icon: Newspaper },
];

export function Header({ onRegisterClick }: HeaderProps) {
  const { user, profile, userRole, isStaffOrCandidate, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg group-hover:rotate-6 transition-all duration-300">
            <FileText className="h-7 w-7" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-black text-[#002B49] tracking-tight">منصة أهالي المنصورة</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">البوابة الرقمية الرسمية</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation
            .filter((item) => {
              // Public pages for everyone
              if (item.href === "/" || item.href === "/about-candidate" || item.href === "/news") return true;
              // Auth required pages
              if (!user) return false;
              if (userRole?.role === "citizen") return true;
              return false; // Staff/Admin see main links + dashboard button
            })
            .map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isStaffOrCandidate && (
                <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl h-10 px-4" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 ml-2" />
                    لوحة التحكم
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {profile?.name?.charAt(0) || "م"}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{profile?.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/requests" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      طلباتي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:flex rounded-xl h-10" asChild>
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
              <Button size="sm" className="hidden sm:flex btn-primary-gradient rounded-xl h-10 px-5" asChild>
                <Link to="/register">إنشاء حساب</Link>
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 space-y-1">
            {navigation
              .filter((item) => {
                if (item.href === "/" || item.href === "/about-candidate" || item.href === "/news") return true;
                if (!user) return false;
                if (userRole?.role === "citizen") return true;
                return false;
              })
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            <div className="border-t border-border pt-4 mt-4 space-y-2">
              {user ? (
                <>
                  {isStaffOrCandidate && (
                    <Button variant="outline" className="w-full justify-center rounded-xl" asChild>
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 ml-2" />
                        لوحة التحكم
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full justify-center rounded-xl" asChild>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 ml-2" />
                      الملف الشخصي
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-center rounded-xl" asChild>
                    <Link to="/requests" onClick={() => setMobileMenuOpen(false)}>
                      <FileText className="h-4 w-4 ml-2" />
                      طلباتي
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-center rounded-xl font-bold text-destructive focus:text-destructive" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-center rounded-xl" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      تسجيل الدخول
                    </Link>
                  </Button>
                  <Button className="w-full justify-center btn-primary-gradient rounded-xl" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      إنشاء حساب
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
