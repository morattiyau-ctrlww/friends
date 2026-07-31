export type Post = {
  id: string
  author: string
  content: string
  createdAt: string
  likes: number
  dislikes: number
  likedBy: string[]
  comments: number
}
