import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import { appendAuditLog } from "@/lib/audit-log"

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID]
const CATEGORIES_FILE = join(process.cwd(), "data", "categories.json")
const QUESTIONS_FILE = join(process.cwd(), "data", "questions.json")

const isAdmin = (userId?: string) => userId && ADMIN_IDS.includes(userId)

// Read categories from file
const readCategories = () => {
  if (!existsSync(CATEGORIES_FILE)) {
    return []
  }
  try {
    const data = readFileSync(CATEGORIES_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Write categories to file
const writeCategories = (categories: any) => {
  writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2))
}

// Read questions from file
const readQuestions = () => {
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
  writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2))
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { id: categoryId } = await params

    // Delete category
    const categories = readCategories()
    const filteredCategories = categories.filter((c: any) => c.id !== categoryId)
    writeCategories(filteredCategories)

    // Delete all questions in this category (cascade delete)
    const questions = readQuestions()
    const filteredQuestions = questions.filter((q: any) => q.categoryId !== categoryId)
    writeQuestions(filteredQuestions)

    appendAuditLog({
      type: "category:delete",
      actorId: session.user.id,
      targetId: categoryId,
    })

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
