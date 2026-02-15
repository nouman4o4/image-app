import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, url: imageUrl } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const output = await replicate.run("timbrooks/instruct-pix2pix", {
      input: {
        prompt: prompt,
        image: imageUrl,
        scheduler: "K_EULER_ANCESTRAL",
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 100,
        image_guidance_scale: 1.5,
      },
    })

    return NextResponse.json({ success: true, output }, { status: 200 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    )
  }
}
