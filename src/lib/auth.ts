import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = credentials.email.trim();

        // Try email first, then phone number
        let user = await prisma.user.findUnique({
          where: { email: identifier },
        });

        if (!user) {
          // Try matching by phone (strip non-digits for flexible matching)
          const cleanPhone = identifier.replace(/[^0-9+]/g, "");
          if (cleanPhone.length >= 6) {
            user = await prisma.user.findFirst({
              where: {
                phone: { not: "" },
                OR: [
                  { phone: identifier },
                  { phone: cleanPhone },
                  { phone: { endsWith: cleanPhone.slice(-9) } },
                ],
              },
            });
          }
        }

        if (!user) return null;

        const isValid = await bcryptjs.compare(credentials.password, user.password);
        if (!isValid) return null;

        if (user.subscriptionStatus === "suspended") {
          throw new Error("SUSPENDED");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          locale: user.locale,
          currency: user.currency,
          subscriptionStatus: user.subscriptionStatus,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.locale = (user as any).locale;
        token.currency = (user as any).currency;
        token.subscriptionStatus = (user as any).subscriptionStatus;
      }
      if (trigger === "update" && session) {
        token.locale = session.locale || token.locale;
        token.currency = session.currency || token.currency;
        token.name = session.name || token.name;
        token.subscriptionStatus = session.subscriptionStatus || token.subscriptionStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).locale = token.locale;
        (session.user as any).currency = token.currency;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
