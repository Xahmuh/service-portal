import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, ShieldCheck, Key, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { signIn, signInWithGoogle, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (userRole) {
      const from = (location.state as any)?.from?.pathname ||
        (userRole.role === "citizen" ? "/" : "/dashboard");
      navigate(from, { replace: true });
    }
  }, [userRole, navigate, location]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#002B49]/5 to-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#002B49]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-[#002B49]/10 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,43,73,0.08)] relative mx-auto">
          {/* Top Visual Area (Abstract Gradient) */}
          <div className="h-3 sm:h-4 bg-gradient-to-r from-[#002B49] via-[#003d6d] to-[#002B49] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,rgba(212,175,55,0.4)_1px,transparent_0)] bg-[size:10px_10px]" />
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col items-center mb-8 sm:mb-10">
              <div className="relative mb-4 sm:mb-6 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[#D4AF37] rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[#002B49]/10 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="h-8 w-8 sm:h-10 text-[#002B49]" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#002B49] text-center mb-2 tracking-tight">
                بوابة الدخول
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center font-bold uppercase tracking-widest opacity-60">
                الحوكمة الرقمية الموحدة
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[10px] sm:text-xs font-black text-right block pr-1 text-[#002B49]/60 uppercase tracking-wider">
                  البريد الإلكتروني أو الرقم القومي
                </Label>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="name@example.com"
                    className="h-12 sm:h-14 pr-4 pl-12 text-right rounded-xl bg-[#002B49]/5 border-[#002B49]/10 focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all text-sm sm:text-base"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    dir="ltr"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#002B49]/30 group-focus-within:text-[#D4AF37] transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center mb-1 px-1">
                  <Link
                    to="/forgot-password"
                    className="text-[10px] sm:text-xs text-[#D4AF37] font-black hover:underline transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                  <Label className="text-[10px] sm:text-xs font-black text-right block text-[#002B49]/60 uppercase tracking-wider">
                    كلمة المرور
                  </Label>
                </div>
                <div className="relative group">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 sm:h-14 pr-4 pl-12 text-right rounded-xl bg-[#002B49]/5 border-[#002B49]/10 focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all text-sm sm:text-base"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#002B49]/30 group-focus-within:text-[#D4AF37] transition-colors" />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 sm:h-14 rounded-xl bg-[#002B49] hover:bg-[#003d6d] text-white font-black text-base sm:text-lg shadow-xl shadow-[#002B49]/20 transition-all active:scale-[0.98] mt-2 sm:mt-4"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري التحقق...
                  </span>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>

            <div className="space-y-4 mt-8">
              <div className="relative flex items-center gap-3">
                <div className="h-px bg-[#002B49]/5 flex-1" />
                <span className="text-[10px] font-black uppercase text-[#002B49]/30 px-2 tracking-widest">أو التابع لـ</span>
                <div className="h-px bg-[#002B49]/5 flex-1" />
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-14 rounded-xl border-2 border-[#002B49]/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 text-base font-bold flex items-center justify-center gap-3"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#002B49]" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-[#002B49]">متابعة بواسطة Google</span>
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-[#002B49]/5 text-center">
              <p className="text-sm text-[#002B49]/60 font-bold">
                ليس لديك حساب؟{" "}
                <Link to="/register" className="text-[#D4AF37] hover:underline">
                  أنشئ حسابك الآن
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#002B49]/40 hover:text-[#002B49] font-black text-sm uppercase tracking-widest transition-all group"
          >
            <span>العودة للرئيسية</span>
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
