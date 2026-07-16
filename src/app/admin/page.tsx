import { ShieldAlert, Users, Activity, Database } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="text-destructive" size={32} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive">Admin Portal</h1>
          <p className="text-muted-foreground mt-1">Restricted access area. Manage users, telemetry, and system limits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">AI Usage Costs</h2>
            <Activity className="text-primary" size={20} />
          </div>
          <div className="text-3xl font-bold">$12.45</div>
          <p className="text-sm text-muted-foreground mt-2">Estimated cost this billing cycle across all users.</p>
        </div>
        
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Active Users</h2>
            <Users className="text-primary" size={20} />
          </div>
          <div className="text-3xl font-bold">4</div>
          <p className="text-sm text-muted-foreground mt-2">Currently provisioned accounts.</p>
        </div>

        <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Database Storage</h2>
            <Database className="text-primary" size={20} />
          </div>
          <div className="text-3xl font-bold">42%</div>
          <p className="text-sm text-muted-foreground mt-2">Capacity used on free tier.</p>
        </div>
      </div>
      
      <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-6 mt-4">
        <h2 className="text-xl font-bold text-destructive mb-4">Security Policies (RLS)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Row Level Security ensures users can only see items and data they have created. Only administrators can view global telemetry.
        </p>
        <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-colors">
          Manage RLS Policies
        </button>
      </div>
    </div>
  );
}
