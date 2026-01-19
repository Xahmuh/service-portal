import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("كلمات المرور غير متطابقة");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast.success("تم تغيير كلمة المرور بنجاح");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ أثناء تغيير كلمة المرور");
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

                    {isSuccess ? (
                        <div className="text-center space-y-8 animate-fade-in relative z-10">
                            <div className="relative mb-6 group inline-block mx-auto">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-20 blur transition duration-500" />
                                <div className="relative w-24 h-24 rounded-3xl bg-background flex items-center justify-center shadow-xl border border-white/50">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500 drop-shadow-sm" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-3xl font-black text-[#002B49] tracking-tight">تم بنجاح!</h1>
                                <p className="text-muted-foreground leading-relaxed font-medium">
                                    تم تغيير كلمة المرور الخاصة بك بنجاح. <br />
                                    سيتم توجيهك لصفحة تسجيل الدخول تلقائياً خلال لحظات...
                                </p>
                            </div>

                            <Button asChild className="w-full h-14 rounded-2xl bg-gradient-to-l from-[#002B49] to-[#004d80] hover:from-[#003d66] hover:to-[#005a96] text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                <Link to="/login">الذهاب لتسجيل الدخول الآن</Link>
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
                                    كلمة مرور جديدة
                                </h1>
                                <p className="text-muted-foreground text-center text-sm font-medium">
                                    الرجاء إدخال كلمة المرور الجديدة لحسابك لضمان أمان بياناتك
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <Label htmlFor="pass" className="text-sm font-bold text-right block pr-1 text-[#002B49]">
                                        كلمة المرور الجديدة
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="pass"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-14 pr-4 pl-12 text-right rounded-2xl bg-muted/30 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all group-hover:border-primary/30"
                                            required
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm" className="text-sm font-bold text-right block pr-1 text-[#002B49]">
                                        تأكيد كلمة المرور
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-14 pr-4 pl-12 text-right rounded-2xl bg-muted/30 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all group-hover:border-primary/30"
                                            required
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                                            جاري التحديث...
                                        </span>
                                    ) : (
                                        "تغيير كلمة المرور"
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>

                <div className="text-center mt-8 relative z-10">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#002B49] font-bold transition-all group"
                    >
                        <span>العودة لتسجيل الدخول</span>
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
