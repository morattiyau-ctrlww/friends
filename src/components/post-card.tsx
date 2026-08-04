"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Pencil,
  ThumbsDown,
  Trash2,
} from "lucide-react"

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
import { cn } from "@/lib/utils"
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
  const [repliesOpen, setRepliesOpen] = useState(false)
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

  const toggleReplies = () => setRepliesOpen((value) => !value)

  const replyCount = post.replies.length
  const replyToggleLabel = repliesOpen
    ? replyCount > 0
      ? "Hide replies"
      : "Hide"
    : replyCount > 0
      ? `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
      : "Show comments"

  return (
    <Card className="group gap-0 p-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400/40 hover:shadow-glow">
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 opacity-90" />

      <div className="flex items-start gap-3 p-4 pb-2">
        <Avatar className="size-11 ring-2 ring-background dark:ring-white/10">
          <AvatarFallback
            className={cn(
              friend.avatarColor,
              "text-sm font-semibold text-white shadow-sm"
            )}
          >
            {getInitials(post.author)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold tracking-tight">
              {post.author}
            </span>
            <span className="rounded-full bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-300 ring-1 ring-inset ring-purple-400/30">
              {friend.tagline}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
      </div>

      <div className="px-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {post.content}
        </p>
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt="Posted image"
            className="mt-3 max-h-96 w-full rounded-[12px] border border-white/10 object-cover shadow-sm"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1 px-4 py-2.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className="gap-1.5 rounded-full transition-transform active:scale-90"
          aria-label="Like post"
        >
          <Heart className="size-4" />
          <span className="text-xs font-medium tabular-nums">{post.likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDislike}
          className="gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 text-destructive transition-transform hover:bg-destructive/10 active:scale-90"
          aria-label="Dislike post"
          title="Dislike post"
        >
          <ThumbsDown className="size-4" />
          <span className="text-xs font-medium tabular-nums">
            Dislike {post.dislikes}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full transition-transform active:scale-90"
          aria-label="Comment on post"
        >
          <MessageCircle className="size-4" />
          <span className="text-xs font-medium tabular-nums">{post.comments}</span>
        </Button>

        {isOwn && (
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={openEdit}
              className="gap-1.5 rounded-full text-muted-foreground transition-transform hover:text-foreground active:scale-90"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              className="rounded-full text-muted-foreground transition-transform hover:text-destructive active:scale-90"
              aria-label="Delete post"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          Comments
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
            {post.comments}
          </span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleReplies}
          aria-expanded={repliesOpen}
          aria-controls={`replies-${post.id}`}
          className="gap-1.5 rounded-full font-medium text-muted-foreground transition-all hover:text-foreground active:scale-95"
        >
          {replyToggleLabel}
          {repliesOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </div>

      <div
        id={`replies-${post.id}`}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          repliesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-3 p-4">
            {replyCount > 0 ? (
              <div className="space-y-3">
                {post.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {reply.author}
                      </span>
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
                className="gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 px-5 text-white shadow-sm transition-all hover:from-purple-500 hover:via-fuchsia-400 hover:to-cyan-400 active:scale-95"
              >
                Reply
              </Button>
            </div>
          </div>
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
