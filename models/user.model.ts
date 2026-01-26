import mongoose, { Document, Types, Schema } from "mongoose"
import bcrypt from "bcryptjs"

// ---------------------
// Types / Interfaces
// ---------------------
export interface IUser {
  firstname: string
  lastname?: string
  email: string
  about?: string
  gender?: string
  profileImage?: {
    imageUrl: string
    identifier: string
  }
  media?: Types.ObjectId[]
  totalLikes?: number
  followers?: Types.ObjectId[]
  savedMedia?: Types.ObjectId[]
  likedMedia?: Types.ObjectId[]
  provider: "credentials" | "google"
  password?: string
  following?: Types.ObjectId[]

  comparePassword(candidatePassword: string): Promise<boolean>
}

export type IUserDocument = IUser & Document

// ---------------------
// Schema
// ---------------------
const UserSchema: Schema<IUserDocument> = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    about: {
      type: String,
    },
    gender: {
      type: String,
    },
    profileImage: {
      type: {
        imageUrl: { type: String },
        identifier: { type: String },
      },
      default: null,
    },

    // 🔹 Auth fields
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
      required: true,
    },

    password: {
      type: String,
      required: function (this: IUserDocument) {
        return this.provider === "credentials"
      },
      select: false, // 🔥 VERY IMPORTANT: password not returned by default
    },

    media: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    savedMedia: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    likedMedia: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    totalLikes: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// ---------------------
// Middleware: Hash password before save
// ---------------------
UserSchema.pre("save", async function (next) {
  // Only hash if:
  // - provider is credentials
  // - password exists
  // - password was modified
  if (
    this.provider !== "credentials" ||
    !this.password ||
    !this.isModified("password")
  ) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (err) {
    return next(err as any)
  }
})

// ---------------------
// Methods
// ---------------------
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  // 🔥 Protect against OAuth users
  if (this.provider !== "credentials" || !this.password) {
    throw new Error("Password login not allowed for this account")
  }

  return bcrypt.compare(candidatePassword, this.password)
}

// ---------------------
// Model
// ---------------------
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
