import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Clock, CheckCircle2, CircleDot, MessageSquare, ExternalLink, Loader2, Edit2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Request {
  id: string;
  subject: string;
  status: "new" | "in_review" | "in_progress" | "responded" | "closed" | "cancelled";
  priority: string;
  created_at: string;
  area: { name: string } | null;
  request_type: { name: string } | null;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  new: { label: "جديد", icon: CircleDot, className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_review: { label: "قيد المراجعة", icon: Clock, className: "bg-amber-100 text-amber-700 border-amber-200" },
  in_progress: { label: "قيد التنفيذ", icon: Clock, className: "bg-orange-100 text-orange-700 border-orange-200" },
  responded: { label: "تم الرد", icon: MessageSquare, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  closed: { label: "مغلق", icon: CheckCircle2, className: "bg-gray-100 text-gray-700 border-gray-200" },
  cancelled: { label: "ملغي", icon: XCircle, className: "bg-red-100 text-red-700 border-red-200" },
};

const priorityLabels: Record<string, { label: string; className: string }> = {
  low: { label: "عادي", className: "bg-green-100 text-green-700" },
  medium: { label: "متوسط", className: "bg-amber-100 text-amber-700" },
  high: { label: "عاجل", className: "bg-red-100 text-red-700" },
};

const MyRequests = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchRequests();
    }
  }, [user, authLoading, navigate]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          id,
          subject,
          status,
          priority,
          created_at,
          area:areas(name),
          request_type:request_types(name)
        `)
        .eq("citizen_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data?.map(r => ({
        ...r,
        area: r.area as { name: string } | null,
        request_type: r.request_type as { name: string } | null,
      })) || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canEditRequest = (createdAt: string, status: string) => {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const requestDate = new Date(createdAt);
    return requestDate > sixHoursAgo && !["cancelled", "closed"].includes(status);
  };

  const canCancelRequest = (status: string) => {
    return !["cancelled", "closed"].includes(status);
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;

    setCancellingId(requestId);
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: "cancelled" })
        .eq("id", requestId);

      if (error) {
        console.error('Cancel error details:', error);
        throw error;
      }

      toast.success("تم إلغاء الطلب بنجاح");
      fetchRequests();
    } catch (error: any) {
      console.error("Error cancelling request:", error);
      toast.error("خطأ في إلغاء الطلب: " + (error.message || JSON.stringify(error)));
    } finally {
      setCancellingId(null);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["new", "in_review", "in_progress"].includes(request.status);
    if (activeTab === "completed") return ["responded", "closed", "cancelled"].includes(request.status);
    return true;
  });

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <HeroSection
        badge="لوحة التحكم"
        title="طلباتي السابقة"
        description="جميع طلباتك في مكان واحد"
        showSearch={false}
      >
        <div className="flex justify-center lg:justify-start mt-8">
          <Button asChild className="bg-gold hover:bg-gold/90 text-[#002B49] font-black h-12 px-8 rounded-xl shadow-xl shadow-gold/20 transition-all hover:scale-105 active:scale-95">
            <Link to="/requests/new">
              <Plus className="h-5 w-5 ml-2" />
              تقديم طلب جديد
            </Link>
          </Button>
        </div>
      </HeroSection>

      {/* Content */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="all" className="text-sm">
                الكل ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-sm">
                نشط ({requests.filter(r => ["new", "in_review", "in_progress"].includes(r.status)).length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm">
                مكتمل ({requests.filter(r => ["responded", "closed"].includes(r.status)).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                // Skeleton Loading
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredRequests.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-16 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === "all"
                        ? "لم تقم بتقديم أي طلبات بعد"
                        : activeTab === "active"
                          ? "لا توجد طلبات نشطة حالياً"
                          : "لا توجد طلبات مكتملة"}
                    </p>
                    <Button asChild>
                      <Link to="/requests/new">
                        <Plus className="h-4 w-4 ml-2" />
                        تقديم طلب جديد
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.map((request) => {
                  const StatusIcon = statusConfig[request.status]?.icon || CircleDot;
                  return (
                    <Card
                      key={request.id}
                      className="border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3 flex-1 min-w-0">
                            <div>
                              <h3 className="font-semibold text-foreground truncate">
                                {request.subject}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {request.area?.name} • {request.request_type?.name}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={cn("border", statusConfig[request.status]?.className)}>
                                <StatusIcon className="h-3 w-3 ml-1" />
                                {statusConfig[request.status]?.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(request.created_at), "dd MMMM yyyy", { locale: ar })}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {canEditRequest(request.created_at, request.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/requests/edit/${request.id}`}>
                                  <Edit2 className="h-4 w-4 ml-2" />
                                  تعديل
                                </Link>
                              </Button>
                            )}
                            {canCancelRequest(request.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(request.id)}
                                disabled={cancellingId === request.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {cancellingId === request.id ? (
                                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4 ml-2" />
                                )}
                                إلغاء
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/track-request?id=${request.id}`}>
                                <ExternalLink className="h-4 w-4 ml-2" />
                                التفاصيل
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
};

export default MyRequests;
