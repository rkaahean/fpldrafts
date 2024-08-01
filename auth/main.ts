import prisma from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET!,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      // if (parseInt(session.expires) <= Date.now() / 1000) {
      //   // Session has expired, invalidate it
      //   return null;
      // }

      // if (!token) {
      //   return null;
      // }

      // Session is still valid, proceed as usual
      // get user's current fpl team
      const userWithTeam = await prisma.fPLTeam.findFirst({
        where: {
          user_id: token.sub,
          fpl_season_id: process.env.FPL_SEASON_ID!,
        },
      });

      session.hasTeam = !!userWithTeam;

      if (token) {
        session.user.id = token.id;
        session.accessToken = token.accessToken!;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
      }

      return session;
    },

    async jwt({ token }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      // if (token && token.exp! > Date.now() / 100) {
      //   return null;
      // }

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
        accessToken: jwtToken?.id_token!,
      };
    },
  },
});
