import prisma from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // get user's current fpl team
      const userWithTeam = await prisma.fPLTeam.findFirst({
        where: {
          user_id: token.sub,
          fpl_season_id: "dca2d9c1-d28e-4e9f-87ae-2e6b53fb7865",
        },
      });

      session.hasTeam = !!userWithTeam;
      if (session.hasTeam) {
        session.team_id = userWithTeam!.id;
      }

      if (token) {
        session.user.id = token.id;
        session.accessToken = token.accessToken!;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
      }

      return session;
    },

    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        return null;
      }

      const jwtToken = await prisma.account.findFirst({
        where: {
          userId: dbUser.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        accessToken: jwtToken?.id_token || "",
      };
    },
    redirect() {
      return "/";
    },
  },
});
