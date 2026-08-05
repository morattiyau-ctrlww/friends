"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, MessageCircle } from "lucide-react"

import CreatePost from "@/components/create-post"
import BackgroundCanvas from "@/components/background-canvas"
import Header from "@/components/header"
import PostCard from "@/components/post-card"
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
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
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
      try {
        const created = await insertRemotePost(post)
        setPosts((prev) => [created, ...prev])
      } catch (error) {
        console.error("Supabase write failed:", error)
        return
      }
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
        console.error("Supabase write failed:", error)
      }
    },
    [posts]
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
        console.error("Supabase write failed:", error)
      }
    },
    [posts, currentUser]
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
        console.error("Supabase write failed:", error)
      }
    },
    [posts, currentUser]
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
        console.error("Supabase write failed:", error)
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
    [posts]
  )

  const handleDeletePost = useCallback(async (id: string) => {
    try {
      await deleteRemotePost(id)
      setPosts((prev) => prev.filter((post) => post.id !== id))
    } catch (error) {
      console.error("Supabase delete failed:", error)
    }
  }, [])

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
        <CreatePost currentUser={currentUser} onPost={handleCreatePost} />

        {loading ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center animate-fade-up">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading feed…</p>
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
