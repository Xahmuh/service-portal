import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Bell, Lock, Globe, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
    const { isAdmin, user, profile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [formData, setFormData] = useState({
        name: "",
        phone: ""
    });

    // Password State
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useState(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phone: profile.phone || ""
            });
        }
    });

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    name: formData.name,
                    phone: formData.phone
                })
                .eq("user_id", user.id);

            if (error) throw error;
            toast.success("تم تحديث البيانات الشخصية بنجاح");
        } catch (error) {
            console.error(error);
            toast.error("خطأ في تحديث البيانات");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("كلمات المرور غير متطابقة");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            toast.success("تم تحديث كلمة المرور بنجاح");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
            toast.error("خطأ في تحديث كلمة المرور");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-black text-[#002B49]">إعدادات النظام</h2>
                    <p className="text-muted-foreground font-medium">إدارة تفضيلات الحساب وسياسات المنصة</p>
                </div>

                <Tabs defaultValue="account" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl border border-border/50">
                        <TabsTrigger value="account" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">الحساب</TabsTrigger>
                        <TabsTrigger value="security" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">الأمان</TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">التنبيهات</TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="system" className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">النظام العام</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="account">
                        <Card className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" />
                                    البيانات الشخصية
                                </CardTitle>
                                <CardDescription>تحديث معلومات حسابك وبيانات التواصل</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>الاسم الكامل</Label>
                                        <Input
                                            placeholder="أدخل اسمك الكامل"
                                            className="h-12 rounded-xl"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>البريد الإلكتروني</Label>
                                        <Input
                                            type="email"
                                            value={profile?.email || ""}
                                            className="h-12 rounded-xl bg-muted"
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>رقم الهاتف</Label>
                                        <Input
                                            placeholder="01xxxxxxxxx"
                                            className="h-12 rounded-xl"
                                            dir="ltr"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الرقم القومي</Label>
                                        <Input
                                            value={profile?.national_id || "غير مسجل"}
                                            className="h-12 rounded-xl bg-muted"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-12 px-8">
                                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Save className="h-5 w-5 ml-2" />}
                                        حفظ التعديلات
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="grid gap-6">
                            <Card className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                                <CardHeader className="bg-muted/30">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-primary" />
                                        تغيير كلمة المرور
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>كلمة المرور الجديدة</Label>
                                            <Input
                                                type="password"
                                                className="h-12 rounded-xl"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>تأكيد كلمة المرور</Label>
                                            <Input
                                                type="password"
                                                className="h-12 rounded-xl"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleUpdatePassword} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-12 px-8">
                                            تحديث كلمة المرور
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                                <CardHeader className="bg-muted/30">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        خيارات الأمان الإضافية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-bold">المصادقة الثنائية (2FA)</Label>
                                            <p className="text-sm text-muted-foreground">تأمين حسابك عبر إرسال كود للهاتف عند تسجيل الدخول</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-bold">تنبيهات تسجيل الدخول</Label>
                                            <p className="text-sm text-muted-foreground">تنبيهك عند تسجيل الدخول من جهاز جديد</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    إعدادات التنبيهات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-4 border-b border-border/30">
                                        <div className="space-y-0.5">
                                            <p className="font-bold">تحديثات الطلبات</p>
                                            <p className="text-sm text-muted-foreground">استلام تنبيهات عند تغيير حالة طلباتك</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-border/30">
                                        <div className="space-y-0.5">
                                            <p className="font-bold">أخبار المنصة</p>
                                            <p className="text-sm text-muted-foreground">استلام تنبيهات بالأخبار والقرارات الجديدة</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between py-4">
                                        <div className="space-y-0.5">
                                            <p className="font-bold">رسائل فريق العمل</p>
                                            <p className="text-sm text-muted-foreground">استلام تنبيهات عند وصول رسائل داخلية</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="system">
                            <Card className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                                <CardHeader className="bg-muted/30">
                                    <CardTitle className="text-xl flex items-center gap-2 text-destructive">
                                        <Shield className="h-5 w-5" />
                                        سياسات النظام العامة (للمسؤولين فقط)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid gap-6">
                                        <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/10 rounded-2xl">
                                            <div className="space-y-0.5">
                                                <Label className="font-bold">وضع الصيانة</Label>
                                                <p className="text-sm text-muted-foreground">تعطيل وصول المواطنين للمنصة مؤقتاً</p>
                                            </div>
                                            <Switch />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/30 rounded-2xl">
                                            <div className="space-y-0.5">
                                                <Label className="font-bold">قوة كلمة المرور</Label>
                                                <p className="text-sm text-muted-foreground">إلزام المستخدمين بكلمات مرور معقدة</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
