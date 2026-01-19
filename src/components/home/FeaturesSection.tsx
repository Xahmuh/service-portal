import { FileText, Bell, Clock, ShieldCheck, Users, Zap, Globe, Lock, Accessibility, ArrowLeft } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "منظومة الخدمات الرقمية",
    description: "تقديم الطلبات الحكومية إلكترونياً مع إمكانية إرفاق كافة المستندات الرسمية اللازمة.",
    color: "from-[#002B49] to-[#004d80]",
  },
  {
    icon: Clock,
    title: "التتبع والشفافية",
    description: "متابعة مسار معاملاتك لحظة بلحظة مع جدول زمني دقيق لكل إجراء يتم اتخاذه.",
    color: "from-[#002B49] to-[#004d80]",
  },
  {
    icon: Lock,
    title: "أمن البيانات الفيدرالي",
    description: "حماية بيانات المواطنين باستخدام أعلى تقنيات التشفير والمعايير الأمنية العالمية.",
    color: "from-[#002B49] to-[#004d80]",
  },
  {
    icon: Bell,
    title: "مركز التنبيهات الذكي",
    description: "إشعارات فورية عبر البريد والرسائل النصية عند أي تحديث يخص طلباتك أو أخبار الدائرة.",
    color: "from-[#002B49] to-[#004d80]",
  },
  {
    icon: Accessibility,
    title: "سهولة الوصول للجميع",
    description: "واجهة مصممة لتكون سهلة الاستخدام لجميع الفئات، مع دعم كامل لمعايير الوصول الرقمي.",
    color: "from-[#002B49] to-[#004d80]",
  },
  {
    icon: Globe,
    title: "التحول الرقمي الشامل",
    description: "هدفنا هو تقليل الاعتماد على المعاملات الورقية وتوفير الوقت والجهد لكل مواطن.",
    color: "from-[#002B49] to-[#004d80]",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Dynamic Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 animate-pulse delay-700" />

      <div className="container relative">
        <div className="text-center mb-24 space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary/5 border border-primary/10 text-[#002B49] text-sm font-black tracking-widest uppercase">
            <Zap className="h-4 w-4 text-[#D4AF37]" />
            ميزات المنصة الذكية
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#002B49] tracking-tight leading-[1.2]">
            حلول رقمية متكاملة <br className="hidden md:block" /> لخدمة المواطن والمجتمع
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            نضع أحدث الحلول التقنية بين يديك، لنحول التجربة الحكومية إلى رحلة رقمية سلسة تتميز بالسرعة، الأمان، والموثوقية المطلقة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-10 rounded-[2.5rem] bg-card/50 backdrop-blur-sm border border-border/40 shadow-xl hover:shadow-2xl hover:bg-card hover:border-primary/20 transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[40%] rounded-tr-[2.5rem] -z-10 group-hover:bg-primary/[0.08] transition-colors" />

              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} mb-8 shadow-xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <feature.icon className="h-8 w-8 text-[#D4AF37]" />
              </div>

              <h3 className="text-2xl font-bold text-[#002B49] mb-4 group-hover:translate-x-2 transition-transform duration-300 rtl:group-hover:-translate-x-2">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed font-medium">
                {feature.description}
              </p>

              {/* Decorative Accent */}
              <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span>اكتشف المزيد</span>
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

