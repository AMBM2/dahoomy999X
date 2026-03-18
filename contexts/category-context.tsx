"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface Category {
  id: string
  name: string
  icon?: string
  iconName?: string
  imageType?: "image" | "emoji"
  imageValue?: string
  group?: string
  color?: string
  isDynamic?: boolean
}

interface CategoryContextType {
  categories: Category[]
  addCategory: (category: Category) => void
  removeCategory: (categoryId: string) => void
  refreshCategories: () => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories", { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      // Silently handle
    }
    setIsInitialized(true)
  }, [])

  // Initialize categories on mount
  useEffect(() => {
    if (!isInitialized) {
      fetchCategories()
    }
  }, [isInitialized, fetchCategories])

  const refreshCategories = async () => {
    await fetchCategories()
  }

  const addCategory = (category: Category) => {
    setCategories(prev => {
      // Don't add duplicates
      if (prev.find(c => c.id === category.id)) {
        return prev
      }
      return [...prev, category]
    })
  }

  const removeCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId))
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        removeCategory,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error("useCategories must be used within CategoryProvider")
  }
  return context
}
