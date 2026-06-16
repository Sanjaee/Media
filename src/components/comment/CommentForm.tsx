"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, CreateCommentInput } from "@/lib/validations/comment";
import { createCommentAction } from "@/actions/comment.actions";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({ postId, parentCommentId, onSuccess, autoFocus }: CommentFormProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      postId,
      parentCommentId: parentCommentId || null,
      content: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createCommentAction,
    onSuccess: () => {
      form.reset();
      if (parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ["replies", parentCommentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      }
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment");
    }
  });

  const onSubmit = (data: CreateCommentInput) => {
    mutation.mutate(data);
  };

  if (!session?.user) return null;

  return (
    <div className="flex gap-3 px-4 py-3 ">
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
        <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-2">
        <Textarea 
          {...form.register("content")}
          placeholder={parentCommentId ? "Post your reply" : "Post your reply"}
          className="min-h-[40px] border-none shadow-none focus-visible:ring-0 text-lg resize-none py-2 bg-transparent overflow-hidden"
          autoFocus={autoFocus}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "40px";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        
        <div className="flex justify-between items-center mt-2 border-t pt-2">
          <div className="text-sm text-red-500">
            {form.formState.errors.content?.message}
          </div>
          <Button 
            type="submit" 
            disabled={mutation.isPending || !form.watch("content")?.trim()}
            className="rounded-full px-5 font-bold"
            size="sm"
          >
            Reply
          </Button>
        </div>
      </form>
    </div>
  );
}
