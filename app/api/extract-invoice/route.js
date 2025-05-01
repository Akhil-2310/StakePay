// app/api/extract-invoice/route.js
import { NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  try {
    const { prompt } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: "`prompt` is required" }, { status: 400 })
    }

    // 1) We add a system message so the model knows to use the function
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You’re a helper that *must* extract `title`,`description`,`amount`,`deadline` " +
            "from any user text by calling the function extractInvoice."
        },
        { role: "user", content: prompt },
      ],
      functions: [
        {
          name: "extractInvoice",
          description: "Extract invoice fields from text",
          parameters: {
            type: "object",
            properties: {
              title:       { type: "string" },
              description: { type: "string" },
              amount:      { type: "number", description: "TRBTC" },
              deadline:    { type: "string", description: "YYYY-MM-DD" }
            },
            required: ["title","amount","deadline"]
          }
        }
      ],
      // let the model choose to call it
      function_call: "auto"
    })

    // 2) Now we expect to see message.function_call
    const message    = completion.choices[0].message
    const funcCall   = message.function_call
    if (!funcCall?.arguments) {
      console.error("No function_call in response:", message)
      throw new Error("AI did not return invoice data")
    }

    // 3) Parse and return
    const args = JSON.parse(funcCall.arguments)

const rawDl = args.deadline
    const dl    = new Date(rawDl)
    if (isNaN(dl)) {
      return NextResponse.json(
        { error: `Could not parse deadline “${rawDl}”. Please use YYYY-MM-DD.` },
        { status: 400 }
      )
    }
    // Overwrite with strict ISO
    args.deadline = dl.toISOString().split("T")[0]
    return NextResponse.json({ extracted: args })
  } catch (err) {
    console.error("extract-invoice error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to extract invoice details" },
      { status: 500 }
    )
  }
}
