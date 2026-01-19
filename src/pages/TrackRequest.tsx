import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Clock,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  MessageSquare,
  Building2,
  FileText,
  ArrowLeft,
  Phone,
  Copy,
  Calendar,
  User,
  Loader2,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequestData {
  id: string;
  reference_number: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  area: { name: string } | null;
  request_type: { name: string } | null;
  replies: Array<{
    id: string;
    message: string;
    created_at: string;
    is_internal: boolean;
    sender_role: string;
  }>;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string; step: number }> = {
  new: { label: "جديد", icon: CircleDot, color: "text-blue-600", bgColor: "bg-blue-500", step: 1 },
  in_review: { label: "قيد المراجعة", icon: Clock, color: "text-amber-600", bgColor: "bg-amber-500", step: 2 },
  in_progress: { label: "قيد التنفيذ", icon: FileText, color: "text-violet-600", bgColor: "bg-violet-500", step: 3 },
  responded: { label: "تم الرد", icon: MessageSquare, color: "text-emerald-600", bgColor: "bg-emerald-500", step: 4 },
  closed: { label: "مغلق", icon: CheckCircle2, color: "text-slate-600", bgColor: "bg-slate-500", step: 5 },
  cancelled: { label: "ملغي", icon: XCircle, color: "text-red-600", bgColor: "bg-red-500", step: 0 },
};

const priorityLabels: Record<string, { label: string; className: string }> = {
  low: { label: "عادي", className: "bg-green-100 text-green-700 border-green-200" },
  medium: { label: "متوسط", className: "bg-amber-100 text-amber-700 border-amber-200" },
  high: { label: "عاجل", className: "bg-red-100 text-red-700 border-red-200" },
};

