import { Truck, Package, Clock } from "lucide-react";

export default function LogisticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistics Hub</h1>
          <p className="text-muted-foreground mt-1">Track shipments, manage inventory flow, and monitor ETAs.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          New Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <Truck className="text-primary mb-2" size={28} />
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">In Transit</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <Package className="text-primary mb-2" size={28} />
          <div className="text-2xl font-bold">4</div>
          <div className="text-sm text-muted-foreground">Pending Dispatch</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <Clock className="text-primary mb-2" size={28} />
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-muted-foreground">Delayed</div>
        </div>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="font-medium px-4 py-3">Tracking ID</th>
              <th className="font-medium px-4 py-3">Destination</th>
              <th className="font-medium px-4 py-3">Carrier</th>
              <th className="font-medium px-4 py-3">Status</th>
              <th className="font-medium px-4 py-3 text-right">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-primary cursor-pointer hover:underline">TRK-9921</td>
              <td className="px-4 py-3">Dallas, TX</td>
              <td className="px-4 py-3">FedEx Freight</td>
              <td className="px-4 py-3"><span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md text-xs font-medium">In Transit</span></td>
              <td className="px-4 py-3 text-right">Tomorrow, 10:00 AM</td>
            </tr>
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-primary cursor-pointer hover:underline">TRK-8842</td>
              <td className="px-4 py-3">Chicago, IL</td>
              <td className="px-4 py-3">UPS Ground</td>
              <td className="px-4 py-3"><span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md text-xs font-medium">Pending</span></td>
              <td className="px-4 py-3 text-right">Oct 24, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
