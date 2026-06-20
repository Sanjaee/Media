"use server";

import { db } from "@/db";
import { posts, media, users, likes, comments } from "@/db/schema";
import { eq, desc, sql, and, or } from "drizzle-orm";
import { auth } from "@/auth";
import { createPostSchema, CreatePostInput } from "@/lib/validations/post";
import cloudinary from "@/lib/cloudinary";

export async function getFeedPosts() {
  const session = await auth();
  const userId = session?.user?.id;

  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      media: true,
      ...(userId ? { likes: { where: (likes, { eq }) => eq(likes.userId, userId) } } : {}),
    },
    limit: 50,
  });

  // Format to match Zustand store type
  return allPosts.map(post => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      image: post.author.image,
      isVerified: post.author.isVerified,
      role: post.author.role,
    },
    media: post.media.map(m => ({
      id: m.id,
      type: m.type,
      url: m.url,
      publicId: m.publicId,
    })),
    stats: {
      replies: post.commentCount || 0,
      reposts: post.repostCount || 0,
      likes: post.likeCount || 0,
      views: 0, // Placeholder
    },
    hasLiked: post.likes ? post.likes.length > 0 : false,
  }));
}

export async function getInfiniteFeedPostsAction({
  cursor,
  limit = 10,
}: {
  cursor?: { createdAt: Date; id: string } | null;
  limit?: number;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const whereClause = cursor
    ? or(
        sql`${posts.createdAt} < ${cursor.createdAt}`,
        and(
          eq(posts.createdAt, cursor.createdAt),
          sql`${posts.id} < ${cursor.id}`
        )
      )
    : undefined;

  const allPosts = await db.query.posts.findMany({
    where: whereClause,
    orderBy: [desc(posts.createdAt), desc(posts.id)],
    with: {
      author: true,
      media: true,
      ...(userId ? { likes: { where: (likes, { eq }) => eq(likes.userId, userId) } } : {}),
    },
    limit: limit + 1, // Fetch one extra to check if there is a next page
  });

  let nextCursor: typeof cursor = null;
  if (allPosts.length > limit) {
    const nextItem = allPosts.pop(); // Remove the extra item
    if (nextItem) {
      nextCursor = {
        createdAt: nextItem.createdAt!,
        id: nextItem.id,
      };
    }
  }

  const formattedPosts = allPosts.map(post => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      image: post.author.image,
      isVerified: post.author.isVerified,
      role: post.author.role,
    },
    media: post.media.map(m => ({
      id: m.id,
      type: m.type,
      url: m.url,
      publicId: m.publicId,
    })),
    stats: {
      replies: post.commentCount || 0,
      reposts: post.repostCount || 0,
      likes: post.likeCount || 0,
      views: 0,
    },
    hasLiked: post.likes ? post.likes.length > 0 : false,
  }));

  return {
    posts: formattedPosts,
    nextCursor,
  };
}

export async function createPostAction(input: CreatePostInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = createPostSchema.parse(input);

  const postId = crypto.randomUUID();

  // Handle server-side Cloudinary uploads for base64 media
  const uploadedMedia = [];
  if (parsed.mediaBase64 && parsed.mediaBase64.length > 0) {
    for (const [index, base64Str] of parsed.mediaBase64.entries()) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(base64Str, {
          folder: "media_app_posts",
        });
        
        uploadedMedia.push({
          id: crypto.randomUUID(),
          postId: postId,
          type: uploadResponse.resource_type === "video" ? "video" : "image",
          url: uploadResponse.secure_url,
          publicId: uploadResponse.public_id,
          width: uploadResponse.width,
          height: uploadResponse.height,
          bytes: uploadResponse.bytes,
          format: uploadResponse.format,
          sortOrder: index,
        });
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image to Cloudinary");
      }
    }
  }

  await db.insert(posts).values({
    id: postId,
    authorId: session.user.id as string,
    content: parsed.content || "",
  });

  // Insert uploaded media or directly passed media
  const mediaToInsert = [
    ...uploadedMedia,
    ...(parsed.media?.map((m, index) => ({ ...m, postId, sortOrder: uploadedMedia.length + index })) || [])
  ];

  if (mediaToInsert.length > 0) {
    await db.insert(media).values(mediaToInsert);
  }

  // Fetch the created post with relations
  const newPost = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: { author: true, media: true },
  });

  if (!newPost) throw new Error("Failed to create post");

  return {
    id: newPost.id,
    content: newPost.content,
    createdAt: newPost.createdAt,
    author: {
      id: newPost.author.id,
      name: newPost.author.name,
      username: newPost.author.username,
      image: newPost.author.image,
      isVerified: newPost.author.isVerified,
      role: newPost.author.role,
    },
    media: newPost.media.map(m => ({
      id: m.id,
      type: m.type,
      url: m.url,
      publicId: m.publicId,
    })),
    stats: { replies: 0, reposts: 0, likes: 0, views: 0 }
  };
}

