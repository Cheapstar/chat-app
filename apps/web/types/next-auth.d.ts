import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId?: string; // Add your custom field here
    };
  }

  interface JWT {
    userId?: string; // Add your custom field here
  }
}
