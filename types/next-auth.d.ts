import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string
      name?: string | null 
      image?: string | null
      flags?: number
      premiumType?: number
    }
  }
  
  interface User {
    id?: string
    name?: string | null
    image?: string | null
    flags?: number
    premiumType?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    name?: string | null
    image?: string | null
    flags?: number
    premiumType?: number
    accessToken?: string
  }
}
