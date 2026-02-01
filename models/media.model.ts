import mongoose, { Document, ObjectId, Schema, Types } from "mongoose"

// ---------------------
// Types / Interfaces
// ---------------------

export const VIDEO_DIMENSIONS = {
  widht: 1080,
  heihgt: 1920,
} as const

export interface IComment {
  _id?: Types.ObjectId
  content: string
  user: Types.ObjectId
  likes: Types.ObjectId[]
  createdAt?: Date
}

export interface IMedia {
  title: string
  fileType: string
  description?: string
  mediaUrl: string // could be local path or remote URL
  thumbnailUrl?: string
  controles?: boolean
  transformation?: {
    height: number
    width: number
    quality?: number
  }
  uploadedBy: Types.ObjectId
  category: string
  tags: string[]
  likes: Types.ObjectId[]
  comments: IComment[]
  fileId: string
}
export type IMediaDocument = IMedia & Document
// ---------------------
// Schema
// ---------------------
const MediaSchema: Schema<IMediaDocument> = new Schema<IMediaDocument>(
  {
    title: { type: String, required: true, trim: true },
    fileType: { type: String, required: true },
    description: { type: String },
    mediaUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    controles: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS.heihgt },
      width: { type: Number, default: VIDEO_DIMENSIONS.widht },
      quality: { type: Number, min: 1, max: 100 },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        content: { type: String, required: true, trim: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    fileId: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true },
)

MediaSchema.index({
  title: "text",
  description: "text",
  tags: "text",
})

// ---------------------
// Model
// ---------------------
export const Media =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema)
