import { Wrench, MapPin } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services & Projects</h1>
          <p className="text-muted-foreground mt-1">Research costs and locate nearby service providers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
             <Wrench className="text-primary" size={20} />
             <h2 className="text-lg font-semibold">Service Cost Estimator</h2>
           </div>
           <p className="text-sm text-muted-foreground mb-4">Calculate average costs based on market data for specific projects.</p>
           <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-lg text-muted-foreground">
             Cost Estimator Tool
           </div>
        </div>
        
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
             <MapPin className="text-primary" size={20} />
             <h2 className="text-lg font-semibold">Nearby Providers</h2>
           </div>
           <p className="text-sm text-muted-foreground mb-4">Searching providers within 50 miles of your Settings location.</p>
           <div className="flex flex-col gap-3">
             <div className="p-3 border border-border rounded-lg flex justify-between items-center hover:border-primary/50 cursor-pointer">
               <div>
                 <div className="font-semibold">Apex Industrial Repairs</div>
                 <div className="text-xs text-muted-foreground">12.4 miles away</div>
               </div>
               <button className="text-primary text-sm font-medium hover:underline">Contact</button>
             </div>
             <div className="p-3 border border-border rounded-lg flex justify-between items-center hover:border-primary/50 cursor-pointer">
               <div>
                 <div className="font-semibold">National Gearbox Services</div>
                 <div className="text-xs text-muted-foreground">28.1 miles away</div>
               </div>
               <button className="text-primary text-sm font-medium hover:underline">Contact</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
