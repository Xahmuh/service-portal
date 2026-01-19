import { TrendingUp, Users, Clock, CheckCircle2, ShieldCheck } from "lucide-react";

const stats = [
  { value: "50k+", label: "معاملة رقمية منجزة", icon: TrendingUp },
  { value: "99.2%", label: "مؤشر رضا المواطنين", icon: Users },
  { value: "12m", label: "متوسط وقت المعالجة", icon: Clock },
  { value: "100%", label: "تأمين وحماية البيانات", icon: ShieldCheck },
];

export function StatsSection() {
  return (
    <section className="py-24 bg-[#002B49] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">


      </div>

      <div className="container relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                <stat.icon className="h-10 w-10 text-[#D4AF37]" />
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tighter">
                {stat.value}
              </div>
              <div className="text-base md:text-lg text-white/60 font-bold uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
