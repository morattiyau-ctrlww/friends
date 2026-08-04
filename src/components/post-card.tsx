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
  const [expanded, setExpanded] = useState(false)
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

  const toggle = () => setExpanded((value) => !value)

  return (
    <Card className="group gap-0 p-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow hover:ring-indigo-500/25">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-80" />

      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={`post-body-${post.id}`}
        aria-label={`${expanded ? "Collapse" : "Expand"} post by ${post.author}`}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/40"
      >
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
            <span className="rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-400/20">
              {friend.tagline}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
            expanded
              ? "rotate-180 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
              : "border-border text-muted-foreground group-hover:border-indigo-500/30 group-hover:text-indigo-600"
          )}
        >
          <ChevronDown className="size-4" />
        </span>
      </button>

      {!expanded && (
        <div className="px-4 pb-3">
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.content}
          </p>
        </div>
      )}

      <div
        id={`post-body-${post.id}`}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {post.content}
            </p>
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Posted image"
                className="mt-3 max-h-96 w-full rounded-2xl border border-border object-cover shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none"
                }}
              />
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-1 border-t px-4 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className="gap-1.5 rounded-full transition-transform active:scale-90"
              aria-label="Like post"
            >
              <Heart className="size-4" />
              <span className="text-xs font-medium tabular-nums">
                {post.likes}
              </span>
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

          <div className="mx-4 mb-4 mt-1 space-y-3 rounded-2xl bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Replies</span>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums text-muted-foreground ring-1 ring-border">
                {post.replies.length}
              </span>
            </div>

            {post.replies.length > 0 ? (
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
                className="gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 text-white shadow-sm transition-all hover:from-indigo-700 hover:to-fuchsia-700 active:scale-95"
              >
                Reply
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
        {!expanded && (
          <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
            <Heart className="size-3.5" />
            {post.likes}
            <span className="text-border">·</span>
            <MessageCircle className="size-3.5" />
            {post.comments}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={`post-body-${post.id}`}
          className="ml-auto gap-1.5 rounded-full px-4 font-medium transition-all active:scale-95"
        >
          {expanded ? (
            <>
              Hide post
              <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              Show post
              <ChevronDown className="size-4" />
            </>
          )}
        </Button>
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
            <Button
              onClick={handleSave}
              disabled={!draft.trim() || !imageUrlValid}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
