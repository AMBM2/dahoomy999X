import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { appendAuditLog } from "@/lib/audit-log"

const ADMIN_ID = "897450827353063505"
const SECONDARY_ADMIN_ID = "1186739142231605248"
const ADMIN_IDS = [ADMIN_ID, SECONDARY_ADMIN_ID]
const CATEGORIES_FILE = join(process.cwd(), "data", "categories.json")
const QUESTIONS_FILE = join(process.cwd(), "data", "questions.json")
const HOSTS_FILE = join(process.cwd(), "data", "hosts.json")

const isAdmin = (userId?: string) => userId && ADMIN_IDS.includes(userId)

// Read hosts to check permissions
const readHosts = () => {
  const dataDir = join(process.cwd(), "data")
  if (!existsSync(dataDir)) return []
  if (!existsSync(HOSTS_FILE)) return []
  try {
    return JSON.parse(readFileSync(HOSTS_FILE, "utf-8"))
  } catch {
    return []
  }
}

const hasPermission = (userId: string, permission: string): boolean => {
  if (isAdmin(userId)) return true
  const hosts = readHosts()
  const host = hosts.find((h: any) => h.userId === userId)
  return host && host.permissions && host.permissions.includes(permission)
}

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), "data")
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
}

// Read categories from file
const readCategories = () => {
  ensureDataDir()
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
  ensureDataDir()
  writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2))
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
    // Check admin authentication or host permissions
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 403 }
      )
    }

    const canAddCategories = isAdmin(session.user.id) || hasPermission(session.user.id, "add_categories")
    if (!canAddCategories) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to add categories" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, group, imageType, imageValue } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "اسم التصنيف مطلوب" },
        { status: 400 }
      )
    }
    
    if (!imageType || !imageValue) {
      return NextResponse.json(
        { error: "نوع الصورة والقيمة مطلوبان" },
        { status: 400 }
      )
    }

    const categories = readCategories()
    
    // Generate unique ID
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newCategory = {
      id,
      name: name.trim(),
      group: group || "custom",
      imageType,
      imageValue,
      iconName: imageValue,
      isDynamic: true,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id,
    }

    categories.push(newCategory)
    writeCategories(categories)

    appendAuditLog({
      type: "category:add",
      actorId: session.user.id,
      targetId: id,
      meta: { 
        name: newCategory.name, 
        group: newCategory.group,
        imageType: newCategory.imageType,
        imageValue: newCategory.imageValue
      },
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    const errorMessage = error instanceof Error ? error.message : "فشل إنشاء التصنيف"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const categories = readCategories()
    const questions = readQuestions()
    const countByCategory = new Map<string, number>()
    for (const q of Array.isArray(questions) ? questions : []) {
      const cid = (q as any)?.categoryId
      if (!cid) continue
      countByCategory.set(cid, (countByCategory.get(cid) || 0) + 1)
    }
    // Ensure all categories have iconName field for display
    const transformedCategories = categories.map((cat: any) => ({
      ...cat,
      iconName: cat.iconName || cat.imageValue || cat.icon,
      questionCount: countByCategory.get(cat.id) || 0,
    }))
    return NextResponse.json(transformedCategories)
  } catch (error) {
    console.error("Error reading categories:", error)
    return NextResponse.json(
      { error: "Failed to read categories" },
      { status: 500 }
    )
  }
}
