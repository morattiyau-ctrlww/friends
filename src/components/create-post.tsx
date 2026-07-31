"use client"

import { useState } from "react"
import { Send } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getFriend, getInitials } from "@/lib/friends"

type CreatePostProps = {
  currentUser: string
  onPost: (content: string) => void
}

export default function CreatePost({ currentUser, onPost }: CreatePostProps) {
  const [content, setContent] = useState("")
  const friend = getFriend(currentUser)
  const canPost = content.trim().length > 0

  const handlePost = () => {
    if (!canPost) return
    onPost(content.trim())
    setContent("")
  }

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar className="mt-0.5">
          <AvatarFallback
            className={`${friend.avatarColor} text-white`}
          >
            {getInitials(currentUser)}
          </AvatarFallback>
        </Avatar>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="min-h-20 flex-1 resize-none"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              handlePost()
            }
          }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">
          Posting as {currentUser}
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
