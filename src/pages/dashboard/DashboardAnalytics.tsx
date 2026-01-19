import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { format, subDays } from "date-fns";
import { ar } from "date-fns/locale";

export default function DashboardAnalytics() {
  const { isLoading, isStaffOrCandidate } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    closed: 0,
  });
  const [requestsByArea, setRequestsByArea] = useState<{ name: string; count: number }[]>([]);
  const [requestsByType, setRequestsByType] = useState<{ name: string; count: number }[]>([]);
  const [requestsByStatus, setRequestsByStatus] = useState<{ name: string; count: number }[]>([]);
  const [dailyTrend, setDailyTrend] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!isLoading && !isStaffOrCandidate) {
      navigate("/");
    }
  }, [isLoading, isStaffOrCandidate, navigate]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch all requests
    const { data: requests } = await supabase
      .from("requests")
      .select(`
        id,
        status,
        created_at,
        area:areas(name),
        type:request_types(name)
      `);

    if (!requests) return;

    // Calculate stats
    const total = requests.length;
    const newCount = requests.filter((r) => r.status === "new").length;
    const inProgress = requests.filter((r) => 
      r.status === "in_review" || r.status === "in_progress"
    ).length;
    const closed = requests.filter((r) => 
      r.status === "closed" || r.status === "responded"
    ).length;
    
    setStats({ total, new: newCount, inProgress, closed });

    // Calculate by area
    const areaMap = new Map<string, number>();
    requests.forEach((r: any) => {
      const areaName = r.area?.name || "غير محدد";
      areaMap.set(areaName, (areaMap.get(areaName) || 0) + 1);
    });
    setRequestsByArea(Array.from(areaMap, ([name, count]) => ({ name, count })));

    // Calculate by type
    const typeMap = new Map<string, number>();
    requests.forEach((r: any) => {
      const typeName = r.type?.name || "غير محدد";
      typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1);
    });
    setRequestsByType(Array.from(typeMap, ([name, count]) => ({ name, count })));

    // Calculate by status
    const statusLabels: Record<string, string> = {
      new: "جديد",
      in_review: "قيد المراجعة",
      in_progress: "قيد التنفيذ",
      responded: "تم الرد",
      closed: "مغلق",
    };
    const statusMap = new Map<string, number>();
    requests.forEach((r: any) => {
      const statusLabel = statusLabels[r.status] || r.status;
      statusMap.set(statusLabel, (statusMap.get(statusLabel) || 0) + 1);
    });
    setRequestsByStatus(Array.from(statusMap, ([name, count]) => ({ name, count })));

    // Calculate daily trend (last 7 days)
    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      dailyMap.set(date, 0);
    }
    requests.forEach((r: any) => {
      const date = format(new Date(r.created_at), "yyyy-MM-dd");
      if (dailyMap.has(date)) {
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      }
    });
    setDailyTrend(
      Array.from(dailyMap, ([date, count]) => ({
        date: format(new Date(date), "EEE", { locale: ar }),
        count,
      }))
    );
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
        <StatsCards stats={stats} />
        <AnalyticsCharts
          requestsByArea={requestsByArea}
          requestsByType={requestsByType}
          requestsByStatus={requestsByStatus}
          dailyTrend={dailyTrend}
        />
      </div>
    </DashboardLayout>
  );
}
