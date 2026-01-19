import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    Plus,
    Loader2,
    Pencil,
    Trash2,
    Newspaper,
    Megaphone,
    AlertTriangle,
    Calendar,
    Eye,
    CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

interface Area {
    id: string;
    name: string;
}

interface NewsItem {
    id: string;
    title: string;
    content: string;
    type: string;
    status: string;
    is_pinned: boolean;
    is_urgent: boolean;
    created_at: string;
    published_at?: string;
    area_id?: string;
    area?: { name: string };
}

const NewsTypes: Record<string, { label: string; icon: any; color: string }> = {
    statement: { label: "بيان رسمي", icon: Newspaper, color: "bg-blue-100 text-blue-700" },
    service_update: { label: "تحديث خدمة", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
    achievement: { label: "إنجاز", icon: Megaphone, color: "bg-amber-100 text-amber-700" },
    event: { label: "فعالية", icon: Calendar, color: "bg-purple-100 text-purple-700" },
    alert: { label: "تنبيه هام", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
    awareness: { label: "توعية", icon: Eye, color: "bg-cyan-100 text-cyan-700" },
};

export default function NewsManagement() {
    const { user, isStaffOrCandidate } = useAuth();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [areas, setAreas] = useState<Area[]>([]); // Added areas state
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "statement",
        status: "draft",
        is_pinned: false,
        is_urgent: false,
        area_id: "all", // Added area_id to form
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [newsRes, areasRes] = await Promise.all([
                supabase
                    .from("news")
                    .select("*, area:areas(name)")
                    .order("created_at", { ascending: false }),
                supabase.from("areas").select("id, name").order("name"),
            ]);

            if (newsRes.error) throw newsRes.error;
            if (areasRes.error) throw areasRes.error;

            setNews(newsRes.data || []);
            setAreas(areasRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("فشل تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (item?: NewsItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                content: item.content,
                type: item.type,
                status: item.status,
                is_pinned: item.is_pinned,
                is_urgent: item.is_urgent,
                area_id: item.area_id || "all",
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: "",
                content: "",
                type: "statement",
                status: "draft",
                is_pinned: false,
                is_urgent: false,
                area_id: "all",
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        if (!user) return;

        setIsSaving(true);
        try {
            const payload = {
                title: formData.title,
                content: formData.content,
                type: formData.type as "statement" | "service_update" | "achievement" | "event" | "alert" | "awareness",
                status: formData.status as "draft" | "scheduled" | "published",
                is_pinned: formData.is_pinned,
                is_urgent: formData.is_urgent,
                area_id: formData.area_id === "all" ? null : formData.area_id,
                created_by: user.id, // Only used on insert, ignored on update by RLS usually, but good to keep
                published_at: formData.status === "published" ? new Date().toISOString() : null,
            };

            let error;
            if (editingItem) {
                const { error: updateError } = await supabase
                    .from("news")
                    .update(payload)
                    .eq("id", editingItem.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from("news").insert(payload);
                error = insertError;
            }

            if (error) throw error;

            toast.success(editingItem ? "تم تحديث الخبر بنجاح" : "تم إضافة الخبر بنجاح");
            setIsDialogOpen(false);
            fetchData(); // Refresh both to be safe
        } catch (error: any) {
            console.error("Error saving news:", error);
            toast.error(error.message || "حدث خطأ أثناء الحفظ");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;

        try {
            const { error } = await supabase.from("news").delete().eq("id", id);
            if (error) throw error;
            toast.success("تم حذف الخبر بنجاح");
            fetchData();
        } catch (error) {
            console.error("Error deleting news:", error);
            toast.error("فشل حذف الخبر");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!isStaffOrCandidate) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold">غير مصرح لك بالوصول</h2>
                    <p className="text-muted-foreground mt-2">هذه الصفحة متاحة فقط للمسؤولين وفريق العمل.</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[#002B49]">المركز الإعلامي</h1>
                        <p className="text-muted-foreground font-medium mt-2">
                            إدارة البيانات الصحفية والأخبار والتنبيهات
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 font-bold shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5" />
                        إضافة خبر جديد
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-6 rounded-[2rem] border border-border/50 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Newspaper className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">إجمالي الأخبار</p>
                            <h3 className="text-2xl font-black text-[#002B49]">{news.length}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-[2rem] border border-border/50 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">منشور حالياً</p>
                            <h3 className="text-2xl font-black text-[#002B49]">
                                {news.filter((n) => n.status === "published").length}
                            </h3>
                        </div>
                    </div>
                    <div className="bg-card p-6 rounded-[2rem] border border-border/50 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <Pencil className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">مسودات</p>
                            <h3 className="text-2xl font-black text-[#002B49]">
                                {news.filter((n) => n.status === "draft").length}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* News Table */}
                <div className="bg-white rounded-[2rem] border border-border/50 shadow-xl shadow-gray-100/50 overflow-hidden">
                    <div className="p-6 border-b border-border/50">
                        <h3 className="font-bold text-lg text-[#002B49]">قائمة الأخبار والبيانات</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="text-right">العنوان</TableHead>
                                    <TableHead className="text-right">النوع</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">المنطقة</TableHead>
                                    <TableHead className="text-right">تاريخ النشر</TableHead>
                                    <TableHead className="text-right">خصائص</TableHead>
                                    <TableHead className="text-left">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {news.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                            لا يوجد أخبار مضافة حالياً
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    news.map((item) => (
                                        <TableRow key={item.id} className="group hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-medium text-[#002B49] max-w-[300px] truncate">
                                                {item.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`border-0 ${NewsTypes[item.type]?.color || 'bg-gray-100'}`}>
                                                    {NewsTypes[item.type]?.label || item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        item.status === "published" ? "bg-emerald-500 hover:bg-emerald-600" :
                                                            item.status === "scheduled" ? "bg-amber-500 hover:bg-amber-600" :
                                                                "bg-slate-500 hover:bg-slate-600"
                                                    }
                                                >
                                                    {item.status === "published" ? "منشور" : item.status === "scheduled" ? "مجدول" : "مسودة"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {item.area?.name || "جميع المناطق"}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm" dir="ltr">
                                                {item.published_at
                                                    ? format(new Date(item.published_at), "dd MMM yyyy", { locale: ar })
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {item.is_urgent && <Badge variant="destructive">عاجل</Badge>}
                                                    {item.is_pinned && <Badge variant="secondary">مثبت</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(item)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(item.id)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl sm:rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#002B49]">
                            {editingItem ? "تعديل الخبر" : "إضافة خبر جديد"}
                        </DialogTitle>
                        <DialogDescription>
                            قم بتعبئة البيانات التالية لنشر خبر جديد أو تحديث خبر موجود
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-right">عنوان الخبر</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-12 rounded-xl text-lg"
                                placeholder="عنوان رئيسي جذاب..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-right">نوع المحتوى</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(NewsTypes).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex items-center gap-2">
                                                    <val.icon className="h-4 w-4 opacity-50" />
                                                    {val.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-right">حالة النشر</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">مسودة (لا يظهر للعامة)</SelectItem>
                                        <SelectItem value="published">نشر فوري</SelectItem>
                                        <SelectItem value="scheduled">جدولة (قريباً)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-right">المنطقة المستهدفة (اختياري)</Label>
                            <Select
                                value={formData.area_id}
                                onValueChange={(val) => setFormData({ ...formData, area_id: val })}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="جميع المناطق" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع المناطق</SelectItem>
                                    {areas.map((area) => (
                                        <SelectItem key={area.id} value={area.id}>
                                            {area.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content" className="text-right">نص الخبر</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="min-h-[200px] rounded-xl text-base p-4 resize-none"
                                placeholder="اكتب تفاصيل الخبر هنا..."
                            />
                        </div>

                        <div className="flex items-center gap-8 p-4 bg-muted/20 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={formData.is_urgent}
                                    onCheckedChange={(c) => setFormData({ ...formData, is_urgent: c })}
                                />
                                <div className="space-y-0.5">
                                    <Label className="font-bold">خبر عاجل</Label>
                                    <p className="text-xs text-muted-foreground">يظهر بشريط أحمر مميز</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={formData.is_pinned}
                                    onCheckedChange={(c) => setFormData({ ...formData, is_pinned: c })}
                                />
                                <div className="space-y-0.5">
                                    <Label className="font-bold">تثبيت في الأعلى</Label>
                                    <p className="text-xs text-muted-foreground">يظهر في قائمة الأخبار المثبتة</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isSaving}
                            className="h-12 rounded-xl px-6"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-12 rounded-xl px-8 bg-primary hover:bg-primary/90 text-white font-bold"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                "حفظ ونشر"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
