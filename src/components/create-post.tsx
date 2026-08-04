"use client"

import { useMemo, useState } from "react"
import { Send } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getFriend, getInitials } from "@/lib/friends"

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

  const handlePost = () => {
    if (!canPost) return
    onPost(content.trim(), finalAuthor, imageUrlTrimmed || undefined)
    setContent("")
    setImageUrl("")
  }

  return (
    <Card className="group gap-0 p-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow hover:ring-indigo-500/25">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-80" />
      <div className="flex gap-3 p-4">
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
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="h-40 w-full object-cover"
              />
            </div>
          ) : null}
          <Textarea
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
        <Button
          onClick={handlePost}
          disabled={!canPost}
          className="shrink-0 gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 text-white shadow-sm transition-all hover:from-indigo-700 hover:to-fuchsia-700 active:scale-95"
        >
          <Send className="size-4" />
          Post
        </Button>
      </div>
    </Card>
  )
}
