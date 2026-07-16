import { Building2, Mail, Phone } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Relations (CRM)</h1>
          <p className="text-muted-foreground mt-1">Manage B2B and B2C clients, track orders, and handle communications.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Sample Customer Card */}
        <div className="border border-border bg-card rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                ST
              </div>
              <div>
                <h2 className="font-semibold group-hover:text-primary transition-colors">Synergy Tech LLC</h2>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 size={12} /> B2B Partner
                </div>
              </div>
            </div>
            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs font-medium">Active</span>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2"><Mail size={14} /> purchasing@synergytech.com</div>
            <div className="flex items-center gap-2"><Phone size={14} /> (555) 123-4567</div>
          </div>
          
          <div className="pt-4 border-t border-border flex justify-between items-center text-sm">
            <span className="font-medium">Total Volume: <span className="text-foreground">$24,500</span></span>
            <button className="text-primary hover:underline font-medium">View Profile</button>
          </div>
        </div>

        {/* Sample Customer Card 2 */}
        <div className="border border-border bg-card rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                MJ
              </div>
              <div>
                <h2 className="font-semibold group-hover:text-primary transition-colors">Michael Johnson</h2>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                   B2C Customer
                </div>
              </div>
            </div>
            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs font-medium">Active</span>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2"><Mail size={14} /> m.johnson88@gmail.com</div>
            <div className="flex items-center gap-2"><Phone size={14} /> (555) 987-6543</div>
          </div>
          
          <div className="pt-4 border-t border-border flex justify-between items-center text-sm">
            <span className="font-medium">Total Volume: <span className="text-foreground">$1,250</span></span>
            <button className="text-primary hover:underline font-medium">View Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}
