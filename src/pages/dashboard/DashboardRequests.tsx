import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RequestsTable } from "@/components/dashboard/RequestsTable";
import { RequestDetailDialog } from "@/components/dashboard/RequestDetailDialog";
import { toast } from "sonner";

interface Request {
  id: string;
  subject: string;
  status: "new" | "in_review" | "in_progress" | "responded" | "closed" | "cancelled";
  priority: "low" | "medium" | "high";
  created_at: string;
  area_id: string;
  area: { name: string };
  type: { name: string };
  citizen: { name: string };
  assigned_to_profile?: { name: string };
}

interface RequestDetail extends Request {
  description: string;
  citizen: { name: string; phone: string; email: string };
  replies: any[];
  attachments: { id: string; file_url: string; file_name: string; file_type: string }[];
  location_address?: string;
  latitude?: number;
  longitude?: number;
}

export default function DashboardRequests() {
  const { user, userRole, isLoading, isStaffOrCandidate } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isStaffOrCandidate) {
      navigate("/");
    }
  }, [isLoading, isStaffOrCandidate, navigate]);

  useEffect(() => {
    fetchAreas();
    fetchRequests();
  }, []);

  const fetchAreas = async () => {
    const { data } = await supabase.from("areas").select("id, name");
    if (data) setAreas(data);
  };

  const fetchRequests = async (filters?: { status?: string; area?: string; search?: string }) => {
    let query = supabase
      .from("requests")
      .select(`
        id,
        subject,
        status,
        priority,
        created_at,
        area_id,
        area:areas(name),
        type:request_types(name),
        citizen:profiles!requests_citizen_id_fkey(name),
        assigned_to_profile:profiles!requests_assigned_to_fkey(name)
      `)
      .order("created_at", { ascending: false });

    const isStaff = userRole?.role === "staff";

    if (isStaff && user) {
      const areaId = userRole.assigned_area_id;
      if (areaId) {
        query = query.or(`assigned_to.eq.${user.id},area_id.eq.${areaId}`);
      } else {
        query = query.eq("assigned_to", user.id);
      }
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status as any);
    }
    if (filters?.area && filters.area !== "all") {
      query = query.eq("area_id", filters.area);
    }
    if (filters?.search) {
      query = query.ilike("subject", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching requests:", error);
      return;
    }

    if (data) {
      setRequests(data as unknown as Request[]);
    }
  };

  const fetchRequestDetail = async (id: string) => {
    const { data, error } = await supabase
      .from("requests")
      .select(`
        id,
        subject,
        description,
        status,
        priority,
        created_at,
        area_id,
        area:areas(name),
        type:request_types(name),
        citizen:profiles!requests_citizen_id_fkey(name, phone, email),
        location_address,
        latitude,
        longitude,
        attachments(
          id,
          file_url,
          file_name,
          file_type
        ),
        replies(
          id,
          message,
          sender_role,
          is_internal,
          created_at
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching request detail:", error);
      return;
    }

    if (data) {
      setSelectedRequest(data as unknown as RequestDetail);
      setDialogOpen(true);
    }
  };

  const handleStatusChange = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from("requests")
      .update({ status: status as any })
      .eq("id", requestId);

    if (error) {
      toast.error("حدث خطأ أثناء تحديث الحالة");
      return;
    }

    toast.success("تم تحديث حالة الطلب");
    fetchRequests();
    if (selectedRequest) {
      fetchRequestDetail(selectedRequest.id);
    }
  };

  const handlePriorityChange = async (requestId: string, priority: string) => {
    const { error } = await supabase
      .from("requests")
      .update({ priority: priority as any })
      .eq("id", requestId);

    if (error) {
      toast.error("حدث خطأ أثناء تحديث الأولوية");
      return;
    }

    toast.success("تم تحديث الأولوية");
    fetchRequests();
  };

  const handleAssignChange = async (requestId: string, userId: string) => {
    const { error } = await supabase
      .from("requests")
      .update({ assigned_to: userId || null })
      .eq("id", requestId);

    if (error) {
      toast.error("حدث خطأ أثناء تحويل الطلب");
      return;
    }

    toast.success("تم تحويل الطلب بنجاح");
    fetchRequests();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <RequestsTable
          requests={requests}
          areas={areas}
          onViewRequest={fetchRequestDetail}
          onFilterChange={fetchRequests}
        />
        <RequestDetailDialog
          request={selectedRequest}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onAssignChange={handleAssignChange}
          onReplyAdded={() => {
            if (selectedRequest) {
              fetchRequestDetail(selectedRequest.id);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}
