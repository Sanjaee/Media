"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function ExploreContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  return (
    <main className="flex w-full max-w-2xl flex-col border-x min-h-screen">
      <header className="sticky top-14 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 font-semibold">
        {query ? `Search results for "${query}"` : "Explore"}
      </header>
      
      <div className="p-6">
        {query ? (
          <div>
            <p className="text-muted-foreground mb-4">Showing mock results for <strong>{query}</strong>...</p>
            {/* Mock search results here */}
            <div className="border p-4 rounded-xl mb-4">
              <p className="font-bold">Result 1</p>
              <p className="text-sm text-muted-foreground">This is a mock result for {query}</p>
            </div>
            <div className="border p-4 rounded-xl">
              <p className="font-bold">Result 2</p>
              <p className="text-sm text-muted-foreground">Another mock result matching {query}</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-bold text-2xl mb-6">Trending</h2>
            <div className="flex flex-col gap-4">
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground">Trending in Technology</p>
                <p className="font-bold text-lg">Next.js 15</p>
                <p className="text-sm text-muted-foreground">25.4K posts</p>
              </div>
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground">Trending in Indonesia</p>
                <p className="font-bold text-lg">React Server Components</p>
                <p className="text-sm text-muted-foreground">12.1K posts</p>
              </div>
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground">Trending Worldwide</p>
                <p className="font-bold text-lg">AI Engineering</p>
                <p className="text-sm text-muted-foreground">89.2K posts</p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  )
}
