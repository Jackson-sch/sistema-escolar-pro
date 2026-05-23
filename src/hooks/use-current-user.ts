import { useSession } from "next-auth/react";

export type CurrentUser = {
  id: string;
  role: string;
  institucionId: string;
  name: string | null;
  email: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
};

export const useCurrentUser = (): CurrentUser | null => {
  const session = useSession();
  const user = session.data?.user;
  if (!user) return null;
  return {
    id: user.id,
    role: user.role as string,
    institucionId: user.institucionId as string,
    name: user.name ?? null,
    email: user.email ?? null,
    apellidoPaterno: (user as any).apellidoPaterno ?? null,
    apellidoMaterno: (user as any).apellidoMaterno ?? null,
  };
};
