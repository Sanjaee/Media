"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PostWithRelations } from "@/store/usePostStore";
import { X, MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCloudinaryUrl } from "@/lib/utils";

export function PhotoModal({ post, photoId }: { post: PostWithRelations, photoId: string }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      router.back();
    }
  };

  const photoUrl = post.media?.find(m => m.id === photoId)?.url;

  if (!photoUrl) return null;

  return (
    <div 
      ref={overlayRef}
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex bg-black/90 backdrop-blur-sm"
    >
      {/* Close Button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Left side: Photo */}
      <div className="flex-1 relative flex items-center justify-center p-4 lg:p-12 pointer-events-none">
        <div className="relative w-full h-full max-h-screen pointer-events-auto">
          <Image 
            src={getCloudinaryUrl(photoUrl, "f_auto,q_auto,w_1920,c_limit")} 
            alt="Post image" 
            fill 
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right side: Sidebar (Post details) */}
      <div className="w-full max-w-sm bg-background border-l flex flex-col overflow-y-auto hidden md:flex h-full pointer-events-auto">
        <div className="p-4 border-b">
           {/* Post details here... similar to PostCard but vertical */}
           <div className="flex items-center gap-3">
             <Avatar className="w-10 h-10">
               <AvatarImage src={post.author.image ?? ""} alt={post.author.name ?? ""} />
               <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
             </Avatar>
             <div>
               <div className="flex items-center gap-1 text-sm font-bold">
                 {post.author.name}
                 {post.author.isVerified && <span className="text-primary text-[10px] bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">✓</span>}
               </div>
               <div className="text-sm text-muted-foreground">@{post.author.username}</div>
             </div>
           </div>
           
           <div className="mt-3 text-[15px] whitespace-pre-wrap break-words pr-8">
             {post.content}
           </div>

           <div className="mt-3 text-sm text-muted-foreground">
             {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { hour: 'numeric', minute: 'numeric', month: "short", day: "numeric", year: "numeric" }) : ""}
           </div>

           <div className="flex justify-between items-center mt-4 pt-4 border-t text-muted-foreground">
             {/* Stats here */}
             <button className="flex items-center gap-1 text-[13px] hover:text-blue-500 transition-colors group">
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
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
