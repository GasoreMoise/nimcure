import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // For demo purposes, we'll use a mock user
        if (credentials?.email === "emmanuel@nimcure.com" && credentials?.password === "password") {
          return {
            id: "1",
            name: "Emmanuel Adigwe",
            email: "emmanuel@nimcure.com",
            image: "/avatar.jpg"
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/(auth)/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
