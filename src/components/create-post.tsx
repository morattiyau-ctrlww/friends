"use client"

import { useState } from "react"
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

export default function CreatePost({ currentUser, onPost }: CreatePostProps) {
  const [author, setAuthor] = useState(currentUser)
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const finalAuthor = author.trim() || currentUser
  const friend = getFriend(finalAuthor)
  const canPost = content.trim().length > 0

  const handlePost = () => {
    if (!canPost) return
    onPost(content.trim(), finalAuthor, imageUrl.trim() || undefined)
    setContent("")
    setImageUrl("")
  }

  return (
    <Card className="p-4">
      <div className="flex gap-3">
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
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">
          Posting as {finalAuthor}
        </span>
        <Button
          onClick={handlePost}
          disabled={!canPost}
          className="gap-1.5 rounded-full px-5"
        >
          <Send className="size-4" />
          Post
        </Button>
      </div>
    </Card>
  )
}
