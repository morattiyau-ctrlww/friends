"use client"

import { Check, ChevronDown, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FRIENDS, getFriend, getInitials } from "@/lib/friends"

type HeaderProps = {
  currentUser: string
  onSwitchUser: (name: string) => void
}

export default function Header({ currentUser, onSwitchUser }: HeaderProps) {
  const currentFriend = getFriend(currentUser)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Users className="size-4" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Friend Feed
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 rounded-full pr-3 pl-1.5"
              aria-label={`Current user: ${currentUser}`}
            >
              <Avatar className="size-7">
                <AvatarFallback
                  className={`${currentFriend.avatarColor} text-xs text-white`}
                >
                  {getInitials(currentUser)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{currentUser}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch user</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {FRIENDS.map((friend) => (
              <DropdownMenuItem
                key={friend.name}
                onSelect={() => onSwitchUser(friend.name)}
                className="gap-2.5"
              >
                <Avatar className="size-6">
                  <AvatarFallback
                    className={`${friend.avatarColor} text-xs text-white`}
                  >
                    {getInitials(friend.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex flex-col">
                  <span className="text-sm">{friend.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {friend.tagline}
                  </span>
                </span>
                {currentUser === friend.name && (
                  <Check className="ml-auto size-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
