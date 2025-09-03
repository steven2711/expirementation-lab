import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
    accessToken: string;
    project: {
      id: string;
      name: string;
      apiKey: string;
    } | null;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    accessToken: string;
    project: {
      id: string;
      name: string;
      apiKey: string;
    } | null;
  }
}