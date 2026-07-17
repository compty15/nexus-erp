import { Sidebar } from "@/components/Sidebar";
import { getUserWorkspaces, getWorkspaceName } from "./settings/actions";
import { getUserTeamId } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [workspaces, activeTeamId, activeTeamName] = await Promise.all([
    getUserWorkspaces(),
    getUserTeamId(),
    getWorkspaceName()
  ]);

  const hasTeam = !!activeTeamId;

  return (
    <div className="flex min-h-screen">
      {hasTeam && (
        <Sidebar 
          workspaces={workspaces} 
          activeTeamId={activeTeamId || ""} 
          activeTeamName={activeTeamName} 
        />
      )}
      <main className={`flex-1 ${hasTeam ? 'ml-64' : ''} p-8`}>
        {children}
      </main>
    </div>
  );
}
