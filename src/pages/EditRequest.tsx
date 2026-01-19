import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Send,
    Upload,
    MapPin,
    User,
    FileText,
    AlertCircle,
    Loader2,
    Paperclip,
    Navigation,
    XCircle,
    ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

interface Area {
    id: string;
    name: string;
    district: string | null;
}

interface RequestType {
    id: string;
    name: string;
}

const MANSOURA_DISTRICTS: Record<string, string[]> = {
    "حي شرق المنصورة": [
        "قولنجيل", "جديلة", "قناة السويس", "توريل القديمة", "توريل الجديدة", "الدراسات",
        "كفر البدماص", "عزبة الشال", "عزبة الصفيح", "عزبة الهويس", "مجمع المحاكم",
        "مدينة مبارك", "تقسيم أبوالليل", "مدينة السلام", "المرور", "المختلط",
        "مساكن الشناوي", "عزبة عقل", "شارع ١٠", "الجوازات", "المديرية"
    ],
    "حي غرب المنصورة": [
        "سندوب", "عزبة الحلواني", "المجزر", "مدينة الفردوس", "حي الأشجار",
        "عبدالسلام عارف", "الترعة", "الصدر", "النخلة", "آداب", "الثانوية", "الجلاء",
        "الحوار", "محمد فتحي", "الطميهي", "العباسي", "المدير", "بورسعيد", "السلخانة",
        "الشيخ حسانين", "السكة الجديدة", "السكة القديمة", "ميت حدر", "بنك مصر",
        "الحسينية", "حسين بك", "المشاية (علوي)", "المشاية (سفلي)", "جيهان",
        "حي الجامعة", "الزعفران", "أحمد ماهر", "تقسيم سامية الجمل", "تقسيم خطاب"
    ]
};

const REQUEST_CATEGORIES = [
    "صحة", "تعليم", "صرف صحي", "مرافق (كهرباء/مياه)", "خدمات عامة", "شرطة",
    "مياه الشرب", "الكهرباء", "الغاز الطبيعي", "طرق", "مرور", "النقل والمواصلات",
    "إسكان", "محليات", "بيئة ونظافة", "مخلفات وقمامة", "إنارة شوارع",
    "أسواق ومحلات تجارية", "تموين وضبط الأسعار", "زراعة", "ترع ومصارف", "طب بيطري",
    "اتصالات وإنترنت", "أمن وسلامة", "تكافل اجتماعي", "شباب ورياضة",
    "مباني مخالفة وتعديات", "مواقف ونقل عام", "إزعاج وضوضاء",
    "النيل والمجاري المائية", "تراخيص", "شكاوى عاجلة", "أخرى"
];

const requestSchema = z.object({
    type_id: z.string().min(1, "يرجى اختيار نوع الطلب"),
    area_id: z.string().min(1, "يرجى اختيار المنطقة"),
    subject: z.string().min(5, "يجب أن يكون العنوان 5 أحرف على الأقل").max(200, "العنوان طويل جداً"),
    description: z.string().min(20, "يجب أن يكون الوصف 20 حرف على الأقل").max(2000, "الوصف طويل جداً"),
});

