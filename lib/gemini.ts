export type GeminiYouTubeQuestion = {
  timestamp: string // "MM:SS" or "HH:MM:SS"
  question: string
  options: string[]
  correct: string
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

function requireKey() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local")
  }
  return GEMINI_API_KEY
}

export async function generateTimestampQuestionsFromTranscript(args: {
  youtubeUrl: string
  transcriptText: string
  count: number
}): Promise<GeminiYouTubeQuestion[]> {
  const apiKey = requireKey()
  const { youtubeUrl, transcriptText, count } = args

  const prompt = `
You are generating trivia questions based on a YouTube video transcript.

Video URL: ${youtubeUrl}

Return ONLY valid JSON (no markdown, no explanation).
Shape:
[
  { "timestamp": "02:15", "question": "...", "options": ["...","...","...","..."], "correct": "..." }
]

Rules:
- Generate exactly ${count} questions.
- Each timestamp must point to a moment that exists in the transcript.
- Questions must be answerable from the transcript context around that timestamp.
- Options must be 4 items. "correct" must exactly match one of options.
- Keep Arabic wording if transcript is Arabic; otherwise use the transcript language.

Transcript:
${transcriptText}
`.trim()

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Gemini request failed (${res.status}): ${text}`)
  }

  const data: any = await res.json()
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("\n") || ""

  // Expect raw JSON, but be defensive.
  const jsonText = (() => {
    const trimmed = text.trim()
    if (trimmed.startsWith("[")) return trimmed
    const m = trimmed.match(/\[[\s\S]*\]/)
    return m ? m[0] : trimmed
  })()

  const parsed = JSON.parse(jsonText)
  if (!Array.isArray(parsed)) throw new Error("Gemini did not return an array JSON")

  return parsed.map((q: any) => ({
    timestamp: String(q.timestamp || "").trim(),
    question: String(q.question || "").trim(),
    options: Array.isArray(q.options) ? q.options.map((s: any) => String(s)) : [],
    correct: String(q.correct || "").trim(),
  }))
}

