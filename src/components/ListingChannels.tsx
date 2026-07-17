"use client"
import { useState } from "react"
import { ClipboardCopy, ExternalLink, Check } from "lucide-react"

interface ChannelData {
  title: string
  description: string
}

interface ListingChannelsProps {
  listings: {
    scientific?: {
      year: string
      material: string
      specs: string
    }
    ebay?: ChannelData
    etsy?: ChannelData
    facebook?: ChannelData
  }
}

export function ListingChannels({ listings }: ListingChannelsProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(id)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("Failed to copy!", err)
    }
  }

  const channels = [
    {
      name: "eBay",
      data: listings?.ebay,
      url: "https://www.ebay.com/sl/sell",
      color: "border-blue-500/20 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10"
    },
    {
      name: "Etsy",
      data: listings?.etsy,
      url: "https://www.etsy.com/your/shops/me/listings/create",
      color: "border-orange-500/20 bg-orange-500/5 text-orange-600 hover:bg-orange-500/10"
    },
    {
      name: "Facebook Marketplace",
      data: listings?.facebook,
      url: "https://www.facebook.com/marketplace/create/item",
      color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-600 hover:bg-indigo-500/10"
    }
  ]

  return (
    <div className="flex flex-col gap-4 mt-2">
      <h3 className="text-sm font-bold text-foreground">1-Click Quick Listing Channels</h3>
      <div className="grid grid-cols-1 gap-4">
        {channels.map((ch) => {
          if (!ch.data) return null;
          const copyText = `Title: ${ch.data.title}\n\nDescription: ${ch.data.description}`
          const isCopied = copiedIndex === ch.name

          return (
            <div key={ch.name} className="border border-border rounded-xl p-4 bg-card shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{ch.name} Channel</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(copyText, ch.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border bg-background hover:bg-secondary rounded-lg transition-colors"
                  >
                    {isCopied ? <Check size={14} className="text-green-500" /> : <ClipboardCopy size={14} />}
                    <span>{isCopied ? "Copied!" : "Copy Listing Details"}</span>
                  </button>
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${ch.color}`}
                  >
                    <span>Launch {ch.name}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="bg-secondary/40 rounded-lg p-3 text-xs flex flex-col gap-2 font-mono border border-border/50">
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">Generated Title:</span>
                  <span className="text-foreground">{ch.data.title}</span>
                </div>
                <div className="border-t border-border/30 pt-2">
                  <span className="font-semibold text-muted-foreground block mb-1">Generated Description:</span>
                  <span className="text-foreground whitespace-pre-wrap">{ch.data.description}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