const EditRequest = () => {
    const { id } = useParams();
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
    const [referenceNumber, setReferenceNumber] = useState<string>("");

    const [formData, setFormData] = useState({
        area_id: "",
        address: "",
        type_id: "",
        description: "",
        subject: "",
    });

    const [files, setFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
            return;
        }

        if (user && id) {
            init();
        }
    }, [user, id, authLoading]);

    const init = async () => {
        setIsLoading(true);
        await Promise.all([fetchData(), fetchRequestData()]);
        setIsLoading(false);
    };

    const fetchData = async () => {
        const [areasRes, typesRes] = await Promise.all([
            supabase.from("areas").select("id, name, district").order("name"),
            supabase.from("request_types").select("id, name").order("name"),
        ]);

        if (areasRes.data) {
            const enrichedAreas = areasRes.data.map(area => {
                if (!area.district) {
                    for (const [district, neighborhoodNames] of Object.entries(MANSOURA_DISTRICTS)) {
                        if (neighborhoodNames.includes(area.name)) {
                            return { ...area, district };
                        }
                    }
                }
                return area;
            });
            setAreas(enrichedAreas);
        }
        if (typesRes.data) setRequestTypes(typesRes.data);
    };

    const fetchRequestData = async () => {
        try {
            const { data, error } = await supabase
                .from("requests")
                .select(`
          *,
          area:areas(id, name, district),
          attachments(*)
        `)
                .eq("id", id)
                .eq("citizen_id", user?.id)
                .single() as any;

            if (error || !data) {
                toast.error("لم يتم العثور على الطلب أو لا تملك صلاحية تعديله");
                navigate("/requests");
                return;
            }

            // Check if it's within 6 hours
            const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
            if (new Date(data.created_at) < sixHoursAgo) {
                toast.error("عذراً، انتهت المهلة المتاحة لتعديل الطلب (6 ساعات)");
                navigate("/requests");
                return;
            }

            if (["cancelled", "closed"].includes(data.status)) {
                toast.error("لا يمكن تعديل طلب مغلق أو ملغي");
                navigate("/requests");
                return;
            }

            setReferenceNumber(data.reference_number || data.id.slice(0, 8));
            setFormData({
                area_id: data.area_id,
                address: data.location_address || "",
                type_id: data.type_id,
                description: data.description,
                subject: data.subject,
            });

            const area = data.area as unknown as Area;
            if (area && area.district) {
                setSelectedDistrict(area.district);
            } else if (area) {
                // Fallback district logic
                for (const [dist, names] of Object.entries(MANSOURA_DISTRICTS)) {
                    if (names.includes(area.name)) {
                        setSelectedDistrict(dist);
                        break;
                    }
                }
            }

            setExistingAttachments(data.attachments || []);
            if (data.latitude && data.longitude) {
                setLocation({ lat: data.latitude, lng: data.longitude });
            }
        } catch (error) {
            console.error("Error fetching request:", error);
            toast.error("حدث خطأ أثناء تحميل بيانات الطلب");
            navigate("/requests");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const deleteExistingAttachment = async (attachmentId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المرفق؟")) return;

        try {
            const attachment = existingAttachments.find(a => a.id === attachmentId);
            if (!attachment) return;

            // Extract path from public URL
            const url = new URL(attachment.file_url);
            const pathParts = url.pathname.split('/');
            const storagePath = pathParts.slice(pathParts.indexOf('request-attachments') + 1).join('/');

            await supabase.storage.from('request-attachments').remove([storagePath]);
            await supabase.from('attachments').delete().eq("id", attachmentId);

            setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
            toast.success("تم حذف المرفق");
        } catch (error) {
            toast.error("حدث خطأ أثناء حذف المرفق");
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("المتصفح لا يدعم تحديد الموقع");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setIsLocating(false);
                toast.success("تم تحديد الموقع بنجاح");
            },
            () => {
                toast.error("فشل في تحديد الموقع");
                setIsLocating(false);
            }
        );
    };

    const handleSubmit = async () => {
        const result = requestSchema.safeParse({
            ...formData,
            subject: formData.subject || formData.description.slice(0, 100),
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach(err => {
                if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
            });
            setErrors(fieldErrors);
            toast.error("يرجى تصحيح الأخطاء");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error: updateError } = await supabase
                .from("requests")
                .update({
                    type_id: formData.type_id,
                    area_id: formData.area_id,
                    subject: formData.subject || formData.description.slice(0, 100),
                    description: formData.description.trim(),
                    latitude: location?.lat,
                    longitude: location?.lng,
                    location_address: formData.address
                })
                .eq("id", id);

            if (updateError) throw updateError;

            // Upload new files
            if (files.length > 0) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${id}/${crypto.randomUUID()}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('request-attachments').upload(fileName, file);
                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage.from('request-attachments').getPublicUrl(fileName);
                        await supabase.from('attachments').insert({
                            request_id: id,
                            file_url: publicUrl,
                            file_name: file.name,
                            file_type: file.type,
                            uploaded_by: user!.id
                        });
                    }
                }
            }

            toast.success("تم تحديث الطلب بنجاح");
            navigate("/requests");
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ أثناء التحديث");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-background">
                <div className="hero-gradient py-8">
                    <div className="container">
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
                                    <Link to="/requests"><ArrowLeft /></Link>
                                </Button>
                                <div>
                                    <h1 className="text-xl font-bold text-white">تعديل الطلب</h1>
                                    <p className="text-white/70 text-sm">رقم المرجع: {referenceNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container py-8">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="bg-card rounded-3xl border border-border/50 shadow-elevated p-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <User className="h-5 w-5 text-accent" /> المنطقة والحي
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>الحي</Label>
                                            <Select value={selectedDistrict} onValueChange={(v) => { setSelectedDistrict(v); setFormData(p => ({ ...p, area_id: "" })); }}>
                                                <SelectTrigger className="h-14 rounded-xl border-border/50 font-bold">
                                                    <SelectValue placeholder="اختر الحي" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border font-bold">
                                                    {Object.keys(MANSOURA_DISTRICTS).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>المنطقة</Label>
                                            <Select value={formData.area_id} onValueChange={(v) => setFormData(p => ({ ...p, area_id: v }))} disabled={!selectedDistrict}>
                                                <SelectTrigger className="h-14 rounded-xl border-border/50 font-bold">
                                                    <SelectValue placeholder="اختر المنطقة" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border font-bold max-h-[300px]">
                                                    {selectedDistrict && MANSOURA_DISTRICTS[selectedDistrict].sort().map(name => {
                                                        const dbArea = areas.find(a => a.name === name);
                                                        return <SelectItem key={name} value={dbArea?.id || ""} disabled={!dbArea}>{name}</SelectItem>
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>العنوان بالتفصيل</Label>
                                    <Textarea className="min-h-[100px] rounded-xl border-border/50" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} />
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-accent" /> موضوع الطلب
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>الفئة</Label>
                                            <Select value={formData.type_id} onValueChange={(v) => setFormData(p => ({ ...p, type_id: v }))}>
                                                <SelectTrigger className="h-14 rounded-xl border-border/50 font-bold">
                                                    <SelectValue placeholder="اختر الفئة" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border font-bold max-h-[300px]">
                                                    {REQUEST_CATEGORIES.sort().map(c => {
                                                        const dbT = requestTypes.find(t => t.name === c);
                                                        return <SelectItem key={c} value={dbT?.id || ""} disabled={!dbT}>{c}</SelectItem>
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>عنوان الطلب</Label>
                                            <Input className="h-14 rounded-xl border-border/50" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>الوصف</Label>
                                            <Textarea className="min-h-[150px] rounded-xl border-border/50" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-accent" /> المرفقات
                                    </h3>

                                    {existingAttachments.length > 0 && (
                                        <div className="mb-6 space-y-2">
                                            <Label className="text-xs text-muted-foreground block mb-2">المرفقات الحالية:</Label>
                                            {existingAttachments.map((att) => (
                                                <div key={att.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                                                    <div className="flex items-center gap-2">
                                                        <Paperclip className="h-4 w-4" />
                                                        <a href={att.file_url} target="_blank" rel="noreferrer" className="text-sm hover:underline">{att.file_name}</a>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteExistingAttachment(att.id)} className="h-8 w-8 text-destructive"><XCircle className="h-4 w-4" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative border-2 border-dashed border-accent/30 rounded-2xl p-6 text-center hover:bg-accent/5 transition-colors cursor-pointer group">
                                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                                        <Upload className="h-8 w-8 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-sm font-medium">رفع مرفقات جديدة</p>
                                    </div>
                                    {files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {files.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 bg-accent/5 rounded-lg border border-accent/20">
                                                    <span className="text-xs truncate">{f.name}</span>
                                                    <XCircle className="h-4 w-4 text-destructive cursor-pointer" onClick={() => removeFile(i)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-accent" /> الموقع الجغرافي
                                    </h3>
                                    <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-center gap-2" onClick={handleGetLocation} disabled={isLocating}>
                                        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                                        {location ? "تحديث الموقع الحالي" : "تحديد الموقع الحالي"}
                                    </Button>
                                    {location && (
                                        <p className="text-xs text-center mt-2 text-emerald-600 font-mono" dir="ltr">
                                            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <Button variant="outline" size="lg" className="flex-1 h-14 rounded-xl" onClick={() => navigate("/requests")}>إلغاء</Button>
                                <Button size="lg" className="flex-[2] h-14 rounded-xl bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="h-5 w-5 ml-2 animate-spin" /> جاري الحفظ...</> : "حفظ التغييرات"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default EditRequest;
