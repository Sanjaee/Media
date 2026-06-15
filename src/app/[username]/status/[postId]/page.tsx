import { notFound } from "next/navigation";
import { getPostById } from "@/actions/post.actions";
import { PostCard } from "@/components/feed/PostCard";
import { CommentFeed } from "@/components/comment/CommentFeed";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PostPageProps {
  params: Promise<{
    username: string;
    postId: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.postId);

  if (!post) {
    notFound();
  }
  
  const expectedUsername = post.author.username || 'user';
  if (expectedUsername !== resolvedParams.username) {
    notFound();
  }

  return (
    <div className="flex justify-center w-full min-h-screen bg-background text-foreground">
      <main className="flex w-full max-w-2xl flex-col border-x min-h-screen">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 font-semibold flex items-center gap-6">
          <Link href="/" className="hover:bg-muted/50 p-2 rounded-full transition-colors -ml-2">
            <ArrowLeft size={20} />
          </Link>
          Post
        </header>

        <PostCard post={post as any} />
        <CommentFeed postId={post.id} />
      </main>
    </div>
  );
}
