"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, Loader2, Plus, Send, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getFriend, getInitials } from "@/lib/friends"
import { uploadPostImage } from "@/lib/storage"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 5 * 1024 * 1024

type CreatePostProps = {
  currentUser: string
  onPost: (content: string, author: string, imageUrl?: string) => Promise<void>
}

export default function CreatePost({ currentUser, onPost }: CreatePostProps) {
  const [open, setOpen] = useState(false)
  const [author, setAuthor] = useState(currentUser)
  const [content, setContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const finalAuthor = author.trim() || currentUser
  const friend = getFriend(finalAuthor)
  const canPost = content.trim().length > 0 && !uploading

  useEffect(() => {
    if (!open) return
    const textarea = document.getElementById("create-post-textarea")
    textarea?.focus()
  }, [open])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 5MB or smaller.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    clearImage()
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handlePost = async () => {
    if (!canPost) return
    setUploading(true)
    setError(null)
    try {
      let imageUrl: string | undefined
      if (selectedFile) {
        imageUrl = await uploadPostImage(selectedFile)
      }
      await onPost(content.trim(), finalAuthor, imageUrl)
      setContent("")
      clearImage()
      setOpen(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your post. Please try again."
      )
    } finally {
      setUploading(false)
    }
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
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Attach photo"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-1.5 rounded-full text-muted-foreground transition-transform active:scale-95"
                >
                  <ImagePlus className="size-4" />
                  Attach Photo
                </Button>
                {selectedFile ? (
                  <span className="min-w-0 truncate text-xs text-muted-foreground">
                    {selectedFile.name}
                  </span>
                ) : null}
              </div>
              {previewUrl ? (
                <div className="relative overflow-hidden rounded-[12px] border border-white/10 bg-background">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={uploading}
                    aria-label="Remove image"
                    className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : null}
              {error ? (
                <p className="text-xs text-destructive">{error}</p>
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
                disabled={uploading}
                className="rounded-full px-4 font-medium text-muted-foreground transition-transform active:scale-95"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={!canPost}
                className="gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 px-5 text-white shadow-sm transition-all hover:from-purple-500 hover:via-fuchsia-400 hover:to-cyan-400 active:scale-95"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Post
                  </>
                )}
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
