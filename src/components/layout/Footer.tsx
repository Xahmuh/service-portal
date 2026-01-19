import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-foreground">ا.نبيل ابو وردة</p>
                <p className="text-xs text-muted-foreground">نائب دائرة المنصورة</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة رقمية متكاملة لخدمة المواطنين وتلقي طلباتهم ومتابعتها،
              بالإضافة إلى نشر آخر أخبار وإنجازات الدائرة الانتخابية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/requests/new" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  تقديم طلب جديد
                </Link>
              </li>
              <li>
                <Link to="/requests" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  متابعة الطلبات
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  أخبار الدائرة
                </Link>
              </li>
              <li>
                <Link to="/about-candidate" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  عن النائب
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-foreground mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@candidate.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>الدائرة الانتخابية - مصر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()} - منصة خدمة المواطنين
          </p>
        </div>
      </div>
    </footer>
  );
}
