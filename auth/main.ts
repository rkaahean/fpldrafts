import prisma from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      // get user's current fpl team
      const userWithTeam = await prisma.fPLTeam.findFirst({
        where: {
          user_id: user.id,
        },
      });

      session.hasTeam = !!userWithTeam;
      return session;
    },
  },
});
