import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Send, User, Clock, MapPin, Tag, AlertCircle, Phone, MessageCircle, FileText, ExternalLink, Paperclip, ShieldCheck, CheckCircle2, X } from "lucide-react";

interface Reply {
  id: string;
  message: string;
  sender_role: string;
  is_internal: boolean;
  created_at: string;
  sender?: { name: string };
}

interface RequestDetail {
  id: string;
  subject: string;
  description: string;
  status: "new" | "in_review" | "in_progress" | "responded" | "closed" | "cancelled";
  priority: "low" | "medium" | "high";
  created_at: string;
  area_id: string;
  area: { name: string };
  type: { name: string };
  citizen: { name: string; phone: string; email: string };
  replies: Reply[];
  attachments: { id: string; file_url: string; file_name: string; file_type: string }[];
  location_address?: string;
  latitude?: number;
  longitude?: number;
  assigned_to?: string;
}

interface RequestDetailDialogProps {
  request: RequestDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (requestId: string, status: string) => void;
  onPriorityChange: (requestId: string, priority: string) => void;
  onAssignChange: (requestId: string, userId: string) => void;
  onReplyAdded: () => void;
}

const statusLabels: Record<string, { label: string; class: string }> = {
  new: { label: "جديد", class: "bg-blue-50 text-blue-700 border-blue-200" },
  in_review: { label: "قيد المراجعة", class: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "قيد التنفيذ", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  responded: { label: "تم الرد", class: "bg-purple-50 text-purple-700 border-purple-200" },
  closed: { label: "مكتمل", class: "bg-slate-100 text-slate-700 border-slate-200" },
  cancelled: { label: "ملغي", class: "bg-red-50 text-red-700 border-red-200" },
};

const priorityLabels: Record<string, { label: string; class: string }> = {
  low: { label: "عادي", class: "bg-slate-50 text-slate-600 border-slate-200" },
  medium: { label: "متوسط", class: "bg-blue-50 text-blue-600 border-blue-200" },
  high: { label: "عاجل جداً", class: "bg-red-50 text-red-600 border-red-200 font-bold" },
};

export function RequestDetailDialog({
  request,
  open,
  onOpenChange,
  onStatusChange,
  onPriorityChange,
  onAssignChange,
  onReplyAdded,
}: RequestDetailDialogProps) {
  const { user, userRole } = useAuth();
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(request?.status || "new");
  const [selectedPriority, setSelectedPriority] = useState(request?.priority || "medium");
  const [selectedAssignee, setSelectedAssignee] = useState(request?.assigned_to || "");
  const [staff, setStaff] = useState<{ user_id: string; profile: { name: string; job_title: string | null } }[]>([]);

  useEffect(() => {
    if (open) {
      if (request) {
        setSelectedStatus(request.status);
        setSelectedPriority(request.priority);
        setSelectedAssignee(request.assigned_to || "");
      }
      fetchStaff();
    }
  }, [open, request]);

  const fetchStaff = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select(`
        user_id,
        profile:profiles!user_roles_user_id_fkey(name, job_title)
      `)
      .in("role", ["staff", "candidate", "admin"]);

    if (data) setStaff(data as any);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !request || !user || !userRole) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("replies").insert({
        request_id: request.id,
        sender_id: user.id,
        sender_role: userRole.role,
        message: replyMessage,
        is_internal: isInternal,
      });

      if (error) throw error;

      toast.success("تم إرسال الرد بنجاح");
      setReplyMessage("");
      setIsInternal(false);
      onReplyAdded();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("حدث خطأ أثناء إرسال الرد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as any);
    if (request) onStatusChange(request.id, status);
  };

  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority as any);
    if (request) onPriorityChange(request.id, priority);
  };

  const handleAssigneeChange = (userId: string) => {
    const finalUserId = userId === "unassigned" ? "" : userId;
    setSelectedAssignee(finalUserId);
    if (request) {
      onAssignChange(request.id, finalUserId);
      toast.success("تم تحويل الملف للموظف المختص");
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-auto max-h-[90vh] p-0 border-none shadow-2xl rounded-3xl overflow-y-auto bg-[#FAFAFB]">
        <div className="flex flex-col min-h-full">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 bg-[#002B49] p-6 text-white shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30 text-gold flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1 opacity-80">تفاصيل الطلب الرسمي</h2>
                  <DialogTitle className="text-lg md:text-xl font-black tracking-tight truncate">{request.subject}</DialogTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap", priorityLabels[request.priority]?.class)}>
                  {priorityLabels[request.priority]?.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-white/60 text-[11px] font-medium border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold" />
                <span>منذ: {format(new Date(request.created_at), "d MMMM yyyy", { locale: ar })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gold" />
                <span>بواسطة: {request.citizen?.name}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                <span className="font-bold uppercase tracking-widest">{statusLabels[request.status]?.label}</span>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8 space-y-8">
            {/* Primary Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* Right Side: Description & Details */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    وصف الحالة والموضوع
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {request.description}
                  </p>
                </div>

                {/* Attachment Card */}
                {request.attachments && request.attachments.length > 0 && (
                  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Paperclip className="h-3 w-3" />
                      المرفقات والمستندات الرسمية ({request.attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {request.attachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-gold/5 hover:border-gold/30 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-gold group-hover:border-gold/30 transition-colors shadow-sm">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate text-slate-700">{file.file_name}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{file.file_type?.split('/')[1] || 'DOC'}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-gold transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Left Side: Administration & Metadata */}
              <div className="space-y-6">
                {/* Citizen & Location Card */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-right">بيانات مقدم الطلب</h4>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="h-10 w-10 rounded-xl bg-[#002B49] flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                        {request.citizen?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{request.citizen?.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{request.citizen?.phone}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-emerald-600 hover:bg-emerald-50 h-8 w-8"
                        asChild
                      >
                        <a href={`https://wa.me/2${request.citizen?.phone}`} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">المنطقة</p>
                      <p className="text-xs font-bold text-slate-700">{request.area?.name}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">نوع الطلب</p>
                      <p className="text-xs font-bold text-slate-700">{request.type?.name}</p>
                    </div>
                  </div>

                  {/* Location Link */}
                  {(request.location_address || (request.latitude && request.longitude)) && (
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
                      <div className="flex items-center gap-2 text-blue-800">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">الموقع المعين</span>
                      </div>
                      {request.location_address && (
                        <p className="text-[11px] text-blue-700/80 leading-relaxed font-medium">
                          {request.location_address}
                        </p>
                      )}
                      {request.latitude && request.longitude && (
                        <Button variant="outline" size="sm" className="w-full rounded-xl bg-white border-blue-200 text-blue-700 hover:bg-blue-700 hover:text-white transition-all shadow-sm h-9 text-xs font-bold" asChild>
                          <a href={`https://www.google.com/maps?q=${request.latitude},${request.longitude}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 ml-2" />
                            فتح الخريطة
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Administrative Controls */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-right">إدارة وتوجيه الملف</h4>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-right font-rtl">
                      <Label className="text-[10px] font-bold text-slate-500 mr-1">حالة الطلب</Label>
                      <Select value={selectedStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">جديد</SelectItem>
                          <SelectItem value="in_review">قيد المراجعة</SelectItem>
                          <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                          <SelectItem value="responded">تم הرد</SelectItem>
                          <SelectItem value="closed">مكتمل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(userRole?.role === "admin" || userRole?.role === "candidate") && (
                      <>
                        <div className="space-y-1.5 text-right">
                          <Label className="text-[10px] font-bold text-slate-500 mr-1">الأولوية</Label>
                          <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                            <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 border-slate-200 text-sm font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">عادي</SelectItem>
                              <SelectItem value="medium">متوسط</SelectItem>
                              <SelectItem value="high">عاجل جداً</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="pt-4 p-5 rounded-2xl border-2 border-gold/20 bg-gold/5 space-y-4">
                          <div className="flex items-center gap-2 text-gold mb-1">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">توجيه الطلب للمختص</span>
                          </div>
                          <Select value={selectedAssignee || "unassigned"} onValueChange={setSelectedAssignee}>
                            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-gold/30 text-sm font-bold shadow-sm">
                              <SelectValue placeholder="اختر الموظف..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">غير محدد</SelectItem>
                              {staff.map((s) => (
                                <SelectItem key={s.user_id} value={s.user_id}>
                                  <div className="flex flex-col text-right">
                                    <span className="font-bold">{s.profile?.name || "بدون اسم"}</span>
                                    {s.profile?.job_title && (
                                      <span className="text-[10px] text-muted-foreground">{s.profile.job_title}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleAssigneeChange(selectedAssignee)}
                            disabled={!selectedAssignee}
                            className="w-full h-10 rounded-xl bg-gold hover:bg-gold/80 text-white font-black shadow-lg shadow-gold/20 flex items-center justify-center gap-2 text-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            ارسال للموظف
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Communication Thread */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-[#002B49] tracking-tight">سجل التواصل</h4>
                <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[#002B49] text-[10px]">
                  {request.replies?.length || 0} استجابة
                </Badge>
              </div>

              <div className="space-y-4">
                {request.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className={cn(
                      "p-5 rounded-[28px] border transition-all shadow-sm",
                      reply.is_internal
                        ? "bg-amber-50/50 border-amber-100"
                        : reply.sender_role === "citizen"
                          ? "bg-white border-slate-200 ml-8 md:ml-12"
                          : "bg-blue-50/30 border-blue-100 mr-8 md:mr-12 text-left"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3 text-[10px]">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-xs",
                          reply.sender_role === "citizen" ? "bg-slate-400" : "bg-[#002B49]"
                        )}>
                          {reply.sender_role === "citizen" ? "م" : "إ"}
                        </div>
                        <div>
                          <span className="font-black uppercase tracking-widest text-slate-800">
                            {reply.sender_role === "citizen" ? "المواطن" : "الإدارة"}
                          </span>
                          {reply.is_internal && (
                            <span className="mr-2 text-amber-600 font-black text-[8px] uppercase tracking-tighter bg-amber-100 px-1.5 py-0.5 rounded">داخلي</span>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-400 font-medium tracking-tighter italic">
                        {format(new Date(reply.created_at), "d MMM yyyy - h:mm a", { locale: ar })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form Section */}
              <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                  <Label className="text-xs font-black text-[#002B49] uppercase tracking-widest">إضافة رد رسمي أو ملاحظة</Label>
                </div>
                <Textarea
                  placeholder="اكتب التحديث الفني أو الاستجابة هنا..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="rounded-[24px] border-slate-200 focus:ring-gold bg-slate-50/50 p-6 text-sm font-medium"
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                    <Checkbox
                      id="internal"
                      className="rounded-md border-slate-300 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                      checked={isInternal}
                      onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                    />
                    <Label htmlFor="internal" className="text-[10px] font-bold text-slate-500 cursor-pointer">
                      ملاحظة داخلية للفريق
                    </Label>
                  </div>
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isSubmitting}
                    className="w-full sm:w-auto rounded-full bg-[#002B49] hover:bg-[#00426E] text-white px-10 h-11 shadow-lg shadow-blue-900/20 font-black flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "جاري الحفظ..." : "اعتماد الاستجابة"}
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="pb-8" /> {/* Cushion at the bottom */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
