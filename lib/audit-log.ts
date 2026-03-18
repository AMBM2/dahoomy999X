import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"

const DATA_DIR = join(process.cwd(), "data")
const AUDIT_FILE = join(DATA_DIR, "audit-log.json")

export interface AuditEntry {
  id: string
  type: string
  actorId: string | null
  targetId?: string
  meta?: Record<string, any>
  createdAt: string
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function readAuditLog(): AuditEntry[] {
  ensureDataDir()
  if (!existsSync(AUDIT_FILE)) {
    return []
  }
  try {
    const raw = readFileSync(AUDIT_FILE, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function appendAuditLog(entry: Omit<AuditEntry, "id" | "createdAt">) {
  try {
    const list = readAuditLog()
    const full: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    }
    list.push(full)
    writeFileSync(AUDIT_FILE, JSON.stringify(list, null, 2))
  } catch {
    // logging should never break main flow
  }
}

