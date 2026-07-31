import { supabase } from "./supabase"
import type { Post } from "./types"

const POSTS_KEY = "friend-feed:posts:v2"
const CURRENT_USER_KEY = "friend-feed:current-user"
const EXTRA_USERS_KEY = "friend-feed:extra-users:v1"

type RemotePost = {
  id: string
  author: string
  content: string
  created_at: string
  likes: number | null
  disliked_by: number | null
  liked_by: string[] | null
  comments: number | null
}

export function loadLocalPosts(): Post[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(POSTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Post[]) : []
  } catch {
    return []
  }
}

export function saveLocalPosts(posts: Post[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export function loadCurrentUser(): string {
  if (typeof window === "undefined") return "Alex"
  return window.localStorage.getItem(CURRENT_USER_KEY) ?? "Alex"
}

export function saveCurrentUser(name: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CURRENT_USER_KEY, name)
}

export function loadExtraUsers(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(EXTRA_USERS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function saveExtraUsers(users: string[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(EXTRA_USERS_KEY, JSON.stringify(users))
}

export async function fetchRemotePosts(): Promise<Post[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from("posts").select("*")
  if (error) throw error
  return (data as RemotePost[] | null ?? []).map(mapRemoteToLocal)
}

export async function upsertRemotePost(post: Post): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from("posts").upsert(mapLocalToRemote(post))
  if (error) throw error
}

export async function deleteRemotePost(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from("posts").delete().eq("id", id)
  if (error) throw error
}

function mapRemoteToLocal(row: RemotePost): Post {
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
    likes: row.likes ?? 0,
    dislikes: row.disliked_by ?? 0,
    likedBy: row.liked_by ?? [],
    comments: row.comments ?? 0,
  }
}

function mapLocalToRemote(post: Post) {
  return {
    id: post.id,
    author: post.author,
    content: post.content,
    created_at: post.createdAt,
    likes: post.likes,
    disliked_by: post.dislikes,
    liked_by: post.likedBy,
    comments: post.comments,
  }
}
