import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
// import { prisma, prismaAdapter } from "database"

// console.log(prisma, prismaAdapter)
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  // adapter: prismaAdapter,
  providers: [GithubProvider],
})