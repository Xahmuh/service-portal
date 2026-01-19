import { FileText, Search, MessageSquare, ShieldQuestion, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
    {
        title: "تقديم طلب جديد",
        description: "ابدأ معاملتك الرقمية الآن",
        icon: FileText,
        href: "/requests/new",
        color: "bg-blue-500/10 text-blue-600",
    },
    {
        title: "تتبع حالة طلب",
        description: "استعلم عن مسار معاملتك",
        icon: Search,
        href: "/track-request",
        color: "bg-[#D4AF37]/10 text-[#D4AF37]",
    },
    {
        title: "شكوى أو مقترح",
        description: "صوتك مسموع دائماً",
        icon: MessageSquare,
        href: "/#contact",
        color: "bg-emerald-500/10 text-emerald-600",
    },
    {
        title: "الاستشارات القانونية",
        description: "دعم فني من المكتب المختص",
        icon: ShieldQuestion,
        href: "/news",
        color: "bg-violet-500/10 text-violet-600",
    },
];

export function QuickServices() {
    return (
        <div className="container relative -mt-16 z-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, index) => (
                    <Link
                        key={service.title}
                        to={service.href}
                        className="group relative bg-card/80 backdrop-blur-xl border border-border/40 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {/* Hover Background Accent */}
                        <div className={`absolute top-0 right-0 w-24 h-24 ${service.color.split(' ')[0]} rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

                        <div className="flex flex-col gap-4">
                            <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                <service.icon className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-[#002B49] group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {service.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <span>ابدأ الآن</span>
                                <ArrowLeft className="w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
