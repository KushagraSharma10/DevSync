export type PublicUser = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  token: string
  user: PublicUser
}
