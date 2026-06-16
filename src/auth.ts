import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import authConfig from "./auth.config"
import { users, accounts, sessions, verificationTokens } from "@/db/schema"

import { eq } from "drizzle-orm";

const baseAdapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...baseAdapter,
    createUser: async (user) => {
      let baseUsername = user.name 
        ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '') 
        : user.email.split('@')[0].replace(/[^a-z0-9]/g, '');
      
      if (!baseUsername) baseUsername = "user";
      
      let username = baseUsername;
      let counter = 1;
      
      // Check for uniqueness
      while (true) {
        const existing = await db.query.users.findFirst({ 
          where: eq(users.username, username) 
        });
        if (!existing) break;
        // Generate random suffix or counter
        username = `${baseUsername}${Math.floor(Math.random() * 1000)}${counter}`;
        counter++;
      }
      
      // @ts-ignore - inject username
      user.username = username;
      return baseAdapter.createUser!(user);
    }
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // @ts-ignore - append custom fields
        session.user.role = (user as any).role || "member";
        // @ts-ignore
        session.user.username = (user as any).username;
      }
      return session;
    }
  },
  ...authConfig,
})
