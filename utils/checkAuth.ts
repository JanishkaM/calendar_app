import * as z from "zod";

export interface User {
  id: string;
  email: string | null;
  aud: "authenticated";
  role: "authenticated";
  confirmed_at: string | null;
}

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  aud: z.literal("authenticated"),
  role: z.literal("authenticated"),
  confirmed_at: z.string().datetime().nullable(),
});

export const isUserAuthenticated = (user: unknown) => {
  if (!user || typeof user !== "object") {
    return false;
  }
  const parseResult = UserSchema.safeParse(user);
  return parseResult.success;
};