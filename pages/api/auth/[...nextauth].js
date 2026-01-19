import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import { userDb } from '@/lib/database';

export const authOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER_BASE_URL,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH0_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.email = user.email;

        // Construir objeto seguro para upsert
        const auth0User = {
          sub: account.sub || user.id,
          email: user.email,
          name: user.name,
          picture: user.image,
        };
        try {
          // Upsert user en DB usando Auth0 data
          const dbUser = await userDb.upsertFromAuth0(auth0User);
          token.role = dbUser.role;
          token.userId = dbUser.id;
        } catch (error) {
          console.error("Error in jwt callback:", error);
          token.role = "client"; // default fallback
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session from token
      session.user.role = token.role || "client";
      session.user.id = token.userId;
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      
      return session;
    },
    async signIn({ user }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // After Auth0 callback, always redirect to our callback page
      if (url.includes('/api/auth/callback/auth0') || url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/auth/callback`;
      }
      
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      return `${baseUrl}/auth/callback`;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      // User signed in
    },
  },
};

export default NextAuth(authOptions);
