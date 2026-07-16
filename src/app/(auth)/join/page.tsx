import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <ShieldAlert className="text-destructive mb-4" size={48} />
          <h1 className="text-2xl font-bold mb-2">Invalid Invite Link</h1>
          <p className="text-muted-foreground mb-6">
            This invite link is missing a secure token. Please ask your team administrator for a valid link.
          </p>
          <a href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  // 1. Validate the invite token
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select("*, teams(name)")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <ShieldAlert className="text-destructive mb-4" size={48} />
          <h1 className="text-2xl font-bold mb-2">Invite Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This invite link is invalid or has already been used.
          </p>
          <a href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // 2. Check if the user is already logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Force them to login or signup. 
    // We could pass the token in a cookie or returnUrl to handle post-login.
    // For simplicity, we just redirect to login with a next param.
    redirect(`/login?next=/join?token=${token}`);
  }

  // 3. User is logged in. Add them to the team!
  const teamId = invite.team_id;

  // Insert into team_members
  const { error: joinError } = await supabase
    .from("team_members")
    .insert({
      team_id: teamId,
      user_id: user.id,
      role: 'member'
    });

  if (joinError && joinError.code !== '23505') { // 23505 is unique violation (already a member)
    console.error("Failed to join team:", joinError);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <ShieldAlert className="text-destructive mb-4" size={48} />
          <h1 className="text-2xl font-bold mb-2">Error Joining Team</h1>
          <p className="text-muted-foreground mb-6">
            There was an issue adding you to the team. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Delete or update the invite so it can't be used again
  await supabase.from("invites").update({ status: 'accepted' }).eq("token", token);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-xl max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-primary" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to the Workspace!</h1>
        <p className="text-muted-foreground mb-6">
          You have successfully joined the secure workspace for <strong>{invite.teams?.name || "the user"}</strong>.
        </p>
        <a href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 w-full justify-center">
          Go to Dashboard <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}
