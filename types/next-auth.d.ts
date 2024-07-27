import "next-auth";
import "next-auth/jwt";
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    hasTeam: boolean;
    team_id: string;
    accessToken: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
