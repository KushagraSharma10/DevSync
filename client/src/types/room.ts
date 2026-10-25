export type Room = {
  id: string
  name: string
  code: string
  ownerId: string
  createdAt: string
  savedCode?: string
}

export type Participant = {
  id: string
  name: string
  isYou?: boolean
}

export type ChatMessage = {
  id: string
  text: string
  author: string
  authorId: string
  createdAt: string
  time: string
}
