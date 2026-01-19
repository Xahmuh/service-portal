import { FileEdit, CheckCircle2, ShieldCheck, ArrowRight, Fingerprint, LucideIcon } from "lucide-react";

interface Step {
    title: string;
    description: string;
    icon: LucideIcon;
    id: string;
    status: string;
}

const steps: Step[] = [
    {
        id: "STEP_01",
        title: "بوابة تسجيل ابناء الدائرة الرقمية",
        description: "تسجيل بيانات المواطن الأساسية عبر نظام آمن يضمن سرية المعلومات، مع إنشاء ملف متابعة خاص بكل طلب لتسهيل التواصل والدراسة.",
        icon: Fingerprint,
        status: "الخطوة الأولى",
    },
    {
        id: "STEP_02",
        title: "منظومة الشكاوى والطلبات",
        description: "واجهة إلكترونية موحدة تتيح تقديم الشكوى أو الطلب، إرفاق المستندات الداعمة، وتصنيف الطلب تلقائيًا تمهيدًا لدراسته وتحويله إلى فريق العمل المختص داخل مكتب النائب.",
        icon: FileEdit,
        status: "الخطوة الثانية",
    },
    {
        id: "STEP_03",
        title: "مركز المتابعة والتواصل",
        description: "نظام متابعة شفاف يمكّن المواطن من الاطلاع على حالة طلبه، تلقي التحديثات، والاطلاع على رد مكتب النائب أو الإجراء المتخذ، بما يعزز الثقة والتواصل المباشر.",
        icon: CheckCircle2,
        status: "الخطوة الثالثة",
    },
];

export function ProcessSteps() {
    return (
        <section className="pt-24 md:pt-40 pb-12 md:pb-20 bg-background relative overflow-hidden">
            {/* SaaS Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="container relative">
                {/* Section Header - Highly Professional */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 md:mb-24 pb-8 border-b border-border/50 text-center lg:text-start">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Digital Governance Protocol
                        </div>
                        <h2 className="text-3xl md:text-6xl font-black text-[#002B49] leading-tight">
                            دورة حياة الخدمة <br /> <span className="text-primary/60">الرقمية المتكاملة</span>
                        </h2>
                    </div>
                    <div className="max-w-md mx-auto lg:mx-0">
                        <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                        منظومة رقمية متطورة يديرها مكتب النائب ا.نبيل ابو وردة، تعتمد على حلول تقنية حديثة لتنظيم شكاوى وطلبات المواطنين، وضمان وضوح المتابعة وسرعة التواصل.
                        </p>
                    </div>
                </div>

                {/* The Pipeline Design */}
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border/60 rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white/30 backdrop-blur-sm shadow-2xl">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`group relative p-8 md:p-12 lg:p-16 flex flex-col items-start transition-all duration-500 hover:bg-white/40 ${index !== steps.length - 1 ? "lg:border-l border-b lg:border-b-0 border-border/60" : ""
                                }`}
                        >
                            {/* Step Header */}
                            <div className="w-full flex justify-between items-start mb-8 md:mb-12">
                                <div className="relative">
                                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-white shadow-inner flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform duration-500">
                                        <step.icon className="w-7 h-7 md:w-10 md:h-10 text-[#002B49] group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded bg-primary text-white text-[9px] md:text-[10px] font-black uppercase tracking-tighter shadow-lg">
                                        {step.id}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block mb-1">Status</span>
                                    <span className="text-[10px] md:text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
                                        {step.status}
                                    </span>
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="space-y-4 md:space-y-6">
                                <h3 className="text-xl md:text-2xl font-black text-[#002B49] group-hover:text-primary transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground font-medium leading-[1.6] md:leading-[1.8] text-sm md:text-base lg:text-lg">
                                    {step.description}
                                </p>
                            </div>

                            {/* Progress Indicator Dots */}
                            <div className="mt-8 md:mt-12 w-full h-1 bg-muted/40 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute inset-0 bg-primary/20 transition-all duration-1000 origin-right"
                                    style={{ width: `${(index + 1) * 33.33}%` }}
                                />
                            </div>

                            {/* Subtle Decorative Arrow for Large Screens */}
                            {index < steps.length - 1 && (
                                <ArrowRight className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-border/40 z-20" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
