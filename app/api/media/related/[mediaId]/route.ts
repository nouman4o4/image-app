import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Media } from "@/models/media.model"
import mongoose from "mongoose"

export async function GET(
  req: Request,
  { params }: { params: { mediaId: string } },
) {
  try {
    await connectDB()

    const { mediaId } = await params

    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return NextResponse.json({ error: "Invalid media id" }, { status: 400 })
    }

    const currentMedia = await Media.findById(mediaId)

    if (!currentMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const relatedMedia = await Media.aggregate([
      {
        $match: {
          _id: {
            $ne: new mongoose.Types.ObjectId(currentMedia._id),
          },
        },
      },

      {
        $addFields: {
          score: {
            $add: [
              // 👤 Same creator
              {
                $cond: [{ $eq: ["$creator", currentMedia.creator] }, 3, 0],
              },

              // 🗂 Same category
              {
                $cond: [
                  {
                    $eq: [
                      "$category",
                      currentMedia.category?._id ?? currentMedia.category,
                    ],
                  },
                  2,
                  0,
                ],
              },

              // 🏷 Shared tags
              {
                $size: {
                  $setIntersection: [
                    { $ifNull: ["$tags", []] },
                    currentMedia.tags || [],
                  ],
                },
              },

              // 📝 Title similarity score
              {
                $multiply: [
                  {
                    $size: {
                      $setIntersection: [
                        {
                          $split: [{ $toLower: "$title" }, " "],
                        },
                        (currentMedia.title || "").toLowerCase().split(" "),
                      ],
                    },
                  },
                  0.5,
                ],
              },
            ],
          },
        },
      },

      // 🚫 Remove unrelated
      {
        $match: {
          score: { $gt: 0 },
        },
      },

      // 🔥 Best first
      {
        $sort: { score: -1, createdAt: -1 },
      },

      {
        $limit: 12,
      },

      {
        $project: {
          score: 0,
        },
      },
    ])

    return NextResponse.json(relatedMedia)
  } catch (error) {
    console.error("Related media error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
