import { Home, Package, Truck, Users, Settings, Wrench, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export function Sidebar() {
  return (
    <div className="w-64 border-r border-border bg-card h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground text-xl">N</span>
          </div>
          <span className="font-bold text-xl text-foreground">Nexx-Top</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Home size={18} />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link href="/items" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Package size={18} />
          <span className="font-medium">Items</span>
        </Link>
        <Link href="/services" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Wrench size={18} />
          <span className="font-medium">Services</span>
        </Link>
        <Link href="/logistics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Truck size={18} />
          <span className="font-medium">Logistics</span>
        </Link>
        <Link href="/customers" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Users size={18} />
          <span className="font-medium">Customers</span>
        </Link>
      </div>
      
      <div className="p-4 border-t border-border flex flex-col gap-1">
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-destructive hover:text-destructive/80 transition-colors">
          <ShieldAlert size={18} />
          <span className="font-medium">Admin Portal</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <Settings size={18} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  )
}
