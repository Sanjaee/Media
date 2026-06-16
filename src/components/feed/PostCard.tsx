"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Bookmark, Share, Trash2, MoreHorizontal, Edit, UserPlus, Ban, Flag, ThumbsUp } from "lucide-react";
import { PostWithRelations, usePostStore } from "@/store/usePostStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCloudinaryUrl } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { deletePostAction } from "@/actions/post.actions";
import { useState } from "react";
import { CommentForm } from "@/components/comment/CommentForm";
import { UserNameWithRole } from "@/components/ui/UserNameWithRole";
import { toast } from "sonner";

export function PostCard({ post }: { post: PostWithRelations }) {
  const { data: session } = useSession();
  const deletePost = usePostStore(state => state.deletePost);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePostAction(post.id);
      deletePost(post.id);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const isOwner = session?.user?.id === post.author.id;

  return (
    <article className="border-b px-4 py-3 hover:bg-muted/30 transition-colors flex flex-col relative">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 text-sm">
          {/* Avatar */}
          <Link href={`/${post.author.username || 'user'}`} className="shrink-0">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.image ?? ""} alt={post.author.name ?? ""} />
              <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>

          {/* Name & Meta */}
          <div className="flex flex-wrap items-center gap-1">
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
        </div>

        {/* Options Dropdown */}
        <div className="-mt-1">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors" />
            }>
              <MoreHorizontal size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isOwner ? (
                <>
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => toast.info("Fitur edit akan segera hadir!")}>
                    <Edit size={16} />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 gap-2" 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteAlert(true);
                    }} 
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => toast.info("Fitur Add Friend akan segera hadir!")}>
                    <UserPlus size={16} />
                    <span>Add Friend</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-yellow-600 focus:text-yellow-600 focus:bg-yellow-500/10 gap-2" onClick={() => toast.info("Fitur Block akan segera hadir!")}>
                    <Ban size={16} />
                    <span>Block @{post.author.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 gap-2" onClick={() => toast.info("Fitur Report akan segera hadir!")}>
                    <Flag size={16} />
                    <span>Report</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex flex-col min-w-0">
        {/* Body Text */}
        <div className="text-[15px] whitespace-pre-wrap break-words mb-1">
          {post.content}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`mt-3 rounded-2xl overflow-hidden border bg-muted ${
            post.media.length === 1 ? 'flex flex-col' : 'grid grid-cols-2 gap-0.5'
          }`}>
            {post.media.map((media) => (
              <Link 
                key={media.id} 
                href={`/${post.author.username || 'user'}/status/${post.id}/photo/${media.id}`}
                scroll={false}
                className="block relative"
              >
                <div className={`relative w-full ${post.media.length > 1 ? 'aspect-square sm:aspect-[4/3]' : ''}`}>
                  {post.media.length === 1 ? (
                    <Image 
                      src={getCloudinaryUrl(media.url, "f_auto,q_auto,w_1200,c_limit")} 
                      alt="Post media" 
                      width={media.width || 1200}
                      height={media.height || 800}
                      className="w-full h-auto object-cover max-h-[80vh]"
                    />
                  ) : (
                    <Image 
                      src={getCloudinaryUrl(media.url, "f_auto,q_auto,w_800,c_limit")} 
                      alt="Post media" 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mt-3 text-muted-foreground">
          <button className="flex-1 flex justify-center items-center gap-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors text-[13px] font-medium">
            <ThumbsUp size={18} />
            <span>Like</span>
          </button>
          
          <button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex-1 flex justify-center items-center gap-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors text-[13px] font-medium"
          >
            <MessageCircle size={18} />
            <span>Comment</span>
          </button>

          <button className="flex-1 flex justify-center items-center gap-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors text-[13px] font-medium">
            <Bookmark size={18} />
            <span>Bookmark</span>
          </button>

          <button className="flex-1 flex justify-center items-center gap-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors text-[13px] font-medium">
            <Share size={18} />
            <span>Share</span>
          </button>
        </div>

        {/* Reply Modal */}
        <Dialog open={showCommentForm} onOpenChange={setShowCommentForm} disablePointerDismissal>
          <DialogContent 
            className="sm:max-w-[500px] p-0 border-none bg-background shadow-xl rounded-2xl"
          >
            <DialogTitle className="sr-only">Reply to Post</DialogTitle>
            <div className="flex flex-col pt-8 px-4 pb-2">
              {/* Original Post Snippet */}
              <div className="flex gap-3 relative mb-2">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.image ?? ""} alt={post.author.name ?? ""} />
                    <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="w-0.5 h-full bg-border grow" />
                </div>
                <div className="flex flex-col pb-4 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 text-sm">
                    <span className="font-bold truncate">{post.author.name}</span>
                    {post.author.isVerified && (
                      <span className="text-primary text-[10px] bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                        ✓
                      </span>
                    )}
                    <span className="text-muted-foreground truncate">@{post.author.username}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                  <div className="mt-1 text-[15px] whitespace-pre-wrap break-words">{post.content}</div>
                  <div className="mt-4 text-[13px] text-muted-foreground">
                    Replying to <span className="text-blue-500">@{post.author.username}</span>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              <div className="-mx-4 border-none">
                <CommentForm 
                  postId={post.id} 
                  onSuccess={() => setShowCommentForm(false)} 
                  autoFocus 
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
                setShowDeleteAlert(false);
              }}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
