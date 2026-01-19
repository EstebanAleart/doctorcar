import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import pool from '@/lib/database';

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
        
        // Get or create user role on first login
        try {
          let result = await pool.query(
            "SELECT id, role FROM users WHERE email = $1",
            [user.email]
          );
          
          if (result.rows.length === 0) {
            // Create user with client role
            result = await pool.query(
              "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id, role",
              [user.name, user.email, "client"]
            );
            console.log(`New user created: ${user.email} with role 'client'`);
          }
          
          // Store role in token
          token.role = result.rows[0].role;
          token.userId = result.rows[0].id;
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
      console.log('User signing in:', user.email);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // After Auth0 callback, always redirect to our callback page
      if (url.includes('/api/auth/callback/auth0') || url === baseUrl || url === `${baseUrl}/`) {
        console.log('Redirecting to /auth/callback for role-based redirect');
        return `${baseUrl}/auth/callback`;
      }
      
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        console.log('Relative URL redirect:', url);
        return `${baseUrl}${url}`;
      }
      
      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        console.log('Same origin redirect:', url);
        return url;
      }
      
      console.log('Default redirect to /auth/callback');
      return `${baseUrl}/auth/callback`;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email);
    },
  },
};

export default NextAuth(authOptions);
