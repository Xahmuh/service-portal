import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Pin, ChevronLeft, Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: string;
  is_pinned: boolean;
  is_urgent: boolean;
  published_at: string;
  created_at: string;
}

const NewsTypes: Record<string, { label: string; class: string }> = {
  statement: { label: "بيان رسمي", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  service_update: { label: "تحديث خدمة", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  achievement: { label: "إنجاز", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  event: { label: "فعالية", class: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  alert: { label: "تنبيه هام", class: "bg-red-500/10 text-red-600 border-red-500/20" },
  awareness: { label: "توعية", class: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
};

export function NewsPreviewSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (news.length === 0) return null;

  return (
    <section className="pt-12 pb-24 bg-muted/20 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#002B49 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="container relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-16 text-center lg:text-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold tracking-wide uppercase mx-auto lg:mx-0">
              <Newspaper className="h-4 w-4" />
              أخبار وإنجازات الدائرة
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#002B49] tracking-tight">
              كن على اطلاع دائم
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-medium">
              نشارككم آخر التطورات والمشاريع التي تهدف إلى الارتقاء بمستوى الخدمات في دائرتنا.
            </p>
          </div>
          <Button variant="outline" className="mx-auto lg:mx-0 rounded-2xl h-14 px-8 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-bold group" asChild>
            <Link to="/news">
              جميع الأخبار
              <ChevronLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
          }}
          className="w-full relative px-0 md:px-12"
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {news.map((item) => (
              <CarouselItem key={item.id} className="pl-4 md:pl-8 md:basis-1/2 lg:basis-1/3">
                <NewsCard item={item} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex justify-center gap-4 mt-12">
            <CarouselPrevious className="static translate-y-0 h-12 w-12 border-primary/20 hover:bg-primary hover:text-white transition-all" />
            <CarouselNext className="static translate-y-0 h-12 w-12 border-primary/20 hover:bg-primary hover:text-white transition-all" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const typeStyle = NewsTypes[item.type] || { label: "خبر", class: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
  const dateStr = item.published_at || item.created_at;

  return (
    <article
      className="group relative flex flex-col h-full bg-white border border-[#002B49]/10 rounded-[1.5rem] overflow-hidden hover:border-[#D4AF37] transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,43,73,0.08)]"
    >
      {/* Top Visual Area */}
      <div className="h-4 bg-gradient-to-r from-[#002B49] via-[#003d6d] to-[#002B49] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,rgba(212,175,55,0.4)_1px,transparent_0)] bg-[size:10px_10px]" />
      </div>

      <div className="p-8 md:p-10 flex-1 flex flex-col">
        {/* Header: Date & Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[#002B49]/40 uppercase">
            <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
            {new Date(dateStr).toLocaleDateString("ar-EG", { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
          <Badge variant="outline" className={`${typeStyle.class} font-bold px-3 py-1 rounded-md border-2 border-inherit text-[11px]`}>
            {typeStyle.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-4 flex-1">
          <h3 className="text-2xl font-black text-[#002B49] leading-[1.3] group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[#002B49]/60 font-medium leading-[1.8] line-clamp-3 text-base">
            {item.content}
          </p>
        </div>

        {/* Action Footer */}
        <div className="mt-10 pt-8 border-t border-[#002B49]/5 flex items-center justify-between group/footer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#002B49]/5 flex items-center justify-center">
              <Newspaper className="h-4 w-4 text-[#002B49]/40" />
            </div>
            <span className="text-sm font-bold text-[#002B49]/40">المكتب الإعلامي</span>
          </div>

          <Link
            to={`/news/${item.id}`}
            className="flex items-center gap-2 text-[#002B49] font-black text-sm group-hover/footer:text-[#D4AF37] transition-colors cursor-pointer"
          >
            <span>التفاصيل</span>
            <div className="w-8 h-8 rounded-full border-2 border-[#002B49]/10 flex items-center justify-center group-hover/footer:border-[#D4AF37] group-hover/footer:bg-[#D4AF37] group-hover/footer:text-[#002B49] transition-all duration-300">
              <ArrowLeft className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Modern Accent Flap */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none" />
      {(item.is_pinned || item.is_urgent) && (
        <div className={cn(
          "absolute top-8 left-0 -translate-x-1 px-3 py-1 text-[10px] font-black rounded-r-md shadow-lg flex items-center gap-2",
          item.is_urgent ? "bg-red-600 text-white" : "bg-[#D4AF37] text-[#002B49]"
        )}>
          <Pin className="w-3 h-3" />
          {item.is_urgent ? "خبر عاجل" : "هام جداً"}
        </div>
      )}
    </article>
  );
}
