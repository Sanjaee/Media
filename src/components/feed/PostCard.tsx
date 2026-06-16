"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share, Trash2 } from "lucide-react";
import { PostWithRelations, usePostStore } from "@/store/usePostStore";
import { getCloudinaryUrl } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { deletePostAction } from "@/actions/post.actions";
import { useState } from "react";
import { CommentForm } from "@/components/comment/CommentForm";
import { UserNameWithRole } from "@/components/ui/UserNameWithRole";

export function PostCard({ post }: { post: PostWithRelations }) {
  const { data: session } = useSession();
  const deletePost = usePostStore(state => state.deletePost);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      await deletePostAction(post.id);
      deletePost(post.id);
    } catch (e) {
      console.error(e);
      alert("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const isOwner = session?.user?.id === post.author.id;

  return (
    <article className="border-b px-4 py-3 hover:bg-muted/30 transition-colors flex gap-3 relative">
      {/* Delete button */}
      {isOwner && (
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="absolute top-3 right-4 p-2 text-muted-foreground hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Avatar */}
      <Link href={`/${post.author.username || 'user'}`} className="shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author.image ?? ""} alt={post.author.name ?? ""} />
          <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1 text-sm">
          <Link href={`/${post.author.username || 'user'}`} className="truncate">
            <UserNameWithRole displayName={post.author.name || ""} role={post.author.role} className="mb-0 text-sm" />
          </Link>
          {post.author.isVerified && (
            <span className="text-primary text-[10px] bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">
              ✓
            </span>
          )}
          <Link href={`/${post.author.username || 'user'}`} className="text-muted-foreground truncate">
            @{post.author.username}
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href={`/${post.author.username || 'user'}/status/${post.id}`} className="text-muted-foreground hover:underline whitespace-nowrap">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
          </Link>
        </div>

        {/* Body Text */}
        <div className="mt-1 text-[15px] whitespace-pre-wrap break-words pr-8">
          {post.content}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mt-3 rounded-2xl overflow-hidden border">
            {post.media.map((media) => (
              <Link 
                key={media.id} 
                href={`/${post.author.username || 'user'}/status/${post.id}/photo/${media.id}`}
                scroll={false}
              >
                <div className="relative w-full bg-muted">
                  <Image 
                    src={getCloudinaryUrl(media.url, "f_auto,q_auto,w_1200,c_limit")} 
                    alt="Post media" 
                    width={media.width || 1200}
                    height={media.height || 800}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mt-1 text-muted-foreground max-w-md">
          <button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center gap-1 text-[13px] hover:text-blue-500 transition-colors group"
          >
            <div className="p-2 rounded-full group-hover:bg-blue-500/10"><MessageCircle size={18} /></div>
            <span>{post.stats.replies}</span>
          </button>
          <button className="flex items-center gap-1 text-[13px] hover:text-green-500 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-green-500/10"><Repeat2 size={18} /></div>
            <span>{post.stats.reposts}</span>
          </button>
          <button className="flex items-center gap-1 text-[13px] hover:text-pink-500 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-pink-500/10"><Heart size={18} /></div>
            <span>{post.stats.likes > 1000 ? `${(post.stats.likes / 1000).toFixed(1)}K` : post.stats.likes}</span>
          </button>
          <button className="flex items-center gap-1 text-[13px] hover:text-blue-500 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-blue-500/10"><BarChart2 size={18} /></div>
            <span>{post.stats.views > 1000 ? `${(post.stats.views / 1000).toFixed(1)}K` : post.stats.views}</span>
          </button>
          <div className="flex items-center gap-0">
            <button className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors"><Bookmark size={18} /></button>
            <button className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors"><Share size={18} /></button>
          </div>
        </div>

        {/* Inline Comment Form */}
        {showCommentForm && (
          <div className="mt-2 -mx-4 border-t">
            <CommentForm 
              postId={post.id} 
              onSuccess={() => setShowCommentForm(false)} 
              autoFocus 
            />
          </div>
        )}
      </div>
    </article>
  );
}
