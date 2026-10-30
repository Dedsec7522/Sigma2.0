"use client";

import { useSearchParams } from "next/navigation";
import { Pagination, PostGrid, pageFrom, type PostSummary } from "./BlogList";

/**
 * Static-preview pagination: a static host can't render ?page=N on the server,
 * so the page number is read in the browser. The server build paginates on the server.
 */
export function ClientPagedPosts({ posts, pageSize, basePath, label }: { posts: PostSummary[]; pageSize: number; basePath: string; label: string }) {
  const pages = Math.ceil(posts.length / pageSize);
  const page = pageFrom(useSearchParams().get("page") ?? undefined, pages);
  return (
    <>
      <PostGrid posts={posts.slice((page - 1) * pageSize, page * pageSize)} />
      <Pagination page={page} pages={pages} basePath={basePath} label={label} />
    </>
  );
}
