import prisma from "@/scripts/lib/db";
import { teamSessionFields, verifiedTeamId } from "./session";
import { clearTeamId, persistSignInToken, persistTeamId } from "./token";
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
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session({ session, token }) {
      Object.assign(session, teamSessionFields(token.team_id));

      if (token) {
        session.user.id = token.id;
        session.accessToken = token.accessToken!;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
      }

      return session;
    },

    async jwt({ token, user, account, trigger, session }) {
      const signedInToken = persistSignInToken(token, user, account);
      const updatedTeamId =
        trigger === "update"
          ? (session as { team_id?: string } | undefined)?.team_id
          : undefined;

      if (updatedTeamId && signedInToken.id) {
        const verifiedTeam = await prisma.fPLTeam.findFirst({
          select: { id: true },
          where: {
            id: updatedTeamId,
            user_id: signedInToken.id,
            fpl_season_id: process.env.FPL_SEASON_ID!,
          },
        });
        const verifiedId = verifiedTeamId(updatedTeamId, verifiedTeam);
        return verifiedId
          ? persistTeamId(signedInToken, verifiedId)
          : clearTeamId(signedInToken);
      }

      const tokenWithUpdatedTeam = signedInToken;

      if (!tokenWithUpdatedTeam.id) {
        return tokenWithUpdatedTeam;
      }

      const tokenTeam = tokenWithUpdatedTeam.team_id
        ? await prisma.fPLTeam.findFirst({
            select: { id: true },
            where: {
              id: tokenWithUpdatedTeam.team_id,
              user_id: tokenWithUpdatedTeam.id,
              fpl_season_id: process.env.FPL_SEASON_ID!,
            },
          })
        : null;

      if (tokenTeam) {
        return persistTeamId(tokenWithUpdatedTeam, tokenTeam.id);
      }

      const team = await prisma.fPLTeam.findFirst({
        select: { id: true },
        where: {
          user_id: tokenWithUpdatedTeam.id,
          fpl_season_id: process.env.FPL_SEASON_ID!,
        },
      });

      return persistTeamId(clearTeamId(tokenWithUpdatedTeam), team?.id);
    },
  },
});
