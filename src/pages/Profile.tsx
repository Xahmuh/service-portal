
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    Mail,
    Phone,
    IdCard,
    Briefcase,
    MapPin,
    Heart,
    Users,
    Save,
    Edit2,
    X,
    Loader2,
    Calendar,
    Building2
} from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const Profile = () => {
    const { profile, user, isLoading: authLoading, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [areas, setAreas] = useState<{ id: string; name: string; district?: string | null }[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        national_id: "",
        gender: "" as "male" | "female" | "",
        job_title: "",
        marital_status: "" as "single" | "married" | "divorced" | "widowed" | "",
        address: "",
        area_id: "",
    });

    useEffect(() => {
        fetchAreas();
    }, []);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phone: profile.phone || "",
                email: profile.email || "",
                national_id: profile.national_id || "",
                gender: profile.gender || "",
                job_title: profile.job_title || "",
                marital_status: profile.marital_status || "",
                address: profile.address || "",
                area_id: profile.area_id || "",
            });
        }
    }, [profile]);

    useEffect(() => {
        if (formData.area_id && areas.length > 0) {
            const area = areas.find(a => a.id === formData.area_id);
            if (area) {
                // Try to find district from DB or from mapping
                if (area.district) {
                    setSelectedDistrict(area.district);
                } else {
                    for (const [district, neighborhoodNames] of Object.entries(MANSOURA_DISTRICTS)) {
                        if (neighborhoodNames.includes(area.name)) {
                            setSelectedDistrict(district);
                            break;
                        }
                    }
                }
            }
        }
    }, [formData.area_id, areas]);

    const fetchAreas = async () => {
        const { data, error } = await supabase.from("areas").select("id, name");
        if (error) {
            console.error("Error fetching areas:", error);
        } else {
            const enrichedAreas = (data || []).map(area => {
                for (const [district, neighborhoods] of Object.entries(MANSOURA_DISTRICTS)) {
                    if (neighborhoods.includes(area.name)) {
                        return { ...area, district };
                    }
                }
                return area;
            });
            setAreas(enrichedAreas);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            console.log('Updating profile with data:', formData);

            const { data, error } = await supabase
                .from("profiles")
                .update({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    national_id: formData.national_id,
                    gender: formData.gender || null,
                    job_title: formData.job_title,
                    marital_status: formData.marital_status || null,
                    address: formData.address,
                    area_id: formData.area_id || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id)
                .select();

            if (error) {
                console.error('Update error:', error);
                throw error;
            }

            console.log('Update successful, data:', data);

            toast.success("تم تحديث الملف الشخصي بنجاح");

            // Refresh profile data from the database
            const updatedProfile = await refreshProfile();

            // Update formData with the fresh data
            if (updatedProfile) {
                console.log('Updating formData with fresh data:', updatedProfile);
                setFormData({
                    name: updatedProfile.name || "",
                    phone: updatedProfile.phone || "",
                    email: updatedProfile.email || "",
                    national_id: updatedProfile.national_id || "",
                    gender: updatedProfile.gender || "",
                    job_title: updatedProfile.job_title || "",
                    marital_status: updatedProfile.marital_status || "",
                    address: updatedProfile.address || "",
                    area_id: updatedProfile.area_id || "",
                });
            }

            setIsEditing(false);

            // Force reload to ensure UI is in sync
            setTimeout(() => {
                window.location.reload();
            }, 300);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error("خطأ في تحديث البيانات: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    const getGenderText = (gender: string) => {
        if (gender === "male") return "ذكر";
        if (gender === "female") return "أنثى";
        return "غير محدد";
    };

    const getMaritalStatusText = (status: string) => {
        switch (status) {
            case "single": return "أعزب/عزباء";
            case "married": return "متزوج/متزوجة";
            case "divorced": return "مطلق/مطلقة";
            case "widowed": return "أرمل/أرملة";
            default: return "غير محدد";
        }
    };

    const getAreaName = (areaId: string) => {
        return areas.find(a => a.id === areaId)?.name || "غير محدد";
    };

    return (
        <MainLayout>
            <div className="bg-gradient-to-b from-[#002B49]/5 to-background min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-xl shadow-[#002B49]/5 border border-[#002B49]/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#002B49]/5 rounded-full -ml-16 -mb-16 blur-3xl" />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#002B49] to-[#003d6d] flex items-center justify-center text-white shadow-2xl">
                                <User className="w-10 h-10 sm:w-12 sm:h-12" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-[#002B49] mb-1">{profile?.name || "المواطن"}</h1>
                                <p className="text-[#D4AF37] font-bold flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    حساب مواطن معتمد
                                </p>
                            </div>
                        </div>

                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#002B49] hover:bg-[#003d6d] text-white rounded-xl px-6 py-6 h-auto font-bold flex items-center gap-2 relative z-10"
                            >
                                <Edit2 className="w-4 h-4" />
                                تعديل البيانات
                            </Button>
                        )}
                    </div>

                    <form onSubmit={handleUpdateProfile}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Personal Information */}
                            <Card className="rounded-[1.5rem] border-[#002B49]/10 shadow-lg overflow-hidden">
                                <CardHeader className="bg-[#002B49]/5 border-b border-[#002B49]/10">
                                    <CardTitle className="text-lg font-black text-[#002B49] flex items-center gap-2">
                                        <User className="w-5 h-5 text-[#D4AF37]" />
                                        المعلومات الشخصية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[#002B49]/60 font-bold px-1">الاسم بالكامل</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="rounded-xl border-[#002B49]/10 focus:ring-[#D4AF37]/20 h-12"
                                                required
                                            />
                                        ) : (
                                            <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold">
                                                {formData.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[#002B49]/60 font-bold px-1">الجنس</Label>
                                            {isEditing ? (
                                                <Select
                                                    value={formData.gender}
                                                    onValueChange={(val: any) => setFormData({ ...formData, gender: val })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-[#002B49]/10 h-12">
                                                        <SelectValue placeholder="اختر الجنس" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">ذكر</SelectItem>
                                                        <SelectItem value="female">أنثى</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold">
                                                    {getGenderText(formData.gender)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#002B49]/60 font-bold px-1">الحالة الاجتماعية</Label>
                                            {isEditing ? (
                                                <Select
                                                    value={formData.marital_status}
                                                    onValueChange={(val: any) => setFormData({ ...formData, marital_status: val })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-[#002B49]/10 h-12">
                                                        <SelectValue placeholder="اختر الحالة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">أعزب/عزباء</SelectItem>
                                                        <SelectItem value="married">متزوج/متزوجة</SelectItem>
                                                        <SelectItem value="divorced">مطلق/مطلقة</SelectItem>
                                                        <SelectItem value="widowed">أرمل/أرملة</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold">
                                                    {getMaritalStatusText(formData.marital_status)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[#002B49]/60 font-bold px-1">رقم البطاقة الشخصية</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.national_id}
                                                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                                className="rounded-xl border-[#002B49]/10 focus:ring-[#D4AF37]/20 h-12"
                                                dir="ltr"
                                            />
                                        ) : (
                                            <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold font-mono">
                                                {formData.national_id || "غير مسجل"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[#002B49]/60 font-bold px-1">الوظيفة</Label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Input
                                                    value={formData.job_title}
                                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                                    className="rounded-xl border-[#002B49]/10 focus:ring-[#D4AF37]/20 h-12 pr-10"
                                                />
                                                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002B49]/30" />
                                            </div>
                                        ) : (
                                            <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold">
                                                {formData.job_title || "غير مسجل"}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact & Address */}
                            <Card className="rounded-[1.5rem] border-[#002B49]/10 shadow-lg overflow-hidden">
                                <CardHeader className="bg-[#002B49]/5 border-b border-[#002B49]/10">
                                    <CardTitle className="text-lg font-black text-[#002B49] flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-[#D4AF37]" />
                                        معلومات التواصل والعنوان
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[#002B49]/60 font-bold px-1">البريد الإلكتروني</Label>
                                        <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49]/40 font-bold">
                                            <Mail className="w-4 h-4 ml-3" />
                                            {formData.email}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground px-1 italic">لا يمكن تعديل البريد الإلكتروني الأساسي</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[#002B49]/60 font-bold px-1">رقم الهاتف</Label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="rounded-xl border-[#002B49]/10 focus:ring-[#D4AF37]/20 h-12 pr-10"
                                                    dir="ltr"
                                                />
                                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002B49]/30" />
                                            </div>
                                        ) : (
                                            <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold" dir="ltr">
                                                {formData.phone || "غير مسجل"}
                                            </div>
                                        )}
                                    </div>

                                    {/* District & Area Selection Hierarchy */}
                                    {isEditing ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[#002B49]/60 font-bold px-1">الحي</Label>
                                                <Select
                                                    value={selectedDistrict}
                                                    onValueChange={(val) => {
                                                        setSelectedDistrict(val);
                                                        setFormData({ ...formData, area_id: "" });
                                                    }}
                                                >
                                                    <SelectTrigger className="rounded-xl border-[#002B49]/10 h-12">
                                                        <SelectValue placeholder="اختر الحي" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.keys(MANSOURA_DISTRICTS).map((district) => (
                                                            <SelectItem key={district} value={district}>
                                                                {district}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[#002B49]/60 font-bold px-1">المنطقة</Label>
                                                <Select
                                                    value={formData.area_id}
                                                    onValueChange={(val) => setFormData({ ...formData, area_id: val })}
                                                    disabled={!selectedDistrict}
                                                >
                                                    <SelectTrigger className="rounded-xl border-[#002B49]/10 h-12">
                                                        <SelectValue placeholder={!selectedDistrict ? "اختر الحي أولاً" : "اختر المنطقة"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedDistrict && MANSOURA_DISTRICTS[selectedDistrict]
                                                            .sort((a, b) => a.localeCompare(b, 'ar'))
                                                            .map((areaName) => {
                                                                const dbArea = areas.find(a => a.name === areaName);
                                                                return (
                                                                    <SelectItem
                                                                        key={areaName}
                                                                        value={dbArea?.id || `pending-${areaName}`}
                                                                        disabled={!dbArea}
                                                                    >
                                                                        {areaName} {!dbArea && "(غير مفعّلة)"}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="text-[#002B49]/60 font-bold px-1">المنطقة</Label>
                                            <div className="h-12 flex items-center px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold">
                                                {selectedDistrict ? `${selectedDistrict} - ` : ""}{getAreaName(formData.area_id)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-[#002B49]/60 font-bold px-1">العنوان بالتفصيل</Label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Input
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="rounded-xl border-[#002B49]/10 focus:ring-[#D4AF37]/20 h-12 pr-10"
                                                />
                                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002B49]/30" />
                                            </div>
                                        ) : (
                                            <div className="min-h-12 flex items-start py-3 px-4 bg-[#002B49]/5 rounded-xl text-[#002B49] font-bold">
                                                {formData.address || "غير مسجل"}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {isEditing && (
                            <div className="mt-8 flex items-center justify-end gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-xl h-12 px-8 border-[#002B49]/10 hover:bg-[#002B49]/5 font-bold"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[#D4AF37] hover:bg-[#b8962d] text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-[#D4AF37]/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 ml-2" />
                                            حفظ التغييرات
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default Profile;
