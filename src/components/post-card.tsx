"use client"

import { useState } from "react"
import { Heart, MessageCircle, Pencil, ThumbsDown, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatRelativeTime } from "@/lib/format-time"
import { getFriend, getInitials } from "@/lib/friends"
import type { Post } from "@/lib/types"

type PostCardProps = {
  post: Post
  isOwn: boolean
  onLike: () => void
  onDislike: () => void
  onDelete: () => void
  onUpdate: (content: string) => void
}

export default function PostCard({
  post,
  isOwn,
  onLike,
  onDislike,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const friend = getFriend(post.author)
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState(post.content)

  const openEdit = () => {
    setDraft(post.content)
    setEditOpen(true)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onUpdate(trimmed)
    setEditOpen(false)
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="mt-0.5">
          <AvatarFallback className={`${friend.avatarColor} text-white`}>
            {getInitials(post.author)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold">{post.author}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 border-t pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className="gap-1.5 rounded-full"
          aria-label="Like post"
        >
          <Heart className="size-4" />
          <span className="text-xs font-medium tabular-nums">{post.likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDislike}
          className="gap-1.5 rounded-full"
          aria-label="Dislike post"
        >
          <ThumbsDown className="size-4" />
          <span className="text-xs font-medium tabular-nums">{post.dislikes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full"
          aria-label="Comment on post"
        >
          <MessageCircle className="size-4" />
          <span className="text-xs font-medium tabular-nums">
            {post.comments}
          </span>
        </Button>

        {isOwn && (
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={openEdit}
              className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              className="rounded-full text-muted-foreground hover:text-destructive"
              aria-label="Delete post"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              Update the text of your post.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-28 resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!draft.trim()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
