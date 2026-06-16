"use client"

import { Search, History } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function NavbarSearch() {
  const router = useRouter()
  const [isFocused, setIsFocused] = useState(false)
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`)
      setIsFocused(false)
    }
  }
  return (
    <div className="w-full relative">
      <form 
        onSubmit={handleSubmit}
        className="flex items-center bg-muted/50 rounded-full px-4 py-2 w-full focus-within:bg-background focus-within:ring-2 focus-within:ring-primary transition relative z-50"
      >
        <Search className="w-5 h-5 text-muted-foreground mr-3" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search MediaApp"
          className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
        />
      </form>

      {/* Autocomplete Dropdown Layout */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg z-40 p-2">
          <div className="flex flex-col">
            <div className="px-3 py-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent searches</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition" onClick={() => { setQuery("Next.js 15 update"); router.push("/explore?q=Next.js 15 update") }}>
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Next.js 15 update</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition" onClick={() => { setQuery("React Server Components"); router.push("/explore?q=React Server Components") }}>
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">React Server Components</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition" onClick={() => { setQuery("Tailwind CSS v4"); router.push("/explore?q=Tailwind CSS v4") }}>
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tailwind CSS v4</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
