import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsChartsProps {
  requestsByArea: { name: string; count: number }[];
  requestsByType: { name: string; count: number }[];
  requestsByStatus: { name: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
}

const COLORS = ["#047857", "#D4A93C", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function AnalyticsCharts({
  requestsByArea,
  requestsByType,
  requestsByStatus,
  dailyTrend,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Requests by Area */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">الطلبات حسب المنطقة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestsByArea} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  textAlign: "right",
                  direction: "rtl",
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }} 
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Requests by Type */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">الطلبات حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={requestsByType}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {requestsByType.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  textAlign: "right",
                  direction: "rtl",
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card className="border-border/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">الطلبات اليومية (آخر 7 أيام)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  textAlign: "right",
                  direction: "rtl",
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="border-border/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">توزيع حالات الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {requestsByStatus.map((status, index) => (
              <div
                key={status.name}
                className="text-center p-4 rounded-lg"
                style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
              >
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: COLORS[index % COLORS.length] }}
                >
                  {status.count}
                </div>
                <div className="text-sm text-muted-foreground">{status.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
