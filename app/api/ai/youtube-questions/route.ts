import { NextRequest, NextResponse } from "next/server"
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import { YoutubeTranscript } from "youtube-transcript"
import { generateTimestampQuestionsFromTranscript } from "@/lib/gemini"

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "") || null
    }
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v")
    }
    return null
  } catch {
    return null
  }
}

function secondsToTimestamp(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (hh > 0) return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const youtubeUrl = String(body.youtubeUrl || "").trim()
    const count = Math.max(1, Math.min(30, Number(body.count || 10)))

    if (!youtubeUrl) {
      return NextResponse.json({ error: "youtubeUrl is required" }, { status: 400 })
    }

    const videoId = extractYouTubeId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)
    const transcriptText = transcriptItems
      .slice(0, 4000)
      .map((it: any) => `[${secondsToTimestamp(it.offset)}] ${it.text}`)
      .join("\n")

    const questions = await generateTimestampQuestionsFromTranscript({
      youtubeUrl,
      transcriptText,
      count,
    })

    const outDir = join(process.cwd(), "data", "youtube-questions")
    mkdirSync(outDir, { recursive: true })
    const filename = `${videoId}-${Date.now()}.json`
    const outPath = join(outDir, filename)
    writeFileSync(outPath, JSON.stringify({ youtubeUrl, videoId, questions }, null, 2), "utf-8")

    return NextResponse.json({ file: `data/youtube-questions/${filename}`, youtubeUrl, videoId, questions })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to generate questions" }, { status: 500 })
  }
}

