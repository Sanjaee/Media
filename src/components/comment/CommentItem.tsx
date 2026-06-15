"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { deleteCommentAction, getRepliesAction } from "@/actions/comment.actions";
import { CommentForm } from "./CommentForm";

interface CommentItemProps {
  comment: any; // We'll type this properly later, or keep it generic
  postId: string;
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = session?.user?.id === comment.author.id;

  const deleteMutation = useMutation({
    mutationFn: deleteCommentAction,
    onSuccess: () => {
      if (comment.parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ["replies", comment.parentCommentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
    },
    onError: (e) => {
      console.error(e);
      alert("Failed to delete comment");
    }
  });

  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingReplies,
  } = useInfiniteQuery({
    queryKey: ["replies", comment.id],
    queryFn: async ({ pageParam }) => {
      return await getRepliesAction(comment.id, pageParam as Date | null);
    },
    initialPageParam: null as Date | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: showReplies,
  });

  const handleDelete = () => {
    if (confirm("Delete this comment?")) {
      deleteMutation.mutate(comment.id);
    }
  };

  const replies = repliesData?.pages.flatMap(page => page.replies) || [];

  return (
    <div className="flex gap-3 px-4 py-3 border-b hover:bg-muted/30 transition-colors relative group">
      <Link href={`/${comment.author.username}`} className="shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={comment.author.image ?? ""} alt={comment.author.name ?? ""} />
          <AvatarFallback>{comment.author.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-sm">
          <Link href={`/${comment.author.username}`} className="font-bold hover:underline truncate">
            {comment.author.name}
          </Link>
          <span className="text-muted-foreground truncate">@{comment.author.username}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ""}
          </span>
        </div>

        <div className="mt-1 text-[15px] whitespace-pre-wrap break-words pr-8">
          {comment.content}
        </div>

        <div className="flex items-center gap-6 mt-2 text-muted-foreground">
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-[13px] hover:text-blue-500 transition-colors group/btn"
          >
            <div className="p-1.5 rounded-full group-hover/btn:bg-blue-500/10"><MessageCircle size={16} /></div>
            <span>{comment.replyCount > 0 ? comment.replyCount : ""}</span>
          </button>
          
          <button className="flex items-center gap-1.5 text-[13px] hover:text-pink-500 transition-colors group/btn">
            <div className="p-1.5 rounded-full group-hover/btn:bg-pink-500/10"><Heart size={16} /></div>
            <span>{comment.likeCount > 0 ? comment.likeCount : ""}</span>
          </button>
        </div>

        {isReplying && (
          <div className="mt-3">
            <CommentForm 
              postId={postId} 
              parentCommentId={comment.id} 
              onSuccess={() => {
                setIsReplying(false);
                setShowReplies(true);
              }}
              autoFocus 
            />
          </div>
        )}

        {comment.replyCount > 0 && !showReplies && (
          <button 
            onClick={() => setShowReplies(true)}
            className="mt-2 text-sm text-blue-500 hover:underline font-medium"
          >
            Show {comment.replyCount} replies
          </button>
        )}

        {showReplies && (
          <div className="mt-3 flex flex-col gap-0 border-l-2 pl-4 ml-2 border-muted">
            {isLoadingReplies && <div className="text-sm text-muted-foreground py-2">Loading replies...</div>}
            {replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} postId={postId} />
            ))}
            {hasNextPage && (
              <button 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
                className="text-sm text-blue-500 hover:underline font-medium text-left mt-2"
              >
                {isFetchingNextPage ? "Loading..." : "Show more replies"}
              </button>
            )}
            <button 
              onClick={() => setShowReplies(false)}
              className="mt-2 text-sm text-muted-foreground hover:underline"
            >
              Hide replies
            </button>
          </div>
        )}
      </div>

      {isOwner && (
        <button 
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="absolute top-3 right-4 p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
