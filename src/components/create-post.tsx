"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Send } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getFriend, getInitials } from "@/lib/friends"
import { cn } from "@/lib/utils"

type CreatePostProps = {
  currentUser: string
  onPost: (content: string, author: string, imageUrl?: string) => void
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export default function CreatePost({ currentUser, onPost }: CreatePostProps) {
  const [open, setOpen] = useState(false)
  const [author, setAuthor] = useState(currentUser)
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const finalAuthor = author.trim() || currentUser
  const friend = getFriend(finalAuthor)
  const imageUrlTrimmed = imageUrl.trim()
  const imageUrlValid = imageUrlTrimmed === "" || isValidUrl(imageUrlTrimmed)
  const canPost = content.trim().length > 0 && imageUrlValid
  const imagePreviewUrl = useMemo(
    () => (imageUrlValid && imageUrlTrimmed ? imageUrlTrimmed : undefined),
    [imageUrlTrimmed, imageUrlValid]
  )

  useEffect(() => {
    if (!open) return
    const textarea = document.getElementById("create-post-textarea")
    textarea?.focus()
  }, [open])

  const handlePost = () => {
    if (!canPost) return
    onPost(content.trim(), finalAuthor, imageUrlTrimmed || undefined)
    setContent("")
    setImageUrl("")
    setOpen(false)
  }

  return (
    <Card className="group gap-0 p-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400/40 hover:shadow-glow">
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 opacity-90" />

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex gap-3 p-4 pb-0">
            <Avatar className="mt-1">
              <AvatarFallback className={`${friend.avatarColor} text-white`}>
                {getInitials(finalAuthor)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                className="h-8 max-w-[220px]"
                aria-label="Author name"
              />
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Photo URL (optional)"
                className="h-8"
                aria-label="Photo URL"
              />
              {!imageUrlValid && (
                <p className="text-xs text-destructive">
                  Enter a valid URL or leave this field blank.
                </p>
              )}
              {imagePreviewUrl ? (
                <div className="overflow-hidden rounded-[12px] border border-white/10 bg-background">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : null}
              <Textarea
                id="create-post-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="min-h-20 resize-none"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    handlePost()
                  }
                }}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t px-4 py-3">
            <span className="truncate text-xs text-muted-foreground">
              Posting as {finalAuthor}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 font-medium text-muted-foreground transition-transform active:scale-95"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={!canPost}
                className="gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 px-5 text-white shadow-sm transition-all hover:from-purple-500 hover:via-fuchsia-400 hover:to-cyan-400 active:scale-95"
              >
                <Send className="size-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-haspopup="dialog"
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40"
        >
          <Avatar>
            <AvatarFallback
              className={`${friend.avatarColor} text-sm font-semibold text-white shadow-sm`}
            >
              {getInitials(finalAuthor)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            What’s on your mind, {finalAuthor}?
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all group-hover:from-purple-500 group-hover:via-fuchsia-400 group-hover:to-cyan-400 active:scale-95">
            <Plus className="size-4" />
            New Post
          </span>
        </button>
      )}
    </Card>
  )
}
