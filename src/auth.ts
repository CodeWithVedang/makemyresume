import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { loginSchema } from "@/lib/validation/auth";
import { prisma } from "@/server/db";
import { clientIp, rateLimit } from "@/server/rate-limit";

const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-real-password", 10);

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw, request) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const ip = clientIp(request.headers);
      if (!rateLimit(`login:${ip}:${email}`, 8, 15 * 60_000).ok) throw new RateLimitedError();

      const user = await prisma.user.findUnique({ where: { email } });
      // Compare against a dummy hash when the user is missing to keep timing uniform.
      const hash = user?.passwordHash ?? DUMMY_HASH;
      const valid = await bcrypt.compare(password, hash);
      if (!user || !user.passwordHash || !valid) return null;
      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

if (googleEnabled) providers.push(Google({ allowDangerousEmailAccountLinking: false }));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT sessions are required for the Credentials provider.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
