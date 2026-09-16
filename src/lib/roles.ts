// Role helpers — roles live in the user_roles table, never on the profile.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type AppRole = "admin" | "supplier" | "driver" | "customer";

export function useRoles() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setRoles((data ?? []).map((r) => r.role as AppRole));
        setLoading(false);
      });
  }, [user, authLoading]);

  return {
    roles,
    loading: loading || authLoading,
    isAdmin: roles.includes("admin"),
    isSupplier: roles.includes("supplier"),
    has: (r: AppRole) => roles.includes(r),
  };
}

export function roleLabel(role: string, lang: string) {
  if (lang !== "ar") return role;
  switch (role) {
    case "admin": return "مدير";
    case "supplier": return "مورد";
    case "driver": return "سائق";
    default: return "عميل";
  }
}
