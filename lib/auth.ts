import { User } from "@/models/user.model"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

import { connectDB } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Required feilds are empty")
        }

        try {
          await connectDB()
          const user = await User.findOne({
            email: credentials.email,
          }).select("+password")
          if (!user) {
            throw new Error("No user found with this email")
          }
          if (user.provider !== "credentials") {
            throw new Error("Please login using Google")
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password,
          )
          if (!isPasswordCorrect) {
            throw new Error("Password is incorrect")
          }
          return {
            id: String(user._id),
            _id: user.toString(),
            email: user.email,
          }
        } catch (error) {
          console.log(error)
          throw new Error("Something went wrong")
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB()

          let existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // create new user from google
            const newUser = await User.create({
              email: user.email,
              firstname: profile?.name || "Google",
              provider: "google",
            })

            user.id = newUser._id.toString()
          } else {
            user.id = existingUser._id.toString()
          }

          return true
        } catch (error) {
          console.log("OAuth error:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id
        token.email = user.email as string
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
