"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { searchPostsAction } from "@/actions/post.actions"
import { PostCard } from "@/components/feed/PostCard"
import { Loader2 } from "lucide-react"

function ExploreContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", query, "explore"],
    queryFn: () => searchPostsAction(query, 20),
    enabled: query.trim().length > 0,
  })

  return (
    <main className="flex w-full max-w-2xl flex-col border-x min-h-screen">
      <header className="sticky top-14 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 font-semibold">
        {query ? `Search results for "${query}"` : "Explore"}
      </header>
      
      <div className="p-0 sm:p-4">
        {query ? (
          <div className="flex flex-col gap-0 sm:gap-2 pb-20">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Searching for "{query}"...</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((post) => (
                <PostCard key={post.id} post={post as any} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-lg font-semibold mb-2">No results found</p>
                <p>We couldn't find any posts matching "{query}".</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
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
          </div>
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
