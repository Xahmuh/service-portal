import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Request {
  id: string;
  subject: string;
  status: "new" | "in_review" | "in_progress" | "responded" | "closed" | "cancelled";
  priority: "low" | "medium" | "high";
  created_at: string;
  area: { name: string };
  type: { name: string };
  citizen: { name: string };
  assigned_to_profile?: { name: string };
}

interface RequestsTableProps {
  requests: Request[];
  areas: { id: string; name: string }[];
  onViewRequest: (id: string) => void;
  onFilterChange: (filters: { status?: string; area?: string; search?: string }) => void;
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
  low: { label: "عادي", class: "bg-slate-50 text-slate-600 border-slate-200 font-medium" },
  medium: { label: "متوسط", class: "bg-blue-50 text-blue-600 border-blue-200 font-medium" },
  high: { label: "عاجل جداً", class: "bg-red-50 text-red-600 border-red-200 font-bold animate-pulse" },
};

export function RequestsTable({
  requests,
  areas,
  onViewRequest,
  onFilterChange,
}: RequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({ search: value, status: statusFilter, area: areaFilter });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onFilterChange({ search: searchTerm, status: value, area: areaFilter });
  };

  const handleAreaChange = (value: string) => {
    setAreaFilter(value);
    onFilterChange({ search: searchTerm, status: statusFilter, area: value });
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle>الطلبات الواردة</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                className="pr-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات المستلمة</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="in_review">قيد المراجعة</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="responded">تم الرد</SelectItem>
                <SelectItem value="closed">مغلق</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={handleAreaChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="المنطقة" />
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">المواطن</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">المنطقة</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">النوع</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">الحالة</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">الأولوية</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">المسؤول</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">التاريخ</TableHead>
                <TableHead className="text-right py-6 font-bold text-[#002B49]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {request.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {request.subject}
                    </TableCell>
                    <TableCell>{request.citizen?.name}</TableCell>
                    <TableCell>{request.area?.name}</TableCell>
                    <TableCell>{request.type?.name}</TableCell>
                    <TableCell>
                      <Badge className={statusLabels[request.status]?.class}>
                        {statusLabels[request.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityLabels[request.priority]?.class}>
                        {priorityLabels[request.priority]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {request.assigned_to_profile?.name || (
                        <span className="text-muted-foreground italic">غير محول</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(request.created_at), "d MMM yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewRequest(request.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
