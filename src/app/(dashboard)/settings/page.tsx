'use client'

import { Settings as SettingsIcon, Link as LinkIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { inviteUserByEmail, getWorkspaceName, renameWorkspace } from "./actions";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [emailInvite, setEmailInvite] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [generatedLink, setGeneratedLink] = useState<string>("https://nexx-top.vercel.app/login");
  
  const [workspaceName, setWorkspaceName] = useState("");
  const [renameStatus, setRenameStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    async function loadName() {
      const name = await getWorkspaceName();
      if (name) setWorkspaceName(name);
    }
    loadName();
  }, []);
  
  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedLink);
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
      setTimeout(() => setRenameStatus("idle"), 3000);
    } catch (error) {
      setRenameStatus("error");
      setTimeout(() => setRenameStatus("idle"), 3000);
    }
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-primary" size={32} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account, team members, and global preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
              {inviteStatus === "loading" ? "Generating..." : inviteStatus === "success" ? "Generated!" : "Generate Link"}
            </button>
          </form>
          {inviteStatus === "error" && (
            <p className="text-xs text-destructive">Failed to generate invite. Make sure you are the Team Owner.</p>
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
          <h2 className="text-xl font-semibold">Workspace Name</h2>
          <p className="text-sm text-muted-foreground">
            Update your personal workspace name.
          </p>
          <form onSubmit={handleRename} className="flex flex-col gap-3 mt-1">
            <input 
              type="text"
              placeholder="Loading..."
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

        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col gap-4 md:col-span-2">
          <h2 className="text-xl font-semibold">Share App</h2>
          <p className="text-sm text-muted-foreground">
            Want to invite a friend to use the app for their own home or business? Copy the generic link below. It won't share your workspace data.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-muted px-3 py-2 rounded-lg text-sm text-muted-foreground font-mono truncate flex-1 border border-border">
              https://nexx-top.vercel.app/join
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText("https://nexx-top.vercel.app/join");
                alert("App link copied to clipboard!");
              }}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2 shrink-0 justify-center"
            >
              <LinkIcon size={16} /> Copy App Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
