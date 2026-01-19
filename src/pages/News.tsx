import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Pin, Search, Filter, Loader2, Newspaper, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: string;
  is_pinned: boolean;
  is_urgent: boolean;
  published_at: string;
  created_at: string;
  status: string;
}

const NewsTypes: Record<string, { label: string; class: string }> = {
  statement: { label: "بيان رسمي", class: "bg-blue-50 text-blue-700 border-blue-200" },
  service_update: { label: "تحديث خدمة", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  achievement: { label: "إنجاز", class: "bg-amber-50 text-amber-700 border-amber-200" },
  event: { label: "فعالية", class: "bg-purple-50 text-purple-700 border-purple-200" },
  alert: { label: "تنبيه هام", class: "bg-red-50 text-red-700 border-red-200" },
  awareness: { label: "توعية", class: "bg-cyan-50 text-cyan-700 border-cyan-200" },
};

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      {/* Header - SaaS Governmental Style */}
      <HeroSection
        badge="المركز الإعلامي"
        title="أخبار وإنجازات الدائرة"
        description="تابع التغطية الشاملة لآخر المستجدات، البيانات الصحفية، والفعاليات الرسمية أولاً بأول."
        showSearch={false}
      />

      {/* Search & Filter - Sticky Style */}
      <section className="sticky top-20 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="ابحث في الأخبار والبيانات الرسمية..."
                className="pr-12 h-12 rounded-2xl border-slate-200 bg-white shadow-inner focus:ring-gold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-bold gap-2 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
              تصفية النتائج
            </Button>
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-gold" />
              <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">جاري تحديث البيانات...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-300">
              <Newspaper className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">لا توجد نتائج بحث</h3>
              <p className="text-slate-500 mt-2">جرب البحث بكلمات مختلفة أو عد لاحقاً لمتابعة الجديد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item, index) => {
                const typeStyle = NewsTypes[item.type] || { label: "خبر", class: "bg-slate-100 text-slate-700 border-slate-200" };
                const dateStr = item.published_at || item.created_at;

                return (
                  <Card
                    key={item.id}
                    className={`group relative overflow-hidden rounded-3xl border-slate-200 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-500 animate-slide-up flex flex-col ${item.is_urgent ? "border-r-4 border-r-red-600" : ""
                      }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="outline" className={`${typeStyle.class} font-bold px-3 py-1 rounded-md border-2 border-inherit text-[10px] uppercase`}>
                          {typeStyle.label}
                        </Badge>
                        {item.is_pinned && (
                          <Badge className="bg-gold text-[#002B49] font-black px-3 py-1 rounded-md flex items-center gap-1 shadow-sm text-[10px]">
                            <Pin className="h-3 w-3" />
                            هام
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3 flex-1">
                        <h2 className="text-xl font-black text-[#002B49] leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-3">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-gold" />
                          <span>{format(new Date(dateStr), "d MMMM yyyy", { locale: ar })}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-slate-50 text-slate-400 hover:bg-gold hover:text-[#002B49] transition-all">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default News;
