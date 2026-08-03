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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatRelativeTime } from "@/lib/format-time"
import { getFriend, getInitials } from "@/lib/friends"
import type { Post } from "@/lib/types"

type PostCardProps = {
  post: Post
  isOwn: boolean
  currentUser: string
  onLike: () => void
  onDislike: () => void
  onReply: (content: string, author: string) => void
  onDelete: () => void
  onUpdate: (content: string, imageUrl?: string) => void
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export default function PostCard({
  post,
  isOwn,
  currentUser,
  onLike,
  onDislike,
  onReply,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const friend = getFriend(post.author)
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState(post.content)
  const [imageUrlDraft, setImageUrlDraft] = useState(post.imageUrl ?? "")
  const [replyDraft, setReplyDraft] = useState("")
  const [replyAuthor, setReplyAuthor] = useState(currentUser)

  const imageUrlTrimmed = imageUrlDraft.trim()
  const imageUrlValid = imageUrlTrimmed === "" || isValidUrl(imageUrlTrimmed)

  const openEdit = () => {
    setDraft(post.content)
    setImageUrlDraft(post.imageUrl ?? "")
    setEditOpen(true)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (!trimmed || !imageUrlValid) return
    onUpdate(trimmed, imageUrlTrimmed || undefined)
    setEditOpen(false)
  }

  const handleReply = () => {
    const trimmed = replyDraft.trim()
    if (!trimmed) return
    onReply(trimmed, replyAuthor.trim() || currentUser)
    setReplyDraft("")
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
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="Posted image"
              className="mt-3 w-full rounded-xl border border-border object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none"
              }}
            />
          ) : null}
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
          className="gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10"
          aria-label="Dislike post"
          title="Dislike post"
        >
          <ThumbsDown className="size-4" />
          <span className="text-xs font-medium tabular-nums">Dislike {post.dislikes}</span>
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

      <div className="mt-4 space-y-3 rounded-xl bg-muted/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">Replies</span>
          <span className="text-xs text-muted-foreground">
            {post.replies.length}
          </span>
        </div>

        {post.replies.length > 0 ? (
          <div className="space-y-3">
            {post.replies.map((reply) => (
              <div key={reply.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{reply.author}</span>
                  <span>{formatRelativeTime(reply.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No replies yet.</p>
        )}

        <div className="space-y-2">
          <Input
            value={replyAuthor}
            onChange={(e) => setReplyAuthor(e.target.value)}
            placeholder="Reply as…"
            className="h-8"
            aria-label="Reply author name"
          />
          <Textarea
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            placeholder="Write a reply…"
            className="min-h-20 resize-none"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                handleReply()
              }
            }}
          />
          <Button
            onClick={handleReply}
            disabled={!replyDraft.trim()}
            className="gap-1.5 rounded-full px-5"
          >
            Reply
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              Update the text and image of your post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={imageUrlDraft}
              onChange={(e) => setImageUrlDraft(e.target.value)}
              placeholder="Image URL (optional)"
              type="url"
              aria-label="Image URL"
            />
            {!imageUrlValid && (
              <p className="text-xs text-destructive">
                Enter a valid URL or leave this field blank.
              </p>
            )}
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-28 resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!draft.trim() || !imageUrlValid}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
