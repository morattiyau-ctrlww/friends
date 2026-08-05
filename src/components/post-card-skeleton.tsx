import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const bar = "rounded-full bg-white/10 animate-pulse"

export default function PostCardSkeleton() {
  return (
    <Card className="gap-0 p-0" aria-hidden="true">
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-cyan-400/30" />

      <div className="flex items-start gap-3 p-4 pb-2">
        <div className={cn(bar, "size-11 shrink-0 rounded-full ring-2 ring-white/5")} />
        <div className="min-w-0 flex-1 space-y-2.5 pt-1.5">
          <div className="flex items-center gap-2">
            <div className={cn(bar, "h-3.5 w-24")} />
            <div className={cn(bar, "h-4 w-20 rounded-full")} />
          </div>
          <div className={cn(bar, "h-2.5 w-28")} />
        </div>
      </div>

      <div className="space-y-2.5 px-4 pt-1">
        <div className={cn(bar, "h-3 w-full")} />
        <div className={cn(bar, "h-3 w-11/12")} />
        <div className={cn(bar, "h-3 w-2/3")} />
      </div>

      <div className={cn(bar, "mx-4 mt-4 h-40 rounded-[12px]")} />

      <div className="mt-4 flex items-center gap-2 px-4 pb-2.5">
        <div className={cn(bar, "h-8 w-20")} />
        <div className={cn(bar, "h-8 w-24")} />
        <div className={cn(bar, "h-8 w-10")} />
        <div className="ml-auto flex items-center gap-2">
          <div className={cn(bar, "h-8 w-14")} />
          <div className={cn(bar, "h-8 w-8")} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2.5">
        <div className={cn(bar, "h-4 w-24")} />
        <div className={cn(bar, "h-8 w-28")} />
      </div>
    </Card>
  )
}
