import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ("citizen" | "staff" | "candidate" | "admin")[];
    requireAuth?: boolean;
}

export const ProtectedRoute = ({
    children,
    allowedRoles,
    requireAuth = true
}: ProtectedRouteProps) => {
    const { user, userRole, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !user) {
                navigate("/login", { state: { from: location }, replace: true });
            } else if (user && allowedRoles && userRole) {
                if (!allowedRoles.includes(userRole.role as any)) {
                    navigate("/", { replace: true });
                }
            } else if (!requireAuth && user) {
                // Redirect away from login if already logged in
                navigate(userRole?.role === "citizen" ? "/" : "/dashboard", { replace: true });
            }
        }
    }, [user, userRole, isLoading, navigate, location, allowedRoles, requireAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        جاري التحقق من الصلاحيات...
                    </p>
                </div>
            </div>
        );
    }

    if (requireAuth && !user) return null;
    if (user && allowedRoles && userRole && !allowedRoles.includes(userRole.role as any)) return null;
    if (!requireAuth && user) return null;

    return <>{children}</>;
};
