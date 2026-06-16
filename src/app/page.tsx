import { getFeedPosts } from "@/actions/post.actions";
import { Feed } from "@/components/feed/Feed";

export const revalidate = 0; // Disable caching

export default async function Home() {
  const posts = await getFeedPosts();

  return (
    <main className="flex w-full max-w-2xl flex-col border-x min-h-screen">


      {/* Feed */}
      <Feed initialPosts={posts} />
    </main>
  );
}
