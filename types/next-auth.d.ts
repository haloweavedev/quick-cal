import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `auth()`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    isAdmin?: boolean;
  }

  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different for each provider.
   */
  interface Account {
    // Add custom properties here if needed
  }

  /** The OAuth profile returned from your provider */
  interface Profile {
    // Add custom properties here if needed
  }

  interface JWT {
    id: string;
    isAdmin?: boolean;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

// We need this to make TypeScript understand the custom properties
declare module "@auth/prisma-adapter" {
  interface AdapterUser {
    isAdmin?: boolean;
  }
}