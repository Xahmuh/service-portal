import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
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
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Navigation,
  XCircle
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

const steps = [
  { id: 1, title: "البيانات الشخصية", icon: User },
  { id: 2, title: "تفاصيل الطلب", icon: FileText },
  { id: 3, title: "المرفقات والموقع", icon: MapPin },
];

const NewRequest = () => {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && userRole && (userRole.role === "candidate" || userRole.role === "staff")) {
      toast.error("عذراً، لا يمكنك تقديم طلبات بصفتك موظف أو مرشح");
      navigate("/");
    }
  }, [userRole, authLoading, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [successData, setSuccessData] = useState<{ id: string; referenceNumber: string } | null>(null);
  const [profile, setProfile] = useState<{ name: string; phone: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    area_id: "",
    address: "",
    request_type: "complaint", // complaint or service
    type_id: "",
    description: "",
    subject: "",
  });

  // Advanced Features State
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchData = async () => {
    const [areasRes, typesRes] = await Promise.all([
      supabase.from("areas").select("id, name, district").order("name"),
      supabase.from("request_types").select("id, name").order("name"),
    ]);

    if (areasRes.data) {
      // Enrich areas with district if missing in DB
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

  // Sync selectedDistrict when area_id changes (from profile)
  useEffect(() => {
    if (formData.area_id && areas.length > 0 && !selectedDistrict) {
      const area = areas.find(a => a.id === formData.area_id);
      if (area && area.district) {
        setSelectedDistrict(area.district);
      }
    }
  }, [formData.area_id, areas, selectedDistrict]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData(prev => ({
        ...prev,
        name: data.name || "",
        phone: data.phone || "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
        toast.success("تم تحديد الموقع بنجاح");
      },
      (error) => {
        console.error(error);
        toast.error("فشل في تحديد الموقع، يرجى تفعيل الخدمة");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لتقديم طلب");
      navigate("/login");
      return;
    }

    const result = requestSchema.safeParse({
      type_id: formData.type_id,
      area_id: formData.area_id,
      subject: formData.subject || formData.description.slice(0, 100),
      description: formData.description,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // 1. Create Request
      const { data: requestData, error: requestError } = await supabase
        .from("requests")
        .insert({
          citizen_id: user.id,
          type_id: formData.type_id,
          area_id: formData.area_id,
          priority: "medium",
          subject: formData.subject || formData.description.slice(0, 100),
          description: formData.description.trim(),
          status: "new",
          latitude: location?.lat,
          longitude: location?.lng,
          location_address: formData.address
        })
        .select("id, reference_number")
        .single();

      if (requestError) throw requestError;
      if (!requestData) throw new Error("فشل إنشاء الطلب");

      // 2. Upload Attachments
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${requestData.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('request-attachments')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('request-attachments')
              .getPublicUrl(fileName);

            await supabase.from('attachments').insert({
              request_id: requestData.id,
              file_url: publicUrl,
              file_name: file.name,
              file_type: file.type,
              uploaded_by: user.id
            });
          }
        }
      }

      // 3. Notify Staff
      try {
        const { data: staffUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['staff', 'candidate']);

        if (staffUsers && staffUsers.length > 0) {
          const notifications = staffUsers.map(staff => ({
            user_id: staff.user_id,
            title: "طلب جديد وارد",
            message: `تم تقديم طلب جديد رقم ${requestData.reference_number} في منطقة ${selectedDistrict}`,
            type: "info"
          }));
          await supabase.from('system_notifications').insert(notifications);
        }
      } catch (e) {
        console.error("Non-critical notification error:", e);
      }

      setSuccessData({
        id: requestData.id,
        referenceNumber: requestData.reference_number || requestData.id
      });
      toast.success("تم إرسال طلبك بنجاح!");
    } catch (error: any) {
      console.error("Error submitting request:", error);
      let errorMessage = "حدث خطأ أثناء إرسال الطلب";

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "فشل الاتصال بالخادم، يرجى التأكد من اتصالك بالإنترنت";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (successData?.referenceNumber) {
      navigator.clipboard.writeText(successData.referenceNumber);
      toast.success("تم نسخ رقم الطلب");
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  if (successData) {
    return (
      <MainLayout>
        <section className="py-20">
          <div className="container max-w-lg">
            <div className="bg-card rounded-3xl border border-emerald-200 shadow-elevated text-center p-10">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                تم إرسال طلبك بنجاح!
              </h2>
              <p className="text-muted-foreground mb-8">
                سيتم مراجعة طلبك من قبل الفريق المختص
              </p>

              <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-3">الرقم المرجعي للطلب:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-xl bg-background px-6 py-3 rounded-xl font-mono border-2 border-accent/20 text-accent font-black">
                    {successData.referenceNumber}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopyId} className="h-12 w-12 rounded-xl">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full h-14 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold">
                  <a href={`/track-request?ref=${successData.referenceNumber}`}>
                    تتبع الطلب الآن
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="w-full h-14 rounded-xl" asChild>
                  <a href="/requests">
                    عرض جميع طلباتي
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <HeroSection
          badge="الخدمات الرقمية"
          title="تقديم طلب جديد"
          description="يرجى ملء النموذج التالي لتقديم طلبك أو شكواك وسنقوم بمتابعتها في أسرع وقت."
          showSearch={false}
        />

        {/* Stepper */}
        <div className="bg-card border-b border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto py-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div className="flex items-center w-full">
                        {index > 0 && (
                          <div className={`h-0.5 flex-1 ${isCompleted || isActive ? 'bg-accent' : 'bg-border'}`} />
                        )}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                            ? 'bg-accent text-white'
                            : isActive
                              ? 'bg-accent text-white ring-4 ring-accent/20'
                              : 'bg-muted text-muted-foreground'
                            }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-accent' : 'bg-border'}`} />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-accent' : 'text-muted-foreground'
                        }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="container py-8">
          <div className="max-w-3xl mx-auto">
            {!user && !authLoading && (
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-accent flex-shrink-0" />
                <p className="text-foreground text-sm">
                  يجب تسجيل الدخول لتقديم طلب.{" "}
                  <a href="/login" className="font-semibold text-accent hover:underline">سجل الدخول</a>
                  {" "}أو{" "}
                  <a href="/login" className="font-semibold text-accent hover:underline">أنشئ حساباً جديداً</a>
                </p>
              </div>
            )}

            <div className="bg-card rounded-3xl border border-border/50 shadow-elevated overflow-hidden">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        رقم الهاتف <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        className="h-14 rounded-xl bg-muted/30 border-border/50"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        الاسم <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="الاسم الثلاثي"
                        className="h-14 rounded-xl bg-muted/30 border-border/50"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-border/50">
                    <div className="flex items-center gap-2 text-[#002B49] mb-6">
                      <MapPin className="h-5 w-5 text-[#D4AF37]" />
                      <span className="text-base font-black">عنوان السكن (المنصورة)</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* District Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-black text-[#002B49]/70 block mb-2">
                          الحي <span className="text-destructive font-black">*</span>
                        </Label>
                        <Select
                          value={selectedDistrict}
                          onValueChange={(value) => {
                            setSelectedDistrict(value);
                            setFormData(prev => ({ ...prev, area_id: "" }));
                          }}
                        >
                          <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-border/50 focus:ring-accent/20 focus:border-accent font-bold">
                            <SelectValue placeholder="اختر الحي" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border shadow-xl">
                            {Object.keys(MANSOURA_DISTRICTS).map((district) => (
                              <SelectItem key={district} value={district} className="font-bold py-3 cursor-pointer">
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Neighborhood Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-black text-[#002B49]/70 block mb-2">
                          المنطقة <span className="text-destructive font-black">*</span>
                        </Label>
                        <Select
                          value={formData.area_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, area_id: value }))}
                          disabled={!selectedDistrict}
                        >
                          <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-border/50 focus:ring-accent/20 focus:border-accent font-bold disabled:opacity-50">
                            <SelectValue placeholder={!selectedDistrict ? "اختر الحي أولاً" : "اختر المنطقة"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border shadow-xl max-h-[300px]">
                            {selectedDistrict && MANSOURA_DISTRICTS[selectedDistrict]
                              .sort((a, b) => a.localeCompare(b, 'ar'))
                              .map((areaName) => {
                                const dbArea = areas.find(a => a.name === areaName);
                                return (
                                  <SelectItem
                                    key={areaName}
                                    value={dbArea?.id || `pending-${areaName}`}
                                    className="font-bold py-3 cursor-pointer"
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

                    <div className="mt-6 space-y-2">
                      <Label className="text-sm font-medium">
                        العنوان بالتفصيل <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="اسم الشارع، رقم العقار، أقرب معلم..."
                        className="min-h-[100px] rounded-xl bg-muted/30 border-border/50 resize-none"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Request Details */}
              {currentStep === 2 && (
                <div className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        نوع الطلب <span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, request_type: "complaint" }))}
                          className={`p-4 rounded-xl border-2 transition-all ${formData.request_type === "complaint"
                            ? 'border-destructive bg-destructive/5'
                            : 'border-border hover:border-muted-foreground'
                            }`}
                        >
                          <AlertCircle className={`h-6 w-6 mx-auto mb-2 ${formData.request_type === "complaint" ? 'text-destructive' : 'text-muted-foreground'
                            }`} />
                          <span className={`font-medium ${formData.request_type === "complaint" ? 'text-destructive' : 'text-foreground'
                            }`}>
                            شكوى
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, request_type: "service" }))}
                          className={`p-4 rounded-xl border-2 transition-all ${formData.request_type === "service"
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground'
                            }`}
                        >
                          <FileText className={`h-6 w-6 mx-auto mb-2 ${formData.request_type === "service" ? 'text-accent' : 'text-muted-foreground'
                            }`} />
                          <span className={`font-medium ${formData.request_type === "service" ? 'text-accent' : 'text-foreground'
                            }`}>
                            طلب خدمة
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-black text-[#002B49]/70 mb-2 block">الفئة <span className="text-destructive font-black">*</span></Label>
                      <Select
                        value={formData.type_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type_id: value }))}
                      >
                        <SelectTrigger className={`h-14 rounded-xl bg-muted/30 border-border/50 font-bold ${errors.type_id ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="اختر الفئة (نوع الخدمة أو الشكوى)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border shadow-xl max-h-[400px]">
                          {REQUEST_CATEGORIES
                            .sort((a, b) => a.localeCompare(b, 'ar'))
                            .map((category) => {
                              const dbType = requestTypes.find(t => t.name === category);
                              return (
                                <SelectItem
                                  key={category}
                                  value={dbType?.id || `pending-${category}`}
                                  className="font-bold py-3 cursor-pointer"
                                  disabled={!dbType}
                                >
                                  {category} {!dbType && "(غير مفعّلة)"}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                      {errors.type_id && <p className="text-sm text-destructive">{errors.type_id}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        تفاصيل الطلب <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="يرجى وصف الشكوى بدقة..."
                        className={`min-h-[150px] rounded-xl bg-muted/30 border-border/50 resize-none ${errors.description ? 'border-destructive' : ''
                          }`}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        maxLength={2000}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        {errors.description ? (
                          <p className="text-destructive">{errors.description}</p>
                        ) : (
                          <span />
                        )}
                        <span>{formData.description.length}/2000</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Attachments & Location */}
              {currentStep === 3 && (
                <div className="p-8">
                  <div className="space-y-8">
                    {/* Attachments */}
                    <div className="bg-accent/5 rounded-2xl p-6">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-foreground">
                          إرفاق صور أو مستندات (اختياري)
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          يمكنك إرفاق صور للمشكلة أو مستندات تدعم طلبك.
                        </p>
                      </div>

                      {files.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{file.name}</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="relative border-2 border-dashed border-accent/30 rounded-2xl p-10 text-center hover:border-accent/50 transition-colors bg-card group">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          multiple
                          onChange={handleFileChange}
                          accept="image/*,.pdf,.doc,.docx"
                        />
                        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="h-7 w-7 text-accent" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          اضغط لرفع ملفات
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG, PDF (الحد الأقصى 5MB)
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-accent/5 rounded-2xl p-6">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-foreground">
                          تحديد الموقع (اختياري)
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          مشاركة موقعك يساعدنا في الوصول للمكان بشكل أسرع.
                        </p>
                      </div>

                      {location ? (
                        <div className="bg-background border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-emerald-800">تم تحديد الموقع</p>
                            <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                            </p>
                          </div>
                          <Button variant="ghost" className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => setLocation(null)}>
                            إزالة
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-14 rounded-2xl border border-border bg-card flex items-center justify-center gap-3 hover:bg-muted/50 transition-colors"
                          onClick={handleGetLocation}
                          disabled={isLocating}
                        >
                          {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5 text-accent" />}
                          <span className="text-foreground">{isLocating ? "جاري تحديد الموقع..." : "اضغط لتحديد موقعي الحالي"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-14 rounded-xl flex-shrink-0"
                      onClick={prevStep}
                    >
                      السابق
                      <ChevronRight className="h-5 w-5 mr-2" />
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      size="lg"
                      className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90"
                      onClick={nextStep}
                    >
                      <ChevronLeft className="h-5 w-5 ml-2" />
                      التالي
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      className="flex-1 h-14 rounded-xl bg-accent hover:bg-accent/90"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !user || formData.area_id.startsWith('pending-') || formData.type_id.startsWith('pending-')}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 ml-2" />
                          {formData.area_id.startsWith('pending-') ? "المنطقة المختارة غير متوفرة حالياً" : "إرسال الطلب"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewRequest;
