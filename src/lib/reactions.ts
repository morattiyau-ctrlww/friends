export type ReactionType = "like" | "dislike"

export type ReactionEventDetail = {
  x: number
  y: number
  type: ReactionType
}

export const REACTION_EVENT = "feed:reaction"

export function emitReaction(x: number, y: number, type: ReactionType): void {
  window.dispatchEvent(
    new CustomEvent<ReactionEventDetail>(REACTION_EVENT, {
      detail: { x, y, type },
    })
  )
}
