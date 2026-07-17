"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close dropdown whenever the user navigates to a new page
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleSwitch = async (teamId: string) => {
    setIsOpen(false)
    await switchWorkspace(teamId)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-xl transition-all text-left active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 size={15} className="text-blue-400 shrink-0" />
          <span className="font-black text-[10px] uppercase tracking-widest text-white truncate">
            {activeTeamName || "Switch Workspace"}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-titanium-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay — z-[45] sits above the sidebar (z-40) so clicks outside register */}
          <div
            className="fixed inset-0 z-[45]"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown — z-[46] floats above the overlay */}
          <div className="absolute left-0 right-0 mt-2 bg-[#0d0d0d] border border-white/5 rounded-2xl shadow-2xl py-2 z-[46] animate-in fade-in slide-in-from-top-1 duration-100 backdrop-blur-xl">
            <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-titanium-500 border-b border-white/5 mb-1">
              Select Workspace
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleSwitch(ws.id)}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all truncate flex items-center gap-2 ${
                  ws.id === activeTeamId
                    ? "bg-white/5 text-blue-400"
                    : "text-titanium-300 hover:bg-white/5 hover:text-white"
                }`}
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
