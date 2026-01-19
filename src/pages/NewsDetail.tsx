import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    ArrowRight,
    Share2,
    Clock,
    MapPin,
    User,
    Loader2,
    Newspaper,
    Pin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

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

const NewsDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchNewsDetail();
        }
    }, [id]);

    const fetchNewsDetail = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("news")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setNews(data);
        } catch (error) {
            console.error("Error fetching news detail:", error);
            toast.error("عذراً، لم نتمكن من تحميل تفاصيل الخبر.");
            navigate("/news");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: news?.title,
                text: news?.content.substring(0, 100),
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("تم نسخ الرابط لمشاركته");
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-gold" />
                    <p className="text-[#002B49] font-bold">جاري تحميل الخبر...</p>
                </div>
            </MainLayout>
        );
    }

    if (!news) return null;

    const typeStyle = NewsTypes[news.type] || { label: "خبر", class: "bg-slate-100 text-slate-700 border-slate-200" };
    const dateStr = news.published_at || news.created_at;

    return (
        <MainLayout>
            <section className="py-12 md:py-20 bg-gradient-to-b from-slate-50 to-white">
                <div className="container max-w-4xl">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        className="mb-8 rounded-xl font-bold gap-2 text-slate-500 hover:text-[#002B49] hover:bg-slate-100 transition-all"
                        asChild
                    >
                        <Link to="/news">
                            <ArrowRight className="h-4 w-4" />
                            العودة للأخبار
                        </Link>
                    </Button>

                    <article className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        {/* News Header Decoration */}
                        <div className="h-3 bg-gradient-to-r from-gold via-[#002B49] to-gold"></div>

                        <div className="p-8 md:p-14">
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <Badge variant="outline" className={`${typeStyle.class} font-black px-4 py-2 rounded-xl text-xs uppercase border-2`}>
                                    {typeStyle.label}
                                </Badge>

                                {news.is_pinned && (
                                    <div className="flex items-center gap-1.5 bg-gold text-[#002B49] px-4 py-2 rounded-xl shadow-lg shadow-gold/20">
                                        <Pin className="h-3.5 w-3.5 fill-current" />
                                        <span className="text-xs font-black uppercase">خبر مثبت</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                    <Calendar className="h-4 w-4 text-gold" />
                                    <span>{format(new Date(dateStr), "d MMMM yyyy", { locale: ar })}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl font-black text-[#002B49] leading-[1.2] mb-10 tracking-tight">
                                {news.title}
                            </h1>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between py-6 mb-10 border-y border-slate-50">
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm font-bold">
                                        <User className="h-4 w-4 text-gold" />
                                        <span>المكتب الإعلامي</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                        <Clock className="h-4 w-4 text-gold" />
                                        <span>قراءة في دقيقتين</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-slate-200 gap-2 font-bold hover:bg-slate-50"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-4 w-4" />
                                    مشاركة
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:text-lg prose-p:font-medium text-right direction-rtl">
                                {news.content.split('\n').map((paragraph, idx) => (
                                    paragraph ? <p key={idx} className="mb-6">{paragraph}</p> : <br key={idx} />
                                ))}
                            </div>
                        </div>

                        {/* Footer / CTA */}
                        <div className="p-8 md:p-14 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                    <Newspaper className="h-6 w-6 text-gold" />
                                </div>
                                <div>
                                    <p className="font-black text-[#002B49]">هل لديك استفسار؟</p>
                                    <p className="text-sm text-slate-500 font-bold">يمكنك التواصل مع المكتب البرلماني مباشرة</p>
                                </div>
                            </div>
                            <Button className="w-full md:w-auto rounded-xl bg-[#002B49] text-white px-8 h-12 font-bold shadow-xl shadow-[#002B49]/20" onClick={() => navigate('/requests/new')}>
                                تقديم طلب خدمة
                            </Button>
                        </div>
                    </article>
                </div>
            </section>
        </MainLayout>
    );
};

export default NewsDetail;
