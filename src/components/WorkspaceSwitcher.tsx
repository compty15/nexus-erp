"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Building2 } from "lucide-react"
import { switchWorkspace } from "@/app/(dashboard)/settings/actions"

interface Workspace {
  id: string
  name: string
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[]
  activeTeamId: string
  activeTeamName: string
}

export function WorkspaceSwitcher({ workspaces, activeTeamId, activeTeamName }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSwitch = async (teamId: string) => {
    setIsOpen(false)
    await switchWorkspace(teamId)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-secondary/50 border border-border hover:bg-secondary rounded-lg transition-colors text-left"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 size={16} className="text-primary shrink-0" />
          <span className="font-semibold text-sm truncate">{activeTeamName || "Loading..."}</span>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-100">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
              Switch Workspace
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleSwitch(ws.id)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors truncate flex items-center gap-2 ${ws.id === activeTeamId ? 'bg-secondary font-medium text-primary' : 'text-foreground'}`}
              >
                {ws.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
