import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Pin,
  Search,
  Filter as FilterIcon,
  Loader2,
  Newspaper,
  ArrowLeft,
  ChevronDown,
  X,
  ArrowUpDown,
  CalendarDays
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, setYear, setMonth } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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

const ITEMS_PER_PAGE = 12;

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Date Filters
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("news")
        .select("*", { count: "exact" })
        .eq("status", "published");

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Handle Year/Month Filter
      if (selectedYear !== "all") {
        let start = new Date(parseInt(selectedYear), 0, 1);
        let end = new Date(parseInt(selectedYear), 11, 31, 23, 59, 59);

        if (selectedMonth !== "all") {
          const monthIdx = parseInt(selectedMonth) - 1;
          start = startOfMonth(setMonth(setYear(new Date(), parseInt(selectedYear)), monthIdx));
          end = endOfMonth(setMonth(setYear(new Date(), parseInt(selectedYear)), monthIdx));
          end.setHours(23, 59, 59);
        }

        query = query.gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
      }

      // Date Range Filter (Overrides month/year if both are used, but typically user picks one)
      if (fromDate) {
        query = query.gte("created_at", fromDate.toISOString());
      }
      if (toDate) {
        const endDay = new Date(toDate);
        endDay.setHours(23, 59, 59);
        query = query.lte("created_at", endDay.toISOString());
      }

      // Order: Pinned first, then sorted by date
      query = query.order("is_pinned", { ascending: false });
      query = query.order("created_at", { ascending: sortOrder === "asc" });

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setNews(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOrder, currentPage, fromDate, toDate, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const resetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedMonth("all");
    setSelectedYear(new Date().getFullYear().toString());
    setSearchQuery("");
    setCurrentPage(1);
  };

  const months = [
    { value: "1", label: "يناير" },
    { value: "2", label: "فبراير" },
    { value: "3", label: "مارس" },
    { value: "4", label: "أبريل" },
    { value: "5", label: "مايو" },
    { value: "6", label: "يونيو" },
    { value: "7", label: "يوليو" },
    { value: "8", label: "أغسطس" },
    { value: "9", label: "سبتمبر" },
    { value: "10", label: "أكتوبر" },
    { value: "11", label: "نوفمبر" },
    { value: "12", label: "ديسمبر" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <MainLayout>
      {/* Header - SaaS Governmental Style */}
      <HeroSection
        badge="المركز الإعلامي"
        title="أخبار وإنجازات الدائرة"
        description="تابع التغطية الشاملة لآخر المستجدات، البيانات الصحفية، والفعاليات الرسمية أولاً بأول."
        showSearch={false}
      />

      {/* Search & Filter - Enhanced */}
      <section className="sticky top-20 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="container py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-gold transition-colors" />
                <Input
                  placeholder="ابحث في الأخبار والبيانات الرسمية..."
                  className="pr-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-gold focus:border-gold transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  className={cn(
                    "h-12 px-6 rounded-2xl font-bold gap-2 transition-all",
                    showFilters ? "bg-[#002B49] text-white" : "border-slate-200 hover:bg-slate-50"
                  )}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FilterIcon className="h-4 w-4" />
                  خيارات التصفية
                  {(fromDate || toDate || selectedMonth !== "all") && (
                    <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
                  )}
                </Button>

                <Select value={sortOrder} onValueChange={(v: "asc" | "desc") => setSortOrder(v)}>
                  <SelectTrigger className="h-12 w-[160px] rounded-2xl border-slate-200 bg-white font-bold">
                    <ArrowUpDown className="h-4 w-4 ml-2 text-slate-400" />
                    <SelectValue placeholder="الترتيب" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="desc">الأحدث أولاً</SelectItem>
                    <SelectItem value="asc">الأقدم أولاً</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Period Filter */}
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-xs font-black text-[#002B49] uppercase tracking-wider mr-1">الفترة الزمنية</label>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 h-11 justify-start text-right font-medium rounded-xl border-slate-200 bg-white",
                              !fromDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="ml-2 h-4 w-4 text-gold" />
                            {fromDate ? format(fromDate, "dd/MM/yyyy") : "من تاريخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) => {
                              setFromDate(date);
                              setCurrentPage(1);
                            }}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>

                      <span className="text-slate-300">-</span>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 h-11 justify-start text-right font-medium rounded-xl border-slate-200 bg-white",
                              !toDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="ml-2 h-4 w-4 text-gold" />
                            {toDate ? format(toDate, "dd/MM/yyyy") : "إلى تاريخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={toDate}
                            onSelect={(date) => {
                              setToDate(date);
                              setCurrentPage(1);
                            }}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Month Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#002B49] uppercase tracking-wider mr-1">بالشهر</label>
                    <Select value={selectedMonth} onValueChange={(v) => {
                      setSelectedMonth(v);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white font-medium">
                        <SelectValue placeholder="اختر الشهر" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">جميع الشهور</SelectItem>
                        {months.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black text-[#002B49] uppercase tracking-wider mr-1">بالسنة</label>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-2 rounded-lg" onClick={resetFilters}>
                        <X className="h-3 w-3 ml-1" />
                        إعادة تعيين
                      </Button>
                    </div>
                    <Select value={selectedYear} onValueChange={(v) => {
                      setSelectedYear(v);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white font-medium">
                        <SelectValue placeholder="اختر السنة" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">جميع السنوات</SelectItem>
                        {years.map(y => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-ping" />
                <Loader2 className="h-12 w-12 animate-spin text-gold relative z-10" />
              </div>
              <div className="text-center">
                <p className="text-[#002B49] font-black tracking-widest text-sm uppercase">جاري استرجاع البيانات</p>
                <p className="text-slate-400 text-xs font-medium mt-1">لحظات من فضلك...</p>
              </div>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner group transition-all duration-500 hover:border-gold/40 hover:bg-gold/[0.02]">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-100">
                <Newspaper className="h-10 w-10 text-slate-300 group-hover:text-gold transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-[#002B49]">لا توجد نتائج مطابقة</h3>
              <p className="text-slate-500 mt-3 font-medium max-w-md mx-auto">لم نعثر على أخبار تطابق معايير البحث الحالية. يمكنك تعديل الفلاتر أو إعادة تعيينها للبحث من جديد.</p>
              <Button variant="outline" className="mt-8 rounded-2xl border-slate-200 font-bold h-12 px-8 hover:bg-slate-50" onClick={resetFilters}>
                إعادة تعيين البحث
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item, index) => {
                  const typeStyle = NewsTypes[item.type] || { label: "خبر", class: "bg-slate-100 text-slate-700 border-slate-200" };
                  const dateStr = item.published_at || item.created_at;

                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "group relative overflow-hidden rounded-[32px] border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-2xl hover:border-gold/30 transition-all duration-700 flex flex-col cursor-pointer",
                        item.is_pinned && "ring-2 ring-gold/20 bg-gold/[0.02]"
                      )}
                      onClick={() => navigate(`/news/${item.id}`)}
                    >
                      <CardContent className="p-8 flex flex-col h-full relative z-10">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <Badge variant="outline" className={cn(
                            "font-black px-4 py-1.5 rounded-xl border-2 border-inherit text-[10px] uppercase shadow-sm tracking-tighter",
                            typeStyle.class
                          )}>
                            {typeStyle.label}
                          </Badge>
                          {item.is_pinned && (
                            <div className="flex items-center gap-1.5 bg-gold text-[#002B49] px-3.5 py-1.5 rounded-xl shadow-lg shadow-gold/20 animate-pulse">
                              <Pin className="h-3 w-3 fill-current" />
                              <span className="text-[10px] font-black uppercase">مثبت</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 flex-1">
                          <h2 className="text-2xl font-black text-[#002B49] leading-[1.3] group-hover:text-primary transition-colors decoration-gold decoration-2 underline-offset-8">
                            {item.title}
                          </h2>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100/80">
                          <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Calendar className="h-3.5 w-3.5 text-gold" />
                            <span className="tracking-tighter">{format(new Date(dateStr), "d MMMM yyyy", { locale: ar })}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-2xl bg-slate-50 text-[#002B49] hover:bg-[#002B49] hover:text-white transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/news/${item.id}`);
                            }}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>

                      {/* Decorative Background Element */}
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center">
                  <Pagination>
                    <PaginationContent className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl gap-1 flex-wrap justify-center">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={cn(
                            "rounded-2xl transition-all border-none font-bold px-4",
                            currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-gold hover:text-[#002B49]"
                          )}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        // Basic logic to show pages
                        if (totalPages > 5) {
                          if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                            if (page === 2 || page === totalPages - 1) return <PaginationEllipsis key={page} />;
                            return null;
                          }
                        }

                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              className={cn(
                                "h-11 w-11 rounded-2xl transition-all font-bold",
                                currentPage === page ? "bg-[#002B49] text-white shadow-lg" : "hover:bg-slate-100"
                              )}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={cn(
                            "rounded-2xl transition-all border-none font-bold px-4",
                            currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-gold hover:text-[#002B49]"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default News;
