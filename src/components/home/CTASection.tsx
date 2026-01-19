import { ArrowLeft, Phone, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";

export function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container relative">
        <div className="relative rounded-[3.5rem] overflow-hidden bg-[#002B49] border border-white/10 shadow-3xl group">
          {/* Advanced Background Pattern */}
          <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(212,175,55,0.18)_0%,_transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(0,77,128,0.4)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          <div className="relative p-10 md:p-20 lg:p-24 overflow-hidden">
            {/* Decorative Light Streak */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[120%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center text-white space-y-10 relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in group/badge cursor-default">
                <ShieldCheck className="h-5 w-5 text-[#D4AF37] group-hover/badge:scale-110 transition-transform" />
                <span className="text-sm font-black tracking-widest uppercase opacity-90">صياغة إنسانية موجهة للمواطن</span>
                <Sparkles className="h-4 w-4 text-[#D4AF37] opacity-50" />
              </div>

              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.4] tracking-tight">
                  حوّل طلبك إلى<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4CF67] to-[#D4AF37] animate-shimmer bg-[length:200%_auto]">
                    خدمات رقمية فورية
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-medium leading-[1.8]">
                  خطوتك أسهل… وصوتك مسموع<br />
                  قدّم طلبك أو شكواك أونلاين<br />
                  وتابعها بدون أوراق، بدون تعب، وبدون تضييع وقت.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#E5BF48] hover:to-[#D4AF37] text-[#002B49] h-16 px-12 rounded-[1.25rem] text-xl font-black shadow-2xl shadow-gold/30 transition-all hover:scale-105 active:scale-95 group/btn"
                >
                  أنشئ حسابك الآن
                  <ArrowLeft className="h-6 w-6 mr-3 group-hover/btn:-translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-12 rounded-[1.25rem] text-xl font-bold border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-xl transition-all hover:border-white/40"
                >
                  <MessageCircle className="h-6 w-6 ml-3 opacity-70" />
                  تواصل مع الدعم
                </Button>
              </div>

              <div className="pt-8 flex items-center justify-center gap-8 text-white/40 font-bold text-sm tracking-widest uppercase overflow-hidden whitespace-nowrap">
                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-gold" /> توفير الوقت</span>
                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-gold" /> أمان مطلق</span>
                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-gold" /> متاح 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

