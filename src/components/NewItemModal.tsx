"use client"
import { useState, useRef } from "react"
import { X, Upload, Loader2, Sparkles } from "lucide-react"
import imageCompression from "browser-image-compression"
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { z } from 'zod'

interface NewItemModalProps {
  onClose: () => void
}

export function NewItemModal({ onClose }: NewItemModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  
  const [userComments, setUserComments] = useState("")
  const [generatedTitle, setGeneratedTitle] = useState("")
  const [generatedDesc, setGeneratedDesc] = useState("")
  const [generatedPrice, setGeneratedPrice] = useState("0.00")
  const [isSaving, setIsSaving] = useState(false)

  const { object: generatedItem, submit: generateItem, isLoading: isGenerating } = useObject({
    api: '/api/analyze-item',
    schema: z.object({
      scientific: z.object({
        year: z.string(),
        material: z.string(),
        specs: z.string(),
      }),
      ebay: z.object({
        title: z.string(),
        description: z.string(),
      }),
      etsy: z.object({
        title: z.string(),
        description: z.string(),
      }),
      facebook: z.object({
        title: z.string(),
        description: z.string(),
      }),
      estimated_value: z.string(),
      item_name: z.string()
    })
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    setIsCompressing(true)
    
    // Show a quick, low-res preview immediately
    const objectUrl = URL.createObjectURL(rawFile)
    setPreview(objectUrl)

    try {
      const options = {
        maxSizeMB: 0.5, // 500KB max
        maxWidthOrHeight: 1024, // Enough resolution for AI to scan
        useWebWorker: true,
        fileType: "image/webp"
      }
      
      const compressedFile = await imageCompression(rawFile, options)
      setFile(compressedFile)
      
      // Update preview to the compressed version (optional, but saves memory)
      const compressedUrl = URL.createObjectURL(compressedFile)
      setPreview(compressedUrl)
      
      // Convert to base64 for API
      const reader = new FileReader()
      reader.readAsDataURL(compressedFile)
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
      }

      URL.revokeObjectURL(objectUrl) // Clean up old URL
      
    } catch (error) {
      console.error("Error compressing image:", error)
    } finally {
      setIsCompressing(false)
    }
  }

  const handleGenerateListing = async () => {
    if (!imageBase64) return
    
    generateItem({ 
      imageBase64, 
      userContext: userComments 
    })
  }

  const handleSaveItem = async () => {
    setIsSaving(true)
    try {
      const { createItem } = await import('@/app/items/actions')
      
      const fullDesc = `
### Scientific / Technical Details
- Year: ${generatedItem?.scientific?.year}
- Material: ${generatedItem?.scientific?.material}
- Specs: ${generatedItem?.scientific?.specs}

### eBay Listing
**Title:** ${generatedItem?.ebay?.title}
**Description:** ${generatedItem?.ebay?.description}

### Etsy Listing
**Title:** ${generatedItem?.etsy?.title}
**Description:** ${generatedItem?.etsy?.description}

### Facebook Marketplace
**Title:** ${generatedItem?.facebook?.title}
**Description:** ${generatedItem?.facebook?.description}
`
      const finalTitle = generatedTitle || generatedItem?.item_name || "New Item"
      const finalPrice = generatedPrice || generatedItem?.estimated_value || "0.00"

      await createItem(finalTitle, fullDesc, finalPrice, preview || "")
      onClose()
    } catch (error) {
      console.error(error)
      alert("Failed to save item. See console.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Add New Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Image Upload Area */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Item Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${preview ? 'border-primary' : 'border-border hover:border-primary/50 bg-secondary/30'}`}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    {isCompressing && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="animate-spin text-primary" size={32} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                    <Upload size={32} />
                    <span className="text-sm font-medium">Click to upload photo</span>
                    <span className="text-xs">High-res images will be compressed locally.</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              {file && (
                <div className="text-xs text-muted-foreground text-center flex justify-between px-1">
                  <span>Compressed ready for AI</span>
                  <span className="text-green-500 font-medium">~{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              )}
            </div>

            {/* Form Area */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">User Comments / Context</label>
                <textarea 
                  value={userComments}
                  onChange={(e) => setUserComments(e.target.value)}
                  placeholder="e.g. 'Found this in warehouse B, it's missing the left bracket...'"
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-none h-24"
                />
              </div>
              
              <button 
                onClick={handleGenerateListing}
                disabled={!file || isGenerating || isCompressing}
                className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>Auto-Generate Listing (AI)</span>
              </button>
              
              {(generatedItem || isGenerating) && (
                <div className="flex flex-col gap-2 mt-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Generated Item Name</label>
                    <input 
                      type="text" 
                      value={generatedTitle || generatedItem?.item_name || ""} 
                      onChange={(e) => setGeneratedTitle(e.target.value)}
                      placeholder={generatedItem?.item_name || "Streaming..."}
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Generated Details (Multi-Format)</label>
                    <div className="w-full bg-background border border-border rounded-lg p-2 text-sm h-64 overflow-y-auto">
                      {generatedItem?.scientific && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-xs mb-1">Scientific / Technical</h4>
                          <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                            <li>Year: {generatedItem.scientific.year}</li>
                            <li>Material: {generatedItem.scientific.material}</li>
                            <li>Specs: {generatedItem.scientific.specs}</li>
                          </ul>
                        </div>
                      )}
                      {generatedItem?.ebay && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-xs mb-1">eBay Listing</h4>
                          <p className="text-xs font-medium">{generatedItem.ebay.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{generatedItem.ebay.description}</p>
                        </div>
                      )}
                      {generatedItem?.etsy && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-xs mb-1">Etsy Listing</h4>
                          <p className="text-xs font-medium">{generatedItem.etsy.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{generatedItem.etsy.description}</p>
                        </div>
                      )}
                      {generatedItem?.facebook && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-xs mb-1">FB Marketplace</h4>
                          <p className="text-xs font-medium">{generatedItem.facebook.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{generatedItem.facebook.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Estimated Market Value ($)</label>
                    <input 
                      type="text" 
                      value={generatedPrice || generatedItem?.estimated_value || ""} 
                      onChange={(e) => setGeneratedPrice(e.target.value)}
                      placeholder={generatedItem?.estimated_value || "Streaming..."}
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-secondary/20">
          <button onClick={onClose} className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button 
            disabled={!generatedItem?.item_name || isSaving || isGenerating} 
            onClick={handleSaveItem}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>Save Item to Supabase</span>
          </button>
        </div>

      </div>
    </div>
  )
}
