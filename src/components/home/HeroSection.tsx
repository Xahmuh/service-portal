import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, ArrowLeft, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title?: React.ReactNode;
  description?: string;
  badge?: string;
  showSearch?: boolean;
  showRegisterButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function HeroSection({
  title = (
    <>
      منصة رقمية<br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4CF67] to-[#D4AF37] animate-shimmer bg-[length:200%_auto]">
        لخدمة أهالي المنصورة
      </span>
    </>
  ),
  description = "منصة النائب نبيل أبو وردة للتواصل المباشر، تقديم طلبات الخدمات، ومتابعة قضايا الدائرة بشفافية وكفاءة رقمية عالية.",
  badge = "المنصة الرقمية لخدمة أهالي دائرة المنصورة",
  showSearch = true,
  showRegisterButton = false,
  children,
  className
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/news?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className={cn("relative overflow-hidden min-h-[60vh] flex items-center bg-[#002B49] selection:bg-primary/30", className, showSearch && "min-h-[90vh]")}>
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Government Platform Background"
          className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#002B49] via-[#002B49]/95 to-[#002B49]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#002B49]/50" />
      </div>

      {/* Floating Blobs */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container relative py-20 md:py-32">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto w-full">
          <div className="text-white space-y-8 md:space-y-12 w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-fade-in group hover:bg-white/10 transition-all cursor-default w-fit mx-auto">
              <ShieldCheck className="h-5 w-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span className="text-xs md:text-sm font-bold tracking-wide uppercase opacity-90">{badge}</span>
            </div>

            {/* Title & Description */}
            <div className="space-y-8 animate-slide-up">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black leading-[1.3] tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-lg md:text-2xl text-white/70 leading-[1.8] max-w-3xl font-medium mx-auto px-4">
                  {description}
                </p>
              )}
            </div>

            {/* Search Section */}
            {showSearch && (
              <form onSubmit={handleSearch} className="relative w-full max-w-3xl animate-slide-up mx-auto px-4" style={{ animationDelay: "0.1s" }}>
                <div className="relative group overflow-hidden rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all hover:bg-white/15 hover:border-white/30">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="عن ماذا تبحث اليوم؟"
                    className="h-16 md:h-20 w-full bg-transparent border-none text-white placeholder:text-white/40 pr-14 pl-10 md:pl-44 text-base md:text-xl font-bold focus-visible:ring-0 text-right"
                    dir="rtl"
                  />
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  <div className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2">
                    <Button type="submit" className="h-[60px] px-8 rounded-[1.8rem] bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#E5BF48] hover:to-[#D4AF37] text-[#002B49] font-black text-lg border-none transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gold/20 flex items-center gap-3 group/btn">
                      <span>بحث سريع</span>
                      <Search className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Button */}
                <div className="md:hidden mt-4">
                  <Button type="submit" className="w-full h-14 rounded-2xl bg-[#D4AF37] text-[#002B49] font-black text-lg shadow-xl shadow-gold/20 flex items-center justify-center gap-2">
                    <span>بحث سريع</span>
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            )}

            {/* CTA Register Button */}
            {showRegisterButton && (
              <div className="flex flex-col sm:flex-row gap-5 animate-slide-up justify-center pt-4" style={{ animationDelay: "0.2s" }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="text-lg font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 h-16 px-10 rounded-2xl backdrop-blur-xl transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-3 mx-auto"
                >
                  <Globe className="h-6 w-6 opacity-70" />
                  إنشاء حساب جديد
                  <ArrowLeft className="h-5 w-5 mr-auto md:mr-3" />
                </Button>
              </div>
            )}

            {/* Custom Children Content */}
            {children && (
              <div className="animate-slide-up w-full flex justify-center" style={{ animationDelay: "0.2s" }}>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