const TrackRequest = () => {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("ref") || searchParams.get("id") || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [request, setRequest] = useState<RequestData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && userRole && (userRole.role === "candidate" || userRole.role === "staff")) {
      toast.error("عذراً، لا يمكنك تتبع الطلبات بصفتك موظف أو مرشح");
      navigate("/");
    }
  }, [userRole, authLoading, navigate]);

  // Auto-search if ref/id is in URL
  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    const idFromUrl = searchParams.get("id");
    const target = refFromUrl || idFromUrl;
    if (target) {
      setSearchQuery(target);
      searchRequest(target);
    }
  }, [searchParams]);

  const searchRequest = async (id: string) => {
    if (!id.trim()) {
      toast.error("يرجى إدخال الرقم المرجعي");
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setRequest(null);

    try {
      // Search by reference_number first, then by ID as fallback
      let query = supabase
        .from("requests")
        .select(`
          id,
          reference_number,
          subject,
          description,
          status,
          priority,
          created_at,
          updated_at,
          area:areas(name),
          request_type:request_types(name),
          replies(id, message, created_at, is_internal, sender_role)
        `);

      if (id.includes("-") && id.length < 15) {
        query = query.eq("reference_number", id.trim());
      } else {
        query = query.eq("id", id.trim());
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      // Filter out internal replies for citizens
      const publicReplies = data.replies?.filter(r => !r.is_internal) || [];
      setRequest({
        ...data,
        area: data.area as { name: string } | null,
        request_type: data.request_type as { name: string } | null,
        replies: publicReplies,
      });
    } catch (error) {
      toast.error("حدث خطأ أثناء البحث");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyId = () => {
    if (request?.reference_number || request?.id) {
      navigator.clipboard.writeText(request.reference_number || request.id);
      toast.success("تم نسخ رقم الطلب");
    }
  };

  const isCancelled = request?.status === "cancelled";
  const currentStep = request ? statusConfig[request.status]?.step || 1 : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Search Section */}
        {!request && (
          <section className="py-16 px-6">
            <div className="container max-w-2xl mx-auto">
              {/* Search Card */}
              <div className="bg-card rounded-3xl shadow-elevated border border-border/50 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <Search className="h-7 w-7 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    متابعة طلب سابق
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    أدخل بياناتك للاطلاع على حالة طلبك
                  </p>
                </div>

                {/* Form */}
                <div className="p-8 pt-0">
                  <form onSubmit={(e) => { e.preventDefault(); searchRequest(searchQuery); }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-right block">
                          الرقم المرجعي
                        </Label>
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="مثلاً: 24-00001"
                          className="h-14 rounded-xl bg-muted/30 border-border/50 focus:bg-background text-left"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-right block">
                          رقم الهاتف
                        </Label>
                        <Input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          className="h-14 rounded-xl bg-muted/30 border-border/50 focus:bg-background text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                      disabled={isSearching}
                      onClick={(e) => { e.preventDefault(); searchRequest(searchQuery); }}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                          جاري البحث...
                        </>
                      ) : (
                        "بحث عن الطلب"
                      )}
                    </Button>
                  </form>

                  {/* Not Found State */}
                  {notFound && (
                    <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <XCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold text-destructive">لم يتم العثور على الطلب</p>
                        <p className="text-sm text-muted-foreground">
                          تأكد من صحة الرقم المرجعي وحاول مرة أخرى
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Link */}
              <div className="text-center mt-8">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  العودة للرئيسية
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Request Details */}
        {request && (
          <div className="animate-fade-in">
            {/* Header with Status */}
            <HeroSection
              badge="نظام التتبع"
              title="متابعة حالة الطلب"
              description="اطلع على آخر التحديثات والإجراءات المتخذة بشأن طلبك."
              showSearch={false}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1 font-bold">رقم الطلب المرجعي</p>
                    <div className="flex items-center gap-3">
                      <code className="text-white font-mono text-xl font-black">
                        {request.reference_number || request.id.slice(0, 8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyId}
                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isCancelled && (
                    <Badge className="bg-red-500 text-white border-none text-xs px-4 py-1.5 font-black">
                      طلب ملغي
                    </Badge>
                  )}
                  <Badge className={cn("border-none text-xs px-4 py-1.5 font-black",
                    request.priority === 'high' ? 'bg-red-500 text-white' :
                      request.priority === 'medium' ? 'bg-gold text-[#002B49]' :
                        'bg-emerald-500 text-white'
                  )}>
                    {priorityLabels[request.priority]?.label}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold"
                    onClick={() => setRequest(null)}
                  >
                    بحث جديد
                  </Button>
                </div>
              </div>
            </HeroSection>

            {/* Content */}
            <div className="container py-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Timeline Card */}
                <div className="bg-card rounded-3xl border border-border/50 shadow-elevated overflow-hidden">
                  <div className="p-6 border-b border-border bg-muted/30">
                    <h2 className="font-bold text-lg text-foreground">مراحل الطلب</h2>
                  </div>
                  <div className="p-8">
                    {/* Vertical Timeline for Mobile, Horizontal for Desktop */}
                    <div className="relative">
                      {/* Desktop Timeline */}
                      <div className="hidden md:block">
                        {/* Progress Bar Background */}
                        <div className="absolute top-6 left-8 right-8 h-1 bg-muted rounded-full" />

                        {/* Active Progress */}
                        {!isCancelled && (
                          <div
                            className="absolute top-6 right-8 h-1 bg-accent rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(((currentStep - 1) / (Object.keys(statusConfig).length - 2)) * (100 - 8), 92)}%` }}
                          />
                        )}

                        {/* Steps */}
                        <div className="relative flex justify-between">
                          {Object.entries(statusConfig)
                            .filter(([status]) => status !== 'cancelled')
                            .map(([status, config], index) => {
                              const isActive = !isCancelled && config.step <= currentStep;
                              const isCurrent = !isCancelled && config.step === currentStep;
                              const Icon = config.icon;

                              return (
                                <div
                                  key={status}
                                  className="flex flex-col items-center"
                                  style={{
                                    animationDelay: `${index * 150}ms`,
                                    animation: isActive ? 'fadeIn 0.5s ease-out forwards' : 'none'
                                  }}
                                >
                                  <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative z-10",
                                    isActive
                                      ? `${config.bgColor} text-white shadow-lg`
                                      : "bg-muted text-muted-foreground",
                                    isCurrent && "ring-4 ring-accent/30 scale-110",
                                    isCancelled && "opacity-50 grayscale"
                                  )}>
                                    <Icon className="h-5 w-5" />
                                    {isCurrent && (
                                      <span className="absolute -inset-1 rounded-full animate-ping bg-accent/30" />
                                    )}
                                  </div>
                                  <span className={cn(
                                    "text-xs mt-3 font-medium text-center transition-colors duration-300",
                                    isActive ? config.color : "text-muted-foreground"
                                  )}>
                                    {config.label}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Mobile Timeline - Vertical */}
                      <div className="md:hidden space-y-0">
                        {isCancelled ? (
                          <div className="flex gap-4 items-center p-4 bg-red-50 rounded-2xl border border-red-100 animate-pulse">
                            <XCircle className="h-8 w-8 text-red-500" />
                            <div>
                              <p className="font-bold text-red-700">الطلب ملغي</p>
                              <p className="text-sm text-red-600">هذا الطلب لم يعد قيد المعالجة</p>
                            </div>
                          </div>
                        ) : (
                          Object.entries(statusConfig)
                            .filter(([status]) => status !== 'cancelled')
                            .map(([status, config], index) => {
                              const isActive = config.step <= currentStep;
                              const isCurrent = config.step === currentStep;
                              const Icon = config.icon;
                              const visibleSteps = Object.keys(statusConfig).filter(s => s !== 'cancelled');
                              const isLast = index === visibleSteps.length - 1;

                              return (
                                <div
                                  key={status}
                                  className="flex gap-4"
                                  style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'slideUp 0.4s ease-out forwards'
                                  }}
                                >
                                  {/* Line and Circle */}
                                  <div className="flex flex-col items-center">
                                    <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0",
                                      isActive
                                        ? `${config.bgColor} text-white shadow-md`
                                        : "bg-muted text-muted-foreground",
                                      isCurrent && "ring-4 ring-accent/30"
                                    )}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    {!isLast && (
                                      <div className={cn(
                                        "w-0.5 h-12 transition-all duration-500",
                                        isActive && config.step < currentStep ? "bg-accent" : "bg-muted"
                                      )} />
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className={cn(
                                    "pb-6 pt-2",
                                    !isLast && "border-b-0"
                                  )}>
                                    <p className={cn(
                                      "font-medium transition-colors duration-300",
                                      isActive ? config.color : "text-muted-foreground"
                                    )}>
                                      {config.label}
                                    </p>
                                    {isCurrent && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        الحالة الحالية
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-card rounded-3xl border border-border/50 shadow-elevated overflow-hidden">
                  <div className="p-6 border-b border-border bg-muted/30">
                    <h2 className="font-bold text-lg text-foreground">تفاصيل الطلب</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Building2 className="h-4 w-4" />
                          <span className="text-xs">المنطقة</span>
                        </div>
                        <p className="font-medium text-sm">{request.area?.name || "غير محدد"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">النوع</span>
                        </div>
                        <p className="font-medium text-sm">{request.request_type?.name || "غير محدد"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">تاريخ التقديم</span>
                        </div>
                        <p className="font-medium text-sm">{format(new Date(request.created_at), "dd MMM yyyy", { locale: ar })}</p>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">آخر تحديث</span>
                        </div>
                        <p className="font-medium text-sm">{format(new Date(request.updated_at), "dd MMM yyyy", { locale: ar })}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-muted/20 rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-3">{request.subject}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {request.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Replies Card */}
                {request.replies.length > 0 && (
                  <div className="bg-card rounded-3xl border border-border/50 shadow-elevated overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                      <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        الردود ({request.replies.length})
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {request.replies.map((reply, index) => (
                          <div
                            key={reply.id}
                            className={cn(
                              "p-5 rounded-2xl transition-all duration-300",
                              reply.sender_role !== "citizen"
                                ? "bg-accent/5 border border-accent/20"
                                : "bg-muted/30 border border-border"
                            )}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  reply.sender_role !== "citizen" ? "bg-accent/20" : "bg-muted"
                                )}>
                                  <User className={cn(
                                    "h-4 w-4",
                                    reply.sender_role !== "citizen" ? "text-accent" : "text-muted-foreground"
                                  )} />
                                </div>
                                <span className="text-sm font-medium">
                                  {reply.sender_role === "citizen" ? "أنت" : "فريق الدعم"}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(reply.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 rounded-xl"
                    onClick={() => setRequest(null)}
                  >
                    بحث عن طلب آخر
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 h-14 rounded-xl bg-accent hover:bg-accent/90"
                  >
                    <Link to="/requests/new">
                      تقديم طلب جديد
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TrackRequest;