export async function deletePostAction(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: { media: true }
  });

  if (!post) throw new Error("Post not found");
  if (post.authorId !== session.user.id) throw new Error("Forbidden");

  // Delete from Cloudinary
  if (post.media && post.media.length > 0) {
    for (const m of post.media) {
      if (m.publicId) {
        try {
          await cloudinary.uploader.destroy(m.publicId);
        } catch (e) {
          console.error("Failed to delete from Cloudinary:", e);
        }
      }
    }
  }

  await db.delete(media).where(eq(media.postId, postId));
  await db.delete(likes).where(eq(likes.postId, postId));
  await db.delete(comments).where(eq(comments.postId, postId));
  await db.delete(posts).where(eq(posts.id, postId));

  return { success: true };
}

export async function getPostById(postId: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: { author: true, media: true },
  });

  if (!post) return null;

  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      image: post.author.image,
      isVerified: post.author.isVerified,
      role: post.author.role,
    },
    media: post.media.map(m => ({
      id: m.id,
      type: m.type,
      url: m.url,
      publicId: m.publicId,
    })),
    stats: { replies: post.commentCount || 0, reposts: post.repostCount || 0, likes: post.likeCount || 0, views: 0 },
    hasLiked: false, // Since this is mostly used for the created post itself or by id, hasLiked logic can be added later if needed
  };
}

export async function toggleLikeAction(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;
  
  const existingLike = await db.query.likes.findFirst({
    where: and(eq(likes.postId, postId), eq(likes.userId, userId))
  });

  if (existingLike) {
    await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    await db.update(posts).set({ likeCount: sql`like_count - 1` }).where(eq(posts.id, postId));
    return { liked: false };
  } else {
    await db.insert(likes).values({ id: crypto.randomUUID(), postId, userId });
    await db.update(posts).set({ likeCount: sql`like_count + 1` }).where(eq(posts.id, postId));
    return { liked: true };
  }
}

import Fuse from "fuse.js";

export async function searchPostsAction(query: string, limit: number = 5) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!query || query.trim().length === 0) return [];

  // Fetch recent posts to search against. In a real large app, you'd use pg_trgm or similar,
  // but for a lightweight library-based approach, we fetch a reasonable subset and fuzzy search.
  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      media: true,
      ...(userId ? { likes: { where: (likes, { eq }) => eq(likes.userId, userId) } } : {}),
    },
    limit: 500, // Reasonable limit for in-memory fuzzy search
  });

  const fuse = new Fuse(allPosts, {
    keys: ["content", "author.name", "author.username"],
    threshold: 0.4,
    includeScore: true,
  });

  const results = fuse.search(query);

  return results.slice(0, limit).map(result => ({
    id: result.item.id,
    content: result.item.content,
    createdAt: result.item.createdAt,
    author: {
      id: result.item.author.id,
      name: result.item.author.name,
      username: result.item.author.username,
      image: result.item.author.image,
      isVerified: result.item.author.isVerified,
      role: result.item.author.role,
    },
    media: result.item.media.map(m => ({
      id: m.id,
      type: m.type,
      url: m.url,
      publicId: m.publicId,
    })),
    stats: {
      replies: result.item.commentCount || 0,
      reposts: result.item.repostCount || 0,
      likes: result.item.likeCount || 0,
      views: 0,
    },
    hasLiked: result.item.likes ? result.item.likes.length > 0 : false,
  }));
}
