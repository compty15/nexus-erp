'use client'

import { Settings as SettingsIcon, Link as LinkIcon, Check, Plus, Building2, HelpCircle } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  inviteUserByEmail, 
  getWorkspaceName, 
  renameWorkspace, 
  createNewWorkspace, 
  getUserWorkspaces, 
  switchWorkspace 
} from "./actions";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState<"general" | "workspaces">("general");
  const [copied, setCopied] = useState(false);
  const [emailInvite, setEmailInvite] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  
  const [workspaceName, setWorkspaceName] = useState("");
  const [renameStatus, setRenameStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  // Workspaces tab states
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [createStatus, setCreateStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [hasWorkspace, setHasWorkspace] = useState(false);

  useEffect(() => {
    async function loadData() {
      const list = await getUserWorkspaces();
      setWorkspaces(list);
      
      const name = await getWorkspaceName();
      if (name) {
        setWorkspaceName(name);
        setHasWorkspace(true);
        setActiveTab("general");
      } else {
        setHasWorkspace(false);
        setActiveTab("workspaces"); // Default to workspaces if they don't have one
      }
    }
    loadData();
    if (typeof window !== "undefined") {
      setGeneratedLink(`${window.location.origin}/login`);
    }
  }, []);

  useEffect(() => {
    if (tabParam === "workspaces") {
      setActiveTab("workspaces");
    }
  }, [tabParam]);
  
  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedLink || (typeof window !== "undefined" ? `${window.location.origin}/login` : "https://nexx-top.vercel.app/login"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    
    setRenameStatus("loading");
    try {
      await renameWorkspace(workspaceName);
      setRenameStatus("success");
      router.refresh();
      setTimeout(() => setRenameStatus("idle"), 3000);
    } catch (error) {
      setRenameStatus("error");
      setTimeout(() => setRenameStatus("idle"), 3000);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setCreateStatus("loading");
    try {
      const result = await createNewWorkspace(newWorkspaceName);
      if (result.success) {
        setCreateStatus("success");
        setNewWorkspaceName("");
        
        // Reload workspaces list and settings state
        const list = await getUserWorkspaces();
        setWorkspaces(list);
        
        const name = await getWorkspaceName();
        if (name) {
          setWorkspaceName(name);
          setHasWorkspace(true);
        }
        
        router.refresh();
        setActiveTab("general");
      }
      setTimeout(() => setCreateStatus("idle"), 3000);
    } catch (error) {
      setCreateStatus("error");
      setTimeout(() => setCreateStatus("idle"), 3000);
    }
  };

  const handleSwitch = async (teamId: string) => {
    await switchWorkspace(teamId);
    
    // Refresh all states to match the new workspace
    const name = await getWorkspaceName();
    if (name) {
      setWorkspaceName(name);
      setHasWorkspace(true);
    }
    
    router.refresh();
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInvite) return;
    
    setInviteStatus("loading");
    try {
      const result = await inviteUserByEmail(emailInvite);
      if (result.success && result.link) {
        setGeneratedLink(result.link);
      }
      setInviteStatus("success");
      setEmailInvite("");
      setTimeout(() => setInviteStatus("idle"), 3000);
    } catch (error) {
      setInviteStatus("error");
      setTimeout(() => setInviteStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-primary" size={32} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Manage workspaces, configurations, and user invitations.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border gap-4 mt-2">
        <button
          onClick={() => hasWorkspace && setActiveTab("general")}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            !hasWorkspace 
              ? "text-muted-foreground/40 cursor-not-allowed" 
              : activeTab === "general"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          disabled={!hasWorkspace}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("workspaces")}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "workspaces"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Workspaces ({workspaces.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "general" && hasWorkspace && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 animate-in fade-in duration-200">
          {/* Invite Users Section */}
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Invite to Workspace</h2>
            <p className="text-sm text-muted-foreground">
              Generate a secure invite link for a specific email. You can copy the link below and send it to them manually.
            </p>

            <h3 className="text-sm font-semibold mt-2">1. Generate Token for Email</h3>
            <form onSubmit={handleEmailInvite} className="flex items-center gap-2 mt-1">
              <input 
                type="email"
                placeholder="colleague@example.com"
                value={emailInvite}
                onChange={(e) => setEmailInvite(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
              <button 
                type="submit"
                disabled={inviteStatus === "loading"}
                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
              >
                {inviteStatus === "loading" ? "Generating..." : inviteStatus === "success" ? "Generated!" : "Generate"}
              </button>
            </form>
            {inviteStatus === "error" && (
              <p className="text-xs text-destructive">Failed to generate invite. Make sure you are the Workspace Owner.</p>
            )}

            <div className="my-2 border-t border-border"></div>
            
            <h3 className="text-sm font-semibold">2. Copy & Send to User</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-muted px-3 py-2 rounded-lg text-sm text-muted-foreground font-mono truncate flex-1 border border-border">
                {generatedLink}
              </div>
              <button 
                onClick={copyInviteLink}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shrink-0 w-[120px] justify-center"
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Rename Workspace Section */}
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Workspace Details</h2>
            <p className="text-sm text-muted-foreground">
              Update the name of your active workspace.
            </p>
            <form onSubmit={handleRename} className="flex flex-col gap-3 mt-1">
              <input 
                type="text"
                placeholder="Workspace Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
              <button 
                type="submit"
                disabled={renameStatus === "loading"}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {renameStatus === "loading" ? "Saving..." : renameStatus === "success" ? "Saved!" : "Save Changes"}
              </button>
              {renameStatus === "error" && (
                <p className="text-xs text-destructive">Failed to update workspace name. Make sure you are the Owner.</p>
              )}
            </form>
          </div>

          {/* Share App Section */}
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col gap-4 md:col-span-2">
            <h2 className="text-xl font-semibold">Share App</h2>
            <p className="text-sm text-muted-foreground">
              Want to invite a friend to use the app for their own workspace? Copy the generic app signup link. It won't share your workspace data.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-muted px-3 py-2 rounded-lg text-sm text-muted-foreground font-mono truncate flex-1 border border-border">
                {typeof window !== "undefined" ? `${window.location.origin}/join` : "https://nexx-top.vercel.app/join"}
              </div>
              <button 
                onClick={() => {
                  const link = typeof window !== "undefined" ? `${window.location.origin}/join` : "https://nexx-top.vercel.app/join";
                  navigator.clipboard.writeText(link);
                  alert("App link copied to clipboard!");
                }}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2 shrink-0 justify-center"
              >
                <LinkIcon size={16} /> Copy App Link
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "workspaces" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 animate-in fade-in duration-200">
          
          {/* Workspaces List / Switcher */}
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Your Workspaces</h2>
            <p className="text-sm text-muted-foreground">
              Below is a list of all workspaces you are a member of. Click one to switch to it.
            </p>

            {workspaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground gap-2">
                <Building2 size={36} className="text-muted-foreground/50" />
                <span className="text-sm font-medium">No Workspaces Found</span>
                <span className="text-xs">Create a workspace to start managing items and services.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {workspaces.map((ws) => {
                  const isActive = ws.name === workspaceName && hasWorkspace;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSwitch(ws.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        isActive 
                          ? "bg-primary/5 border-primary text-foreground font-medium" 
                          : "bg-background border-border hover:bg-secondary/30 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                        <span>{ws.name}</span>
                      </div>
                      {isActive && (
                        <span className="text-xs bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Workspace Form */}
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Create New Workspace</h2>
            <p className="text-sm text-muted-foreground">
              Create a new personal or corporate workspace to organize inventory, services, and customers separately.
            </p>
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-3 mt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Workspace Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Storage Depot, Retail Store"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={createStatus === "loading"}
                className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={16} />
                {createStatus === "loading" ? "Creating..." : createStatus === "success" ? "Created!" : "Create Workspace"}
              </button>
              {createStatus === "error" && (
                <p className="text-xs text-destructive">Failed to create workspace. Please try again.</p>
              )}
            </form>
          </div>

        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
