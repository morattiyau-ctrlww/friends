export type Friend = {
  name: string
  tagline: string
  avatarColor: string
}

export const FRIENDS: Friend[] = [
  { name: "Alex", tagline: "Coffee enthusiast", avatarColor: "bg-blue-500" },
  { name: "Sam", tagline: "Trail runner", avatarColor: "bg-emerald-500" },
  { name: "Taylor", tagline: "Cat parent", avatarColor: "bg-violet-500" },
]

export function getFriend(name: string): Friend {
  return (
    FRIENDS.find((friend) => friend.name === name) ?? {
      name,
      tagline: "Friend",
      avatarColor: "bg-zinc-500",
    }
  )
}

export function getInitials(name: string): string {
  return name.charAt(0).toUpperCase()
}
