"use client";

import { useRef } from "react";
import { PostWithRelations, usePostStore } from "@/store/usePostStore";
import { PostCard } from "./PostCard";
import { CreatePost } from "./CreatePost";

export function Feed({ initialPosts }: { initialPosts: PostWithRelations[] }) {
  const initialized = useRef(false);
  const setPosts = usePostStore(state => state.setPosts);
  const posts = usePostStore(state => state.posts);

  // Initialize Zustand store on the first render
  if (!initialized.current) {
    setPosts(initialPosts);
    initialized.current = true;
  }

  return (
    <div className="flex flex-col pb-20">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
