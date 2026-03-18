import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be defined in environment variables")
}

if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
  throw new Error("Discord credentials must be defined in environment variables")
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify" } },
      async profile(profile: any) {
        return {
          id: profile.id,
          name: profile.username,
          image: profile.image_url || `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp?size=160`,
          flags: profile.public_flags || 0,
          premiumType: profile.premium_type || 0,
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, account, user, profile }: any) {
      if (account) {
        token.accessToken = account.access_token
        token.id = user?.id
      }
      if (user) {
        token.id = user.id
        token.image = user.image
        token.name = user.name
        token.flags = user.flags || 0
        token.premiumType = user.premiumType || 0
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.image = token.image as string
        session.user.name = token.name as string
        session.user.flags = token.flags as number
        session.user.premiumType = token.premiumType as number
      }
      return session
    },
    async redirect({ url, baseUrl }: any) {
      // Redirect to home page after successful authentication
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

export default NextAuth(authOptions)
