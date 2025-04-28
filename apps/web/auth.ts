import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { db } from "drizzle"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { type Session } from "next-auth"

// 扩展 Session 类型以包含 userId
interface ExtendedSession extends Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

// console.log(prisma, prismaAdapter)
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GithubProvider],
  adapter: DrizzleAdapter(db),
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      } as ExtendedSession
    },
  },
})

// 导出扩展的 Session 类型供其他文件使用
export type { ExtendedSession as Session }