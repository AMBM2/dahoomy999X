import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { appendAuditLog } from "@/lib/audit-log"

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID]
const QUESTIONS_FILE = join(process.cwd(), "data", "questions.json")

const isAdmin = (userId?: string) => userId && ADMIN_IDS.includes(userId)

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), "data")
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
}

// Read questions from file
const readQuestions = () => {
  ensureDataDir()
  if (!existsSync(QUESTIONS_FILE)) {
    return []
  }
  try {
    const data = readFileSync(QUESTIONS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Write questions to file
const writeQuestions = (questions: any) => {
  ensureDataDir()
  writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      categoryId,
      type,
      text,
      answer,
      choices,
      mediaUrl,
      isRiddle,
      points,
      gameMode,
      letter,
      youtubeUrl,
      timestamp,
      clipStart,
      clipEnd,
    } = body

    if (!categoryId || !text || !answer || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const questions = readQuestions()
    
    // Generate unique ID
    const id = `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newQuestion = {
      id,
      categoryId,
      type,
      text,
      answer,
      choices: choices || [],
      mediaUrl: mediaUrl || null,
      youtubeUrl: youtubeUrl || null,
      timestamp: timestamp || null,
      clipStart: clipStart || null,
      clipEnd: clipEnd || null,
      isRiddle: isRiddle || false,
      points: points || 100,
      gameMode: gameMode || "seen-geem",
      letter: letter || null,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id,
    }

    questions.push(newQuestion)
    writeQuestions(questions)

    appendAuditLog({
      type: "question:add",
      actorId: session.user.id,
      targetId: id,
      meta: {
        categoryId,
        points: newQuestion.points,
        text,
        answer,
        mediaUrl,
        type,
        youtubeUrl,
        timestamp,
        clipStart,
        clipEnd,
      },
    })

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const questions = readQuestions()
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error reading questions:", error)
    return NextResponse.json(
      { error: "Failed to read questions" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get("id")

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      )
    }

    const questions = readQuestions()
    const filteredQuestions = questions.filter((q: any) => q.id !== questionId)
    writeQuestions(filteredQuestions)

    appendAuditLog({
      type: "question:delete",
      actorId: session.user.id,
      targetId: questionId,
    })

    return NextResponse.json(
      { message: "Question deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get("id")

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { text, answer, points, categoryId } = body

    const questions = readQuestions()
    const index = questions.findIndex((q: any) => q.id === questionId)
    if (index === -1) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    const original = questions[index]
    const updated = {
      ...original,
      ...(typeof text === "string" ? { text } : {}),
      ...(typeof answer === "string" ? { answer } : {}),
      ...(typeof points === "number" ? { points } : {}),
      ...(typeof categoryId === "string" && categoryId ? { categoryId } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id,
    }

    questions[index] = updated
    writeQuestions(questions)

    appendAuditLog({
      type: "question:update",
      actorId: session.user.id,
      targetId: questionId,
      meta: {
        text: updated.text,
        answer: updated.answer,
        points: updated.points,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    )
  }
}
