'use client'

import { Settings as SettingsIcon, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { inviteUserByEmail } from "./actions";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [emailInvite, setEmailInvite] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const inviteLink = "https://nexx-top.vercel.app/login";

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInvite) return;
    
    setInviteStatus("loading");
    try {
      await inviteUserByEmail(emailInvite);
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
          <h2 className="text-xl font-semibold">Invite Team Members</h2>
          <p className="text-sm text-muted-foreground">
            Share this secure invite link with anyone you want to join your Nexx-Top environment. 
            They will be able to create their own secure account outside of your current session.
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-muted px-3 py-2 rounded-lg text-sm text-muted-foreground font-mono truncate flex-1 border border-border">
              {inviteLink}
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
          <p className="text-xs text-muted-foreground mt-2">
            * Send this link to a colleague, or open it in a private/incognito window to test creating a fresh account yourself without logging out!
          </p>

          <div className="my-4 border-t border-border"></div>

          <h3 className="text-sm font-semibold">Direct Email Invite</h3>
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
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {inviteStatus === "loading" ? "Sending..." : inviteStatus === "success" ? "Sent!" : "Send Invite"}
            </button>
          </form>
          {inviteStatus === "error" && (
            <p className="text-xs text-destructive">Failed to send invite. Make sure you have Admin rights.</p>
          )}
        </div>

        {/* Placeholder for other settings */}
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Theme Preferences</h2>
          <p className="text-sm text-muted-foreground">Customize the layout and look of your dashboard.</p>
          <div className="flex items-center justify-between border border-border p-4 rounded-lg mt-2 opacity-50 cursor-not-allowed">
            <span>Dark Mode Enforced</span>
            <div className="w-10 h-5 bg-primary rounded-full relative">
              <div className="w-4 h-4 bg-background rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
