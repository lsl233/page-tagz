
"use server"
import { auth } from "@/auth"
import { prisma } from "database"

export const getUserTags = async () => {
  // const session = await auth()
  // if (!session?.user?.id) {
  //   return []
  // }
  // const tags = await prisma.tag.findMany({
  //   where: {
  //     creatorId: "1",
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  // })
  return []
}