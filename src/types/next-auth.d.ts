import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name?: string;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    email: string;
  }
} 