
import { prisma, prismaAdapter } from "database"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"


// console.log(prisma, prismaAdapter)
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GithubProvider],
  adapter: prismaAdapter,
})