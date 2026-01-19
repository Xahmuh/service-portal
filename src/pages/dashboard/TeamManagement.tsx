import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
    Users,
    UserPlus,
    MoreVertical,
    Mail,
    Phone,
    Shield,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TeamMember {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    job_title?: string | null;
    created_at: string;
}

export default function TeamManagement() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Add Member State
    const [searchEmail, setSearchEmail] = useState("");
    const [foundUser, setFoundUser] = useState<{ id: string; name: string; email: string; job_title?: string } | null>(null);
    const [selectedRole, setSelectedRole] = useState("staff");
    const [jobTitle, setJobTitle] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("user_roles")
                .select(`
          user_id,
          role,
          created_at,
          profiles:profiles!user_roles_user_id_fkey(name, email, phone, job_title)
        `)
                .in("role", ["staff", "candidate", "admin"] as any[])
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped = data.map((item: any) => ({
                    id: item.user_id,
                    name: item.profiles?.name || "بدون اسم",
                    email: item.profiles?.email,
                    phone: item.profiles?.phone,
                    role: item.role,
                    job_title: item.profiles?.job_title,
                    created_at: item.created_at,
                }));
                setMembers(mapped);
            }
        } catch (error: any) {
            toast.error("خطأ في جلب بيانات الفريق");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchUser = async () => {
        if (!searchEmail) return;
        setIsSearching(true);
        setFoundUser(null);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("user_id, name, email, job_title")
                .eq("email", searchEmail)
                .single() as any;

            if (error || !data) {
                toast.error("المستخدم غير موجود");
            } else {
                setFoundUser({ id: data.user_id, name: data.name, email: data.email || "", job_title: data.job_title || "" });
                setJobTitle(data.job_title || "");
            }
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء البحث");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddMember = async () => {
        if (!foundUser) return;
        setIsAdding(true);
        try {
            // Update user_role
            const { error: roleError } = await supabase
                .from("user_roles")
                .upsert({
                    user_id: foundUser.id,
                    role: selectedRole as any
                } as any, { onConflict: 'user_id' });

            if (roleError) throw roleError;

            // Update profile with job_title/specialty
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ job_title: jobTitle } as any)
                .eq("user_id", foundUser.id);

            if (profileError) throw profileError;

            toast.success(`تم إضافة ${foundUser.name} للفريق بنجاح`);
            setIsDialogOpen(false);
            setFoundUser(null);
            setSearchEmail("");
            fetchMembers();
        } catch (error: any) {
            console.error(error);
            toast.error("خطأ في إضافة العضو");
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateSpecialty = async (userId: string, newTitle: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ job_title: newTitle } as any)
                .eq("user_id", userId);

            if (error) throw error;
            toast.success("تم تحديث التخصص بنجاح");
            fetchMembers();
        } catch (error) {
            toast.error("خطأ في تحديث التخصص");
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from("user_roles")
                .update({ role: newRole as any })
                .eq("user_id", userId);

            if (error) throw error;
            toast.success("تم تحديث الصلاحية بنجاح");
            fetchMembers();
        } catch (error) {
            toast.error("خطأ في تحديث الصلاحية");
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("هل أنت متأكد من إزالة هذا العضو من الفريق؟ سيتم إرجاعه لرتبة مواطن.")) return;

        try {
            // Either delete the row or set to citizen. 
            // Since user_roles has a unique constraint, deleting it might be cleaner if 'citizen' is default behavior without a row,
            // BUT our schema has a row for every user. So we update to 'citizen'.
            const { error } = await supabase
                .from("user_roles")
                .update({ role: 'citizen' })
                .eq("user_id", userId);

            if (error) throw error;
            toast.success("تم إزالة العضو من الفريق");
            fetchMembers();
        } catch (error) {
            toast.error("خطأ في إزالة العضو");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">مسؤول النظام</Badge>;
            case "candidate":
                return <Badge className="bg-[#D4AF37]/20 text-[#002B49] border-[#D4AF37]/30 hover:bg-[#D4AF37]/30">مرشح</Badge>;
            case "staff":
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">فريق العمل</Badge>;
            default:
                return <Badge variant="outline">مواطن</Badge>;
        }
    };

    if (authLoading || isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-[#002B49]">إدارة فريق العمل</h2>
                        <p className="text-muted-foreground font-medium">إدارة الأعضاء والصلاحيات والمهام</p>
                    </div>
                    {isAdmin && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#002B49] font-bold rounded-xl h-12 shadow-md hover:shadow-lg transition-all">
                                    <UserPlus className="h-5 w-5 ml-2" />
                                    إضافة عضو جديد
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>إضافة عضو للفريق</DialogTitle>
                                    <DialogDescription>
                                        ابحث عن مستخدم مسجل لإضافته إلى فريق العمل وتحديد صلاحياته.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>البريد الإلكتروني للمستخدم</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="user@example.com"
                                                value={searchEmail}
                                                onChange={(e) => setSearchEmail(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                            />
                                            <Button size="icon" onClick={handleSearchUser} disabled={isSearching}>
                                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {foundUser && (
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {foundUser.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{foundUser.name}</p>
                                                    <p className="text-xs text-muted-foreground">{foundUser.email}</p>
                                                </div>
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-auto" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>تعيين الصلاحية</Label>
                                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="staff">عضو فريق (Staff)</SelectItem>
                                                        <SelectItem value="candidate">مرشح (Candidate)</SelectItem>
                                                        <SelectItem value="admin">مسؤول (Admin)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>التخصص / المسمى الوظيفي</Label>
                                                <Input
                                                    placeholder="مثال: مختص رصف الطرق"
                                                    value={jobTitle}
                                                    onChange={(e) => setJobTitle(e.target.value)}
                                                />
                                            </div>

                                            <Button onClick={handleAddMember} disabled={isAdding} className="w-full mt-4 bg-primary text-white">
                                                {isAdding ? "جاري الإضافة..." : "تأكيد الإضافة"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden md:col-span-3 lg:col-span-1">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                إحصائيات الفريق
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center text-sm p-3 bg-white rounded-xl shadow-sm border border-border/30">
                                <span className="text-muted-foreground">إجمالي الأعضاء</span>
                                <span className="font-bold text-lg">{members.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 bg-white rounded-xl shadow-sm border border-border/30">
                                <span className="text-muted-foreground">صلاحية المسؤول</span>
                                <span className="font-bold text-lg">{members.filter(m => m.role === "admin").length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 bg-white rounded-xl shadow-sm border border-border/30">
                                <span className="text-muted-foreground">فريـق العمـل</span>
                                <span className="font-bold text-lg text-blue-600">{members.filter(m => m.role === "staff").length}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-3 lg:col-span-2 rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-muted/30 border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-bold">العضو</th>
                                        <th className="px-6 py-4 text-sm font-bold">الدور</th>
                                        <th className="px-6 py-4 text-sm font-bold">معلومات الاتصال</th>
                                        <th className="px-6 py-4 text-sm font-bold">تاريخ الانضمام</th>
                                        {isAdmin && <th className="px-6 py-4 text-sm font-bold text-center">الإجراءات</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {members.map((member) => (
                                        <tr key={member.id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#002B49]">{member.name}</p>
                                                        {member.job_title && (
                                                            <p className="text-[10px] bg-gold/10 text-[#B8962E] px-1.5 py-0.5 rounded-md font-bold inline-block mt-1">
                                                                {member.job_title}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-0.5">{member.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(member.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                        <Mail className="h-3 w-3" />
                                                        {member.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                        <Phone className="h-3 w-3" />
                                                        {member.phone || "بدون هاتف"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {new Date(member.created_at).toLocaleDateString("ar-EG")}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>إجراءات العضو</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'staff')}>
                                                                <Shield className="h-4 w-4 ml-2" />
                                                                تعيين كفريق عمل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                                                                <Shield className="h-4 w-4 ml-2" />
                                                                تعيين كمسؤول (Admin)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                                const newTitle = prompt("أدخل التخصص الجديد لهذا العضو:", member.job_title || "");
                                                                if (newTitle !== null) handleUpdateSpecialty(member.id, newTitle);
                                                            }}>
                                                                <Shield className="h-4 w-4 ml-2 text-gold" />
                                                                تحديث التخصص (Specialty)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="text-destructive focus:text-destructive">
                                                                <Trash2 className="h-4 w-4 ml-2" />
                                                                إزالة من الفريق
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
