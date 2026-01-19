import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AppRole = "citizen" | "staff" | "candidate" | "admin";

interface Profile {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  area_id: string | null;
  national_id?: string | null;
  gender?: 'male' | 'female' | null;
  job_title?: string | null;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | null;
  address?: string | null;
}

interface UserRole {
  role: AppRole;
  assigned_area_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, nationalId?: string, areaId?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isStaffOrCandidate: boolean;
  isAdmin: boolean;
  isCandidate: boolean;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role, assigned_area_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleData) {
        setUserRole(roleData as UserRole);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid blocking
          setTimeout(() => fetchUserData(currentSession.user.id), 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchUserData(initialSession.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string, nationalId?: string, areaId?: string) => {
    // Basic validation for National ID
    if (nationalId && (nationalId.length < 10)) {
      toast.error("الرقم القومي غير صحيح");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name,
          phone,
          national_id: nationalId,
          area_id: areaId,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success("تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.");
    navigate("/");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error("خطأ في إرسال رابط استعادة كلمة المرور");
      throw error;
    }

    toast.success("تم إرسال رابط استعادة كلمة المرور بنجاح");
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      toast.error("خطأ في الاتصال مع Google");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("خطأ في تسجيل الدخول");
      throw error;
    }

    toast.success("تم تسجيل الدخول بنجاح!");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("خطأ في تسجيل الخروج");
      throw error;
    }
    setProfile(null);
    setUserRole(null);
    navigate("/");
    toast.success("تم تسجيل الخروج");
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id);

      // Fetch fresh profile data
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
        return null;
      } else if (profileData) {
        console.log('Profile refreshed successfully:', profileData);
        setProfile(profileData);
        return profileData;
      }
    }
    return null;
  };

  const isStaffOrCandidate = userRole?.role === "staff" || userRole?.role === "candidate" || userRole?.role === "admin";
  const isAdmin = userRole?.role === "admin";
  const isCandidate = userRole?.role === "candidate" || userRole?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userRole,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        isStaffOrCandidate,
        isAdmin,
        isCandidate,
        signInWithGoogle,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
