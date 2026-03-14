import { prisma } from "./prisma";

/**
 * Finds the user by email, or auto-creates them if they don't exist.
 * This handles the case where the User table was cleared but the
 * session (JWT) is still valid.
 */
export async function getOrCreateUser(email: string, name?: string | null) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // no-op if user exists
    create: {
      email,
      name: name || email.split("@")[0],
    },
  });
  return user;
}
