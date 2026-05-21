import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/turnkey/projects")({
  head: () => ({ meta: [{ title: "مشاريعي — JABAL Turnkey" }] }),
  component: MyProjects,
});

type P = {
  id: string; project_number: string; project_type: string; status: string;
  city: string; area_m2: number; created_at: string; progress_percent: number;
};

function MyProjects() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const [list, setList] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("turnkey_projects" as never).select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setList((data as P[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="mb-4">{lang === "ar" ? "سجّل الدخول لعرض مشاريعك" : "Sign in to view your projects"}</p>
          <Link to="/auth"><Button className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "تسجيل الدخول" : "Sign in"}</Button></Link>
        </div>
      </Layout>
    );
  }

  const statusColor = (s: string) => ({
    open: "bg-blue-500/20 text-blue-600",
    bidding: "bg-amber-500/20 text-amber-600",
    in_progress: "bg-orange-500/20 text-orange-600",
    completed: "bg-green-500/20 text-green-600",
    cancelled: "bg-red-500/20 text-red-600",
  } as Record<string, string>)[s] ?? "bg-muted text-muted-foreground";

  const statusLabel = (s: string) => {
    const m: Record<string, [string, string]> = {
      open: ["مفتوح للعروض", "Open for bids"],
      bidding: ["استقبال العروض", "Bidding"],
      in_progress: ["قيد التنفيذ", "In progress"],
      completed: ["مكتمل", "Completed"],
      cancelled: ["ملغي", "Cancelled"],
    };
    const v = m[s] ?? [s, s];
    return lang === "ar" ? v[0] : v[1];
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black">{lang === "ar" ? "مشاريعي" : "My Projects"}</h1>
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "إدارة مشاريع تسليم المفتاح" : "Manage your turnkey projects"}</p>
          </div>
          <Link to="/turnkey/new"><Button className="bg-orange-grad text-accent-foreground"><Plus className="h-4 w-4 me-2" />{lang === "ar" ? "مشروع جديد" : "New project"}</Button></Link>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-2xl">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
            <p className="mb-4 text-muted-foreground">{lang === "ar" ? "لا توجد مشاريع بعد" : "No projects yet"}</p>
            <Link to="/turnkey/new"><Button className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "أنشئ أول مشروع" : "Create first project"}</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((p) => (
              <Link key={p.id} to="/turnkey/$id" params={{ id: p.id }} className="bg-card border rounded-2xl p-5 shadow-card hover:shadow-elegant transition-all block">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{p.project_number}</div>
                    <div className="font-bold capitalize">{p.project_type}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor(p.status)}`}>{statusLabel(p.status)}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1 mb-3">
                  <div>{lang === "ar" ? "المدينة" : "City"}: <span className="text-foreground font-semibold">{p.city}</span></div>
                  <div>{lang === "ar" ? "المساحة" : "Area"}: <span className="text-foreground font-semibold">{p.area_m2} m²</span></div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-orange-grad h-full transition-all" style={{ width: `${p.progress_percent ?? 0}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{p.progress_percent ?? 0}%</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
