"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MessageCircle } from "lucide-react"

import CreatePost from "@/components/create-post"
import Header from "@/components/header"
import PostCard from "@/components/post-card"
import { FRIENDS } from "@/lib/friends"
import {
  deleteRemotePost,
  fetchRemotePosts,
  loadCurrentUser,
  loadExtraUsers,
  loadLocalPosts,
  saveCurrentUser,
  saveExtraUsers,
  saveLocalPosts,
  upsertRemotePost,
} from "@/lib/storage"
import type { Post } from "@/lib/types"

export default function Feed() {
  const [currentUser, setCurrentUser] = useState<string>(() => loadCurrentUser())
  const [posts, setPosts] = useState<Post[]>(() => loadLocalPosts())
  const [extraUsers, setExtraUsers] = useState<string[]>(() => loadExtraUsers())

  useEffect(() => {
    fetchRemotePosts()
      .then((remote) => {
        setPosts((prev) => {
          const remoteIds = new Set(remote.map((post) => post.id))
          const localOnly = prev.filter((post) => !remoteIds.has(post.id))
          for (const post of localOnly) {
            upsertRemotePost(post).catch(() => {})
          }
          const merged = [...remote, ...localOnly]
          merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          saveLocalPosts(merged)
          return merged
        })
      })
      .catch((error) => {
        console.error("Supabase sync unavailable:", error)
      })
  }, [])

  const handleCreatePost = useCallback(
    (content: string, author: string, imageUrl?: string) => {
      const post: Post = {
        id: crypto.randomUUID(),
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        likedBy: [],
        comments: 0,
        replies: [],
        imageUrl,
      }
      setPosts((prev) => {
        const next = [post, ...prev]
        saveLocalPosts(next)
        return next
      })
      upsertRemotePost(post).catch((error) =>
        console.error("Supabase write failed:", error)
      )
      if (!FRIENDS.some((friend) => friend.name === author)) {
        setExtraUsers((prev) => {
          if (prev.includes(author)) return prev
          const next = [...prev, author]
          saveExtraUsers(next)
          return next
        })
      }
      if (author !== currentUser) {
        setCurrentUser(author)
        saveCurrentUser(author)
      }
    },
    [currentUser]
  )

  const handleUpdatePost = useCallback(
    (id: string, content: string, imageUrl?: string) => {
      const next = posts.map((post) =>
        post.id === id
          ? { ...post, content, imageUrl: imageUrl || undefined }
          : post
      )
      const updated = next.find((post) => post.id === id)
      setPosts(next)
      saveLocalPosts(next)
      if (updated) {
        upsertRemotePost(updated).catch((error) =>
          console.error("Supabase write failed:", error)
        )
      }
    },
    [posts]
  )

  const handleLike = useCallback(
    (id: string) => {
      const next = posts.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
      const updated = next.find((post) => post.id === id)
      setPosts(next)
      saveLocalPosts(next)
      if (updated) {
        upsertRemotePost(updated).catch((error) =>
          console.error("Supabase write failed:", error)
        )
      }
    },
    [posts]
  )

  const handleDislike = useCallback(
    (id: string) => {
      const next = posts.map((post) =>
        post.id === id ? { ...post, dislikes: post.dislikes + 1 } : post
      )
      const updated = next.find((post) => post.id === id)
      setPosts(next)
      saveLocalPosts(next)
      if (updated) {
        upsertRemotePost(updated).catch((error) =>
          console.error("Supabase write failed:", error)
        )
      }
    },
    [posts]
  )

  const handleReply = useCallback(
    (id: string, content: string) => {
      const next = posts.map((post) =>
        post.id === id
          ? {
              ...post,
              replies: [
                ...post.replies,
                {
                  id: crypto.randomUUID(),
                  author: currentUser,
                  content,
                  createdAt: new Date().toISOString(),
                },
              ],
              comments: post.comments + 1,
            }
          : post
      )
      const updated = next.find((post) => post.id === id)
      setPosts(next)
      saveLocalPosts(next)
      if (updated) {
        upsertRemotePost(updated).catch((error) =>
          console.error("Supabase write failed:", error)
        )
      }
    },
    [currentUser, posts]
  )

  const handleDeletePost = useCallback(
    (id: string) => {
      const next = posts.filter((post) => post.id !== id)
      setPosts(next)
      saveLocalPosts(next)
      deleteRemotePost(id).catch((error) =>
        console.error("Supabase delete failed:", error)
      )
    },
    [posts]
  )

  const handleSwitchUser = useCallback((name: string) => {
    setCurrentUser(name)
    saveCurrentUser(name)
  }, [])

  const users = useMemo(
    () => [...FRIENDS.map((friend) => friend.name), ...extraUsers],
    [extraUsers]
  )

  return (
    <div className="min-h-dvh bg-muted/60">
      <Header currentUser={currentUser} users={users} onSwitchUser={handleSwitchUser} />
      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
        <CreatePost currentUser={currentUser} onPost={handleCreatePost} />

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <MessageCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No posts yet. Share the first update!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={post.author === currentUser}
                onLike={() => handleLike(post.id)}
                onDislike={() => handleDislike(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                onUpdate={(content, imageUrl) =>
                  handleUpdatePost(post.id, content, imageUrl)
                }
                onReply={(content) => handleReply(post.id, content)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
