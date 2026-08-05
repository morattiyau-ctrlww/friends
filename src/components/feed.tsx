"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { MessageCircle, X } from "lucide-react"

import CreatePost from "@/components/create-post"
import BackgroundCanvas from "@/components/background-canvas"
import Header from "@/components/header"
import PostCard from "@/components/post-card"
import PostCardSkeleton from "@/components/post-card-skeleton"
import { FRIENDS } from "@/lib/friends"
import {
  deleteRemotePost,
  fetchRemotePosts,
  insertRemotePost,
  loadCurrentUser,
  loadExtraUsers,
  saveCurrentUser,
  saveExtraUsers,
  upsertRemotePost,
} from "@/lib/storage"
import type { Post } from "@/lib/types"

export default function Feed() {
  const [currentUser, setCurrentUser] = useState<string>(() => loadCurrentUser())
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [extraUsers, setExtraUsers] = useState<string[]>(() => loadExtraUsers())

  useEffect(() => {
    let cancelled = false
    fetchRemotePosts()
      .then((remote) => {
        if (cancelled) return
        setPosts(remote)
      })
      .catch((error) => {
        console.error("Supabase sync unavailable:", error)
        if (!cancelled) {
          setSyncError("Couldn't load posts from the database. Check your connection and refresh.")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const reportSyncError = useCallback((error: unknown) => {
    console.error("Supabase write failed:", error)
    setSyncError(
      error instanceof Error
        ? error.message
        : "Something went wrong while syncing with the database."
    )
  }, [])

  const handleCreatePost = useCallback(
    async (content: string, author: string, imageUrl?: string) => {
      const post: Post = {
        id: crypto.randomUUID(),
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        comments: 0,
        replies: [],
        imageUrl,
      }
      const created = await insertRemotePost(post)
      setPosts((prev) => [created, ...prev])
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
    async (id: string, content: string, imageUrl?: string) => {
      const current = posts.find((post) => post.id === id)
      if (!current) return
      const updated: Post = { ...current, content, imageUrl: imageUrl || undefined }
      try {
        await upsertRemotePost(updated)
        setPosts((prev) => prev.map((post) => (post.id === id ? updated : post)))
      } catch (error) {
        reportSyncError(error)
      }
    },
    [posts, reportSyncError]
  )

  const handleLike = useCallback(
    async (id: string) => {
      const current = posts.find((post) => post.id === id)
      if (!current) return
      const liked = current.likedBy.includes(currentUser)
      const disliked = current.dislikedBy.includes(currentUser)
      let likedBy = current.likedBy
      let dislikedBy = current.dislikedBy
      let likes = current.likes
      let dislikes = current.dislikes
      if (liked) {
        likedBy = likedBy.filter((user) => user !== currentUser)
        likes = Math.max(0, likes - 1)
      } else {
        if (disliked) {
          dislikedBy = dislikedBy.filter((user) => user !== currentUser)
          dislikes = Math.max(0, dislikes - 1)
        }
        likedBy = [...likedBy, currentUser]
        likes = likes + 1
      }
      const updated: Post = { ...current, likedBy, dislikedBy, likes, dislikes }
      try {
        await upsertRemotePost(updated)
        setPosts((prev) => prev.map((post) => (post.id === id ? updated : post)))
      } catch (error) {
        reportSyncError(error)
      }
    },
    [posts, currentUser, reportSyncError]
  )

  const handleDislike = useCallback(
    async (id: string) => {
      const current = posts.find((post) => post.id === id)
      if (!current) return
      const liked = current.likedBy.includes(currentUser)
      const disliked = current.dislikedBy.includes(currentUser)
      let likedBy = current.likedBy
      let dislikedBy = current.dislikedBy
      let likes = current.likes
      let dislikes = current.dislikes
      if (disliked) {
        dislikedBy = dislikedBy.filter((user) => user !== currentUser)
        dislikes = Math.max(0, dislikes - 1)
      } else {
        if (liked) {
          likedBy = likedBy.filter((user) => user !== currentUser)
          likes = Math.max(0, likes - 1)
        }
        dislikedBy = [...dislikedBy, currentUser]
        dislikes = dislikes + 1
      }
      const updated: Post = { ...current, likedBy, dislikedBy, likes, dislikes }
      try {
        await upsertRemotePost(updated)
        setPosts((prev) => prev.map((post) => (post.id === id ? updated : post)))
      } catch (error) {
        reportSyncError(error)
      }
    },
    [posts, currentUser, reportSyncError]
  )

  const handleReply = useCallback(
    async (id: string, content: string, author: string) => {
      const current = posts.find((post) => post.id === id)
      if (!current) return
      const updated: Post = {
        ...current,
        replies: [
          ...current.replies,
          {
            id: crypto.randomUUID(),
            author,
            content,
            createdAt: new Date().toISOString(),
          },
        ],
        comments: current.comments + 1,
      }
      try {
        await upsertRemotePost(updated)
        setPosts((prev) => prev.map((post) => (post.id === id ? updated : post)))
      } catch (error) {
        reportSyncError(error)
      }
      if (!FRIENDS.some((friend) => friend.name === author)) {
        setExtraUsers((prev) => {
          if (prev.includes(author)) return prev
          const next = [...prev, author]
          saveExtraUsers(next)
          return next
        })
      }
    },
    [posts, reportSyncError]
  )

  const handleDeletePost = useCallback(
    async (id: string) => {
      try {
        await deleteRemotePost(id)
        setPosts((prev) => prev.filter((post) => post.id !== id))
      } catch (error) {
        reportSyncError(error)
      }
    },
    [reportSyncError]
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
    <div className="relative z-0 min-h-dvh overflow-x-hidden bg-aurora">
      <BackgroundCanvas />
      <Header currentUser={currentUser} users={users} onSwitchUser={handleSwitchUser} />
      <main className="relative mx-auto w-full max-w-2xl space-y-4 px-4 py-6 pb-16">
        {syncError ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-up">
            <p className="min-w-0">
              Couldn&apos;t sync with the database: {syncError}
            </p>
            <button
              type="button"
              onClick={() => setSyncError(null)}
              aria-label="Dismiss error"
              className="flex shrink-0 items-center justify-center rounded-full p-1 transition-colors hover:bg-destructive/15"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        <CreatePost currentUser={currentUser} onPost={handleCreatePost} />

        {loading ? (
          <div className="space-y-4" role="status" aria-label="Loading posts">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}
              >
                <PostCardSkeleton />
              </div>
            ))}
            <span className="sr-only">Loading posts…</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center animate-fade-up">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-400 ring-1 ring-inset ring-purple-400/30">
              <MessageCircle className="size-6" />
            </div>
            <p className="text-sm font-semibold">No posts yet.</p>
            <p className="text-sm text-muted-foreground">
              Share the first update with your friends!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}
              >
                <PostCard
                  post={post}
                  isOwn={post.author === currentUser}
                  currentUser={currentUser}
                  onLike={() => handleLike(post.id)}
                  onDislike={() => handleDislike(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                  onUpdate={(content, imageUrl) =>
                    handleUpdatePost(post.id, content, imageUrl)
                  }
                  onReply={(content, author) =>
                    handleReply(post.id, content, author)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
