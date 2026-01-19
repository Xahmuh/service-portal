import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 text-center">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full border border-red-100">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-black text-[#002B49] mb-2">حدث خطأ غير متوقع</h1>
                        <p className="text-muted-foreground mb-6">
                            نعتذر عن هذا الخطأ. لقد تم تسجيل المشكلة وسيتم العمل على حلها.
                        </p>
                        <div className="max-h-32 overflow-auto bg-gray-50 rounded-lg p-3 mb-6 text-left text-xs text-red-500 font-mono">
                            {this.state.error?.message}
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full h-12 rounded-xl bg-[#002B49] hover:bg-[#002B49]/90 font-bold gap-2"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            إعادة تحميل الصفحة
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
