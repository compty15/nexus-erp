import { BarChart3, Package, Users, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your operations and analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Total Items" 
          value="1,248" 
          trend="+12% from last month" 
          icon={<Package className="text-primary" size={24} />} 
        />
        <DashboardCard 
          title="Active Services" 
          value="45" 
          trend="+2% from last month" 
          icon={<BarChart3 className="text-primary" size={24} />} 
        />
        <DashboardCard 
          title="B2B Vendors" 
          value="12" 
          trend="No change" 
          icon={<Truck className="text-primary" size={24} />} 
        />
        <DashboardCard 
          title="Total Customers" 
          value="3,492" 
          trend="+18% from last month" 
          icon={<Users className="text-primary" size={24} />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 border border-border bg-card rounded-xl p-6 shadow-sm">
           <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
           <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-lg text-muted-foreground">
             Activity Chart Placeholder
           </div>
        </div>
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
           <h2 className="text-lg font-semibold mb-4">System Alerts</h2>
           <div className="flex flex-col gap-3">
             <AlertItem title="AI Quota Low" description="Consider upgrading your usage plan." time="2h ago" />
             <AlertItem title="New Vendor Request" description="Alpha Logistics Inc. wants to connect." time="5h ago" />
             <AlertItem title="Item #8922 Updated" description="Price comparison synced successfully." time="1d ago" />
           </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col gap-2 transition-all hover:border-primary/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{trend}</div>
    </div>
  )
}

function AlertItem({ title, description, time }: { title: string, description: string, time: string }) {
  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-border last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{title}</span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  )
}
