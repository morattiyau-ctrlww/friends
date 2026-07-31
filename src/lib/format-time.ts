export function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (seconds < 60) return "just now"
  if (minutes < 60) return pluralize(minutes, "minute") + " ago"
  if (hours < 24) return pluralize(hours, "hour") + " ago"
  if (days < 7) return pluralize(days, "day") + " ago"
  if (weeks < 5) return pluralize(weeks, "week") + " ago"

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`
}
