import { Sidebar } from "@/components/Sidebar";
import { getUserWorkspaces, getWorkspaceName } from "./settings/actions";
import { getUserTeamId } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import NotificationCenter from "@/components/ui/NotificationCenter";
import DynamicBackground from "@/components/ui/DynamicBackground";
import ViewModeWrapper from "@/components/layout/ViewModeWrapper";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth guard — redirect to login if not authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.user_metadata?.role === "admin";

  const [workspaces, activeTeamId, activeTeamName] = await Promise.all([
    getUserWorkspaces().catch(() => []),
    getUserTeamId().catch(() => null),
    getWorkspaceName().catch(() => null),
  ]);

  const hasTeam = !!activeTeamId;

  return (
    <div className="flex min-h-screen">
      <DynamicBackground />
      {hasTeam && (
        <Sidebar
          workspaces={workspaces}
          activeTeamId={activeTeamId ?? ""}
          activeTeamName={activeTeamName ?? "My Workspace"}
          isAdmin={isAdmin}
        />
      )}
      <div
        className="flex flex-col flex-1 min-h-screen"
        style={{ marginLeft: hasTeam ? "var(--sidebar-width)" : "0" }}
      >
        <Header />
        <main className="relative z-10 flex-1 pt-20 pb-32 md:pb-20">
          <ViewModeWrapper>
            {children}
          </ViewModeWrapper>
        </main>
        <BottomNav />
        <NotificationCenter />
      </div>
    </div>
  );
}
