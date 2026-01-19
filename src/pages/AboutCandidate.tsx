
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { CandidateProfile, CandidateAchievement } from "@/types/candidate";
import { toast } from "sonner";
import {
    Phone,
    MessageCircle,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Trophy,
    User,
    Calendar,
    ArrowLeft,
    Mail,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AboutCandidate() {
    const [profile, setProfile] = useState<CandidateProfile | null>(null);
    const [achievements, setAchievements] = useState<CandidateAchievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: profileData, error: profileError } = await (supabase
                .from("candidate_profile" as any)
                .select("*")
                .maybeSingle() as any);

            if (profileError) throw profileError;
            setProfile(profileData);

            const { data: achievementsData, error: achievementsError } = await (supabase
                .from("candidate_achievements" as any)
                .select("*")
                .order("order", { ascending: true }) as any);

            if (achievementsError) throw achievementsError;
            setAchievements(achievementsData || []);
        } catch (error: any) {
            console.error("Error fetching candidate info:", error);
            toast.error("حدث خطأ أثناء تحميل بيانات المرشح");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="container py-20 space-y-12">
                    <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Skeleton className="h-80 md:col-span-2 rounded-[2rem]" />
                        <Skeleton className="h-80 rounded-[2rem]" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50/50">
                {/* Modern Hero Section */}
                <section className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 overflow-hidden bg-[#001D33]">
                    {/* Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-30" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/10 rounded-full blur-[120px]" />
                        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
                    </div>

                    <div className="container relative z-10 px-6 sm:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div className="space-y-6 sm:space-y-8 text-center lg:text-right order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md animate-fade-in shadow-xl">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                                    </span>
                                    <span className="text-gold text-[9px] sm:text-[10px] font-black tracking-widest uppercase">الملف الرسمي المعتمد</span>
                                </div>

                                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight">
                                    {profile?.full_name}
                                    <span className="block text-gold/90 text-[0.45em] sm:text-[0.4em] mt-3 sm:mt-4 font-bold tracking-normal opacity-90">
                                        {profile?.title || "نائب الدائرة"}
                                    </span>
                                </h1>

                                <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mr-0 font-medium leading-relaxed sm:leading-[1.8]">
                                    {profile?.bio?.slice(0, 180)}...
                                </p>

                                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4 pt-4 sm:pt-6">
                                    <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-gold hover:bg-gold/90 text-[#001D33] font-black text-base sm:text-lg gap-3 shadow-xl shadow-gold/20" asChild>
                                        <a href={`tel:${profile?.phone}`}>
                                            <Phone className="w-5 h-5" />
                                            <span>تواصل مباشر</span>
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 flex justify-center animate-fade-in">
                                <div className="relative w-full max-w-[320px] sm:max-w-[440px]">
                                    <div className="relative aspect-[4/5] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-2 sm:border-4 border-white/10 shadow-2xl">
                                        {profile?.image_url ? (
                                            <img src={profile.image_url} alt={profile.full_name} className="w-full h-full object-cover grayscale-[0.1] hover:grayscale-0 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <User className="w-20 sm:w-24 h-20 sm:h-24 text-white/5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Content & Achievements */}
                <section className="py-24 container -mt-10 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Sidebar: Quick Info & Social */}
                        <div className="lg:col-span-4 space-y-8">
                            <Card className="p-8 rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 space-y-8 sticky top-28">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-[#001D33] border-r-4 border-gold pr-3">معلومات الاتصال</h3>
                                    <div className="space-y-4">
                                        {profile?.phone && (
                                            <a href={`tel:${profile.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-slate-700" dir="ltr">{profile.phone}</span>
                                            </a>
                                        )}
                                        {profile?.whatsapp && (
                                            <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                                    <MessageCircle className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-slate-700">واتساب المكتب</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-[#001D33] pr-3 border-r-4 border-slate-200">المنصات الرقمية</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {profile?.facebook && (
                                            <Button variant="ghost" className="h-14 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 gap-2 border-none" asChild>
                                                <a href={profile.facebook} target="_blank"><Facebook className="w-5 h-5" /></a>
                                            </Button>
                                        )}
                                        {profile?.twitter && (
                                            <Button variant="ghost" className="h-14 rounded-2xl bg-slate-900 text-white hover:bg-black gap-2 border-none" asChild>
                                                <a href={profile.twitter} target="_blank"><Twitter className="w-5 h-5" /></a>
                                            </Button>
                                        )}
                                        {profile?.instagram && (
                                            <Button variant="ghost" className="h-14 rounded-2xl bg-pink-50 text-pink-600 hover:bg-pink-100 gap-2 border-none" asChild>
                                                <a href={profile.instagram} target="_blank"><Instagram className="w-5 h-5" /></a>
                                            </Button>
                                        )}
                                        {profile?.linkedin && (
                                            <Button variant="ghost" className="h-14 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 gap-2 border-none" asChild>
                                                <a href={profile.linkedin} target="_blank"><Linkedin className="w-5 h-5" /></a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Main Content: Bio & Achievements */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Bio Card */}
                            <Card className="p-10 md:p-14 rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-gold/5 rounded-br-full" />
                                <div className="relative space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                            <User className="w-7 h-7" />
                                        </div>
                                        <h2 className="text-3xl font-black text-[#001D33]">السيرة الذاتية والرؤية</h2>
                                    </div>
                                    <div className="text-xl text-slate-600 leading-[2] font-medium whitespace-pre-wrap">
                                        {profile?.bio}
                                    </div>
                                </div>
                            </Card>

                            {/* Achievements Section */}
                            {achievements.length > 0 && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                            <Trophy className="w-7 h-7" />
                                        </div>
                                        <h2 className="text-3xl font-black text-[#001D33]">سجل الإنجازات</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {achievements.map((item) => (
                                            <Card key={item.id} className="p-8 rounded-[2rem] border-none shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                                <div className="flex justify-between items-start mb-6">
                                                    <Badge className="bg-primary/5 text-primary text-sm font-bold h-8 px-4 rounded-lg">
                                                        {item.year || "مستمر"}
                                                    </Badge>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowUpRight className="w-6 h-6 text-gold" />
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-black text-[#001D33] mb-4 leading-snug">{item.title}</h3>
                                                <p className="text-slate-500 leading-relaxed font-medium line-clamp-3">
                                                    {item.description}
                                                </p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
