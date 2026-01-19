import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

const ForgotPassword = () => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await resetPassword(email);
            setIsSent(true);
        } catch (error) {
            // Error is handled in useAuth
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#002B49]/5 to-background relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#002B49]/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-card/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden p-8 sm:p-12 relative z-10 transition-all hover:shadow-3xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] -z-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-tr-[4rem] -z-10" />

                    {isSent ? (
                        <div className="text-center space-y-8 animate-fade-in relative z-10">
                            <div className="relative mb-6 group inline-block mx-auto">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-20 blur transition duration-500" />
                                <div className="relative w-24 h-24 rounded-3xl bg-background flex items-center justify-center shadow-xl border border-white/50">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500 drop-shadow-sm" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-3xl font-black text-[#002B49] tracking-tight">تحقق من بريدك</h1>
                                <p className="text-muted-foreground leading-relaxed font-medium">
                                    تم إرسال رابط استعادة كلمة المرور إلى <br />
                                    <span className="text-[#002B49] font-bold">{email}</span>
                                    <br />يرجى مراجعة بريدك الإلكتروني واتباع التعليمات.
                                </p>
                            </div>

                            <Button asChild className="w-full h-14 rounded-2xl bg-gradient-to-l from-[#002B49] to-[#004d80] hover:from-[#003d66] hover:to-[#005a96] text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                <Link to="/login">العودة لتسجيل الدخول</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center mb-10 relative z-10">
                                <div className="relative mb-6 group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[#D4AF37] rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
                                    <div className="relative w-24 h-24 rounded-3xl bg-background flex items-center justify-center shadow-xl border border-white/50">
                                        <ShieldCheck className="h-12 w-12 text-[#002B49] drop-shadow-sm" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-black text-[#002B49] text-center mb-3 tracking-tight">
                                    استعادة الحساب
                                </h1>
                                <p className="text-muted-foreground text-center text-sm font-medium">
                                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة حسابك
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-right block pr-1 text-[#002B49]">
                                        البريد الإلكتروني
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 pr-4 pl-12 text-right rounded-2xl bg-muted/30 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all group-hover:border-primary/30"
                                            required
                                            dir="ltr"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-l from-[#002B49] to-[#004d80] hover:from-[#003d66] hover:to-[#005a96] text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            جاري الإرسال...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            إرسال رابط الاستعادة
                                            <ArrowLeft className="h-5 w-5" />
                                        </span>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-border/40 text-center relative z-10">
                                <p className="text-sm text-muted-foreground font-medium">
                                    تذكرت كلمة المرور؟{" "}
                                    <Link to="/login" className="text-primary font-bold hover:underline">
                                        تسجيل الدخول
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="text-center mt-8 relative z-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#002B49] font-bold transition-all group"
                    >
                        <span>العودة للرئيسية</span>
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
