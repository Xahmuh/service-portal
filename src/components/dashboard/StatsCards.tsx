import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Users } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    new: number;
    inProgress: number;
    closed: number;
    satisfaction?: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "إجمالي الطلبات",
      value: stats.total,
      icon: FileText,
      trend: "+12%",
      trendUp: true,
      gradient: "from-[#002B49] to-[#00426E]",
    },
    {
      title: "طلبات جديدة",
      value: stats.new,
      icon: AlertTriangle,
      trend: "+5",
      trendUp: true,
      gradient: "from-[#D4AF37] to-[#B8962E]",
    },
    {
      title: "قيد المعالجة",
      value: stats.inProgress,
      icon: Clock,
      trend: "-3",
      trendUp: false,
      gradient: "from-[#047857] to-[#065F46]",
    },
    {
      title: "تم الرد عليها",
      value: stats.closed,
      icon: CheckCircle,
      trend: "+18%",
      trendUp: true,
      gradient: "from-[#1E293B] to-[#0F172A]",
    },
    {
      title: "معدل الرضا",
      value: `${stats.satisfaction || 98}%`,
      icon: Users,
      trend: "+2%",
      trendUp: true,
      gradient: "from-[#7C3AED] to-[#5B21B6]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="card-modern overflow-hidden animate-slide-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl lg:text-4xl font-bold text-foreground">{card.value}</p>
                <div className={`inline-flex items-center gap-1 text-xs font-medium ${card.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                  {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.trend} هذا الأسبوع
                </div>
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <card.icon className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
