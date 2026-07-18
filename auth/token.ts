type TokenFields = {
  [key: string]: unknown;
  id?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  accessToken?: string;
  team_id?: string;
};

type SignInUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type SignInAccount = {
  id_token?: string | null;
};

export function persistSignInToken<T extends TokenFields>(
  token: T,
  user?: SignInUser | null,
  account?: SignInAccount | null
): T & TokenFields {
  if (!user?.id) {
    return token;
  }

  return {
    ...token,
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.image,
    accessToken: account?.id_token ?? token.accessToken,
  };
}

export function persistTeamId<T extends TokenFields>(
  token: T,
  teamId: string | undefined
): T & TokenFields {
  if (!teamId) {
    return token;
  }

  return { ...token, team_id: teamId };
}
