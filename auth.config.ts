import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login',
    newUser: '/signup',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnBubble = nextUrl.pathname.startsWith('/bubble');

      if (isOnBubble) {
        return isLoggedIn;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/bubble/chats', nextUrl));
      }

      return true;
    },
    session: async ({ session, token, user }) => {
      if (session.user && !session.user.id) {
        session.user.id = token.id as any;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
