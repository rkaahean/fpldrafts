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
          fpl_season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
        },
      });

      session.hasTeam = !!userWithTeam;
      if (session.hasTeam) {
        session.team_id = userWithTeam!.id;
      }
      return session;
    },
  },
});
