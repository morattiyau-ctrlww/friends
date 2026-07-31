"use client"

import { useCallback, useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"

import CreatePost from "@/components/create-post"
import Header from "@/components/header"
import PostCard from "@/components/post-card"
import {
  deleteRemotePost,
  fetchRemotePosts,
  loadCurrentUser,
  loadLocalPosts,
  saveCurrentUser,
  saveLocalPosts,
  upsertRemotePost,
} from "@/lib/storage"
import type { Post } from "@/lib/types"

function createSeedPosts(): Post[] {
  const now = Date.now()
  const hoursAgo = (hours: number) =>
    new Date(now - hours * 60 * 60 * 1000).toISOString()

  return [
    {
      id: crypto.randomUUID(),
      author: "Alex",
      content:
        "Just wrapped up a great run in the park. The weather this morning was perfect.",
      createdAt: hoursAgo(2),
      likes: 3,
      likedBy: ["Sam"],
      comments: 0,
    },
    {
      id: crypto.randomUUID(),
      author: "Taylor",
      content:
        "Adopted a kitten this weekend. Meet Miso - she is already running the place.",
      createdAt: hoursAgo(6),
      likes: 5,
      likedBy: ["Alex", "Sam"],
      comments: 1,
    },
    {
      id: crypto.randomUUID(),
      author: "Sam",
      content:
        "Anyone up for a hike on Saturday? Planning to hit the Ridge Trail early morning.",
      createdAt: hoursAgo(26),
      likes: 4,
      likedBy: ["Alex", "Taylor"],
      comments: 2,
    },
  ]
}

export default function Feed() {
  const [currentUser, setCurrentUser] = useState<string>(() => loadCurrentUser())
  const [posts, setPosts] = useState<Post[]>(() => {
    let local = loadLocalPosts()
    if (local.length === 0) {
      local = createSeedPosts()
      saveLocalPosts(local)
    }
    return local
  })

  useEffect(() => {
    fetchRemotePosts()
      .then((remote) => {
        setPosts((prev) => {
          const remoteIds = new Set(remote.map((post) => post.id))
          const merged = [
            ...remote,
            ...prev.filter((post) => !remoteIds.has(post.id)),
          ]
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
    (content: string) => {
      const post: Post = {
        id: crypto.randomUUID(),
        author: currentUser,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: 0,
      }
      setPosts((prev) => {
        const next = [post, ...prev]
        saveLocalPosts(next)
        return next
      })
      upsertRemotePost(post).catch((error) =>
        console.error("Supabase write failed:", error)
      )
    },
    [currentUser]
  )

  const handleUpdatePost = useCallback(
    (id: string, content: string) => {
      const next = posts.map((post) =>
        post.id === id ? { ...post, content } : post
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

  const handleToggleLike = useCallback(
    (id: string) => {
      const next = posts.map((post) => {
        if (post.id !== id) return post
        const liked = post.likedBy.includes(currentUser)
        return {
          ...post,
          likes: post.likes + (liked ? -1 : 1),
          likedBy: liked
            ? post.likedBy.filter((user) => user !== currentUser)
            : [...post.likedBy, currentUser],
        }
      })
      const updated = next.find((post) => post.id === id)
      setPosts(next)
      saveLocalPosts(next)
      if (updated) {
        upsertRemotePost(updated).catch((error) =>
          console.error("Supabase write failed:", error)
        )
      }
    },
    [posts, currentUser]
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

  return (
    <div className="min-h-dvh bg-muted/60">
      <Header currentUser={currentUser} onSwitchUser={handleSwitchUser} />
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
                isLiked={post.likedBy.includes(currentUser)}
                onLike={() => handleToggleLike(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                onUpdate={(content) => handleUpdatePost(post.id, content)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
