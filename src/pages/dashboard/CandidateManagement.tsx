
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { CandidateProfile, CandidateAchievement } from "@/types/candidate";
import { toast } from "sonner";
import {
    Save,
    Plus,
    Trash2,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    ExternalLink,
    Edit2,
    Trophy,
    Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

export default function CandidateManagement() {
    const [profile, setProfile] = useState<Partial<CandidateProfile>>({
        full_name: "",
        title: "",
        bio: "",
        image_url: "",
        phone: "",
        whatsapp: "",
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: ""
    });
    const [achievements, setAchievements] = useState<CandidateAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<Partial<CandidateAchievement> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Check storage buckets for debugging
            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
            console.log("Available storage buckets:", buckets, bucketsError);

            const { data: profileData } = await (supabase
                .from("candidate_profile" as any)
                .select("*")
                .maybeSingle() as any);

            if (profileData) setProfile(profileData);

            const { data: achData } = await (supabase
                .from("candidate_achievements" as any)
                .select("*")
                .order("order", { ascending: true }) as any);

            if (achData) setAchievements(achData);
        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("خطأ في تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("يرجى اختيار ملف صورة صحيح");
            return;
        }

        // Validate file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `profile-${Date.now()}.${fileExt}`;

            // Try to upload to several possible bucket names as fallback
            const possibleBuckets = ['candidate-assets', 'request-attachments', 'attachments'];
            let lastError = null;
            let uploadData = null;
            let usedBucket = '';

            for (const bucketName of possibleBuckets) {
                console.log(`Trying upload to bucket: ${bucketName}`);
                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (!error) {
                    uploadData = data;
                    usedBucket = bucketName;
                    break;
                }
                lastError = error;
                console.warn(`Failed upload to ${bucketName}:`, error);
            }

            if (!uploadData) {
                console.error("Final upload error:", lastError);
                throw new Error("لم يتم العثور على أي مخزن ملفات متاح (Buckets). يرجى إنشاء مخزن باسم 'candidate-assets' في Supabase Dashboard.");
            }

            const { data: { publicUrl } } = supabase.storage
                .from(usedBucket)
                .getPublicUrl(fileName);

            setProfile(prev => ({ ...prev, image_url: publicUrl }));
            toast.success("تم رفع الصورة بنجاح");
        } catch (error: any) {
            console.error("Upload catch error:", error);
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            // Remove updated_at to let the DB trigger or our manual set handle it
            const { updated_at, ...profileData } = profile;

            console.log("Saving profile data:", profileData);

            // Use upsert with the existing ID if it exists, otherwise it will insert
            const { error, data } = await (supabase
                .from("candidate_profile" as any)
                .upsert({
                    ...profileData,
                    updated_at: new Date().toISOString()
                } as any) as any);

            if (error) {
                console.error("Save error detail:", error);
                throw new Error(error.message);
            }
            toast.success("تم حفظ البيانات بنجاح");
            fetchData();
        } catch (error: any) {
            console.error("Catch save error:", error);
            toast.error(`خطأ في حفظ البيانات: ${error.message || "عذرًا، تأكد من صلاحياتك"}`);
        } finally {
            setSaving(false);
        }
    };

    const handleAchievementSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAchievement?.title) return;

        try {
            if (editingAchievement.id) {
                const { error } = await supabase
                    .from("candidate_achievements" as any)
                    .update({
                        title: editingAchievement.title,
                        description: editingAchievement.description,
                        year: editingAchievement.year,
                        order: editingAchievement.order || 0
                    })
                    .eq("id", editingAchievement.id);
                if (error) throw error;
                toast.success("تم تحديث الإنجاز");
            } else {
                const { error } = await supabase
                    .from("candidate_achievements" as any)
                    .insert({
                        title: editingAchievement.title,
                        description: editingAchievement.description,
                        year: editingAchievement.year,
                        order: achievements.length
                    } as any);
                if (error) throw error;
                toast.success("تم إضافة الإنجاز");
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error("خطأ في الحفظ");
        }
    };

    const deleteAchievement = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الإنجاز؟")) return;
        try {
            const { error } = await supabase
                .from("candidate_achievements" as any)
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("تم الحذف");
            fetchData();
        } catch (error) {
            toast.error("خطأ في الحذف");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[#002B49]">إدارة صفحة المرشح</h1>
                        <p className="text-muted-foreground font-medium">تحكم في البيانات التي تظهر للجمهور في صفحة "عن المرشح"</p>
                    </div>
                    <Button variant="outline" className="gap-2 rounded-xl" asChild>
                        <a href="/about-candidate" target="_blank">
                            <ExternalLink className="w-4 h-4" />
                            عرض الصفحة العامة
                        </a>
                    </Button>
                </div>

                <Tabs defaultValue="basic" className="w-full" dir="rtl">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px] rounded-xl h-12 p-1">
                        <TabsTrigger value="basic" className="rounded-lg font-bold">المعلومات الأساسية</TabsTrigger>
                        <TabsTrigger value="achievements" className="rounded-lg font-bold">الإنجازات والأعمال</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="rounded-3xl border-border/50 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="font-black">البيانات الشخصية</CardTitle>
                                        <CardDescription>الاسم والوصف والنبذة التعريفية</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>الاسم الكامل</Label>
                                                <Input
                                                    value={profile.full_name}
                                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                                    placeholder="مثال: ا. نبيل أبو وردة"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الصفة / اللقب</Label>
                                                <Input
                                                    value={profile.title || ""}
                                                    onChange={e => setProfile({ ...profile, title: e.target.value })}
                                                    placeholder="مثال: نائب دائرة المنصورة"
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>النبذة التعريفية</Label>
                                            <Textarea
                                                value={profile.bio || ""}
                                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                                placeholder="اكتب سيرة ذاتية مفصلة..."
                                                className="rounded-2xl min-h-[200px] leading-relaxed"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-border/50 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="font-black">روابط التواصل الاجتماعي</CardTitle>
                                        <CardDescription>الروابط التي ستظهر في قسم التواصل</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>رقم الهاتف</Label>
                                            <Input value={profile.phone || ""} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="01xxxxxxxxx" className="rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>رقم الواتساب</Label>
                                            <Input value={profile.whatsapp || ""} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} placeholder="201xxxxxxxxx" className="rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>رابط فيسبوك</Label>
                                            <Input value={profile.facebook || ""} onChange={e => setProfile({ ...profile, facebook: e.target.value })} className="rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>رابط تويتر (X)</Label>
                                            <Input value={profile.twitter || ""} onChange={e => setProfile({ ...profile, twitter: e.target.value })} className="rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>رابط انستجرام</Label>
                                            <Input value={profile.instagram || ""} onChange={e => setProfile({ ...profile, instagram: e.target.value })} className="rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>رابط لينكن إن</Label>
                                            <Input value={profile.linkedin || ""} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} className="rounded-xl" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-8">
                                <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="font-black">الصورة الرسمية</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="aspect-[3/4] rounded-2xl bg-muted flex flex-col items-center justify-center border-2 border-dashed border-border overflow-hidden relative group">
                                            {profile.image_url ? (
                                                <>
                                                    <img src={profile.image_url} alt="Candidate" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>تغيير</Button>
                                                        <Button variant="destructive" size="sm" onClick={() => setProfile({ ...profile, image_url: "" })}>حذف</Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-6 cursor-pointer hover:bg-muted/50 w-full h-full flex flex-col items-center justify-center transition-colors" onClick={() => fileInputRef.current?.click()}>
                                                    {uploading ? (
                                                        <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                                                    ) : (
                                                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                                                    )}
                                                    <p className="text-sm font-bold text-[#002B49]">{uploading ? "جاري الرفع..." : "انقر لرفع الصورة الرسمية"}</p>
                                                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG (Max 5MB)</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <div className="space-y-2">
                                            <Label>أو أدخل رابط الصورة مباشرة</Label>
                                            <Input
                                                value={profile.image_url || ""}
                                                onChange={e => setProfile({ ...profile, image_url: e.target.value })}
                                                placeholder="https://example.com/image.jpg"
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Button
                                    className="w-full h-16 rounded-2xl bg-gold hover:bg-gold/90 text-[#002B49] font-black text-lg gap-3 shadow-xl shadow-gold/20 transition-all hover:scale-[1.02]"
                                    onClick={saveProfile}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    حفظ كافة التغييرات
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="achievements" className="mt-8">
                        <Card className="rounded-3xl border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="font-black text-2xl">سجل الإنجازات</CardTitle>
                                    <CardDescription>إضافة وتعديل الأعمال السابقة</CardDescription>
                                </div>
                                <Button className="rounded-xl gap-2 h-12 px-6" onClick={() => {
                                    setEditingAchievement({});
                                    setIsDialogOpen(true);
                                }}>
                                    <Plus className="w-5 h-5" />
                                    إضافة إنجاز جديد
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {achievements.length === 0 ? (
                                        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                                            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                            <p className="text-muted-foreground font-medium">لا توجد إنجازات مضافة حالياً</p>
                                        </div>
                                    ) : (
                                        achievements.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-6 bg-card border border-border/50 rounded-2xl hover:border-primary/20 hover:shadow-md transition-all group">
                                                <div className="cursor-grab text-muted-foreground hover:text-primary">
                                                    <GripVertical className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-black text-[#002B49]">{item.title}</h4>
                                                        {item.year && <span className="text-xs px-2 py-0.5 bg-primary/5 text-primary rounded-md font-bold">{item.year}</span>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="rounded-lg text-primary hover:bg-primary/5" onClick={() => {
                                                        setEditingAchievement(item);
                                                        setIsDialogOpen(true);
                                                    }}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="rounded-lg text-destructive hover:bg-destructive/5" onClick={() => deleteAchievement(item.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Achievement Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] rounded-[2rem] gap-0 p-0 overflow-hidden border-none shadow-2xl" dir="rtl">
                        <form onSubmit={handleAchievementSave}>
                            <DialogHeader className="p-8 bg-[#002B49] text-white">
                                <DialogTitle className="text-2xl font-black">
                                    {editingAchievement?.id ? "تعديل إنجاز" : "إضافة إنجاز جديد"}
                                </DialogTitle>
                                <DialogDescription className="text-white/60">
                                    املأ البيانات التالية ليظهر الإنجاز في الصفحة العامة
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>عنوان الإنجاز</Label>
                                        <Input
                                            value={editingAchievement?.title || ""}
                                            onChange={e => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                                            placeholder="مثال: تطوير المركز الطبي بالمنصورة"
                                            className="rounded-xl h-12"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>العام / التاريخ</Label>
                                        <Input
                                            value={editingAchievement?.year || ""}
                                            onChange={e => setEditingAchievement({ ...editingAchievement, year: e.target.value })}
                                            placeholder="مثال: 2023"
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>الوصف التفصيلي</Label>
                                    <Textarea
                                        value={editingAchievement?.description || ""}
                                        onChange={e => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                                        placeholder="اكتب تفاصيل الإنجاز والنتائج المترتبة عليه..."
                                        className="rounded-2xl min-h-[120px]"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="p-8 border-t border-border/50 gap-4">
                                <Button type="button" variant="outline" className="rounded-xl h-12 px-8" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                                <Button type="submit" className="rounded-xl h-12 px-8 font-black">حفظ الإنجاز</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
