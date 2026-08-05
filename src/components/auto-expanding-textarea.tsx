"use client"

import * as React from "react"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type AutoExpandingTextareaProps = React.ComponentProps<"textarea"> & {
  minRows?: number
  maxRows?: number
}

export default function AutoExpandingTextarea({
  minRows = 2,
  maxRows,
  className,
  onChange,
  onPaste,
  value,
  ...props
}: AutoExpandingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const style = window.getComputedStyle(textarea)
    const lineHeight = parseFloat(style.lineHeight) || 20
    const verticalPadding =
      (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
    const minHeight = lineHeight * minRows + verticalPadding
    const maxHeight = maxRows
      ? lineHeight * maxRows + verticalPadding
      : Number.POSITIVE_INFINITY

    textarea.style.height = "auto"
    const contentHeight = textarea.scrollHeight
    if (contentHeight >= maxHeight) {
      textarea.style.height = `${maxHeight}px`
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.height = `${Math.max(minHeight, contentHeight)}px`
      textarea.style.overflowY = "hidden"
    }
  }, [maxRows, minRows])

  useLayoutEffect(() => {
    resize()
  }, [resize, value])

  useEffect(() => {
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [resize])

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    resize()
    onChange?.(event)
  }

  const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    onPaste?.(event)
    requestAnimationFrame(resize)
  }

  return (
    <textarea
      ref={textareaRef}
      rows={minRows}
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-[height] duration-200 ease-out outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}
