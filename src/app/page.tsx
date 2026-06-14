import { getFeedPosts } from "@/actions/post.actions";
import { Feed } from "@/components/feed/Feed";

export const revalidate = 0; // Disable caching

export default async function Home() {
  const posts = await getFeedPosts();

  return (
    <div className="flex justify-center w-full min-h-screen bg-background text-foreground">
      <main className="flex w-full max-w-2xl flex-col border-x min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 font-semibold cursor-pointer">
          For you
        </header>

        {/* Feed */}
        <Feed initialPosts={posts} />
      </main>
    </div>
  );
}
