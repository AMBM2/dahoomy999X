// =====================================================
// Modern Infographic Category Grid (2026)
// =====================================================

"use client"

import React, { useState, useMemo } from "react"
import { Search, Sparkles, TrendingUp } from "lucide-react"
import { NEON_PALETTE, CATEGORY_COLORS } from "@/lib/schema-constants"
import { getCategoryIcon, getIconColor } from "@/lib/category-icons"
import { categoryGroups } from "@/lib/question-bank"
import AppIcon from "@/components/app-icon"

interface ModernCategoryGridProps {
  categories: any[]
  onSelectCategory: (categoryId: string) => void
  selectedCategories?: string[]
  multiSelect?: boolean
}

interface CategoryCardProps {
  categoryId: string
  categoryName: string
  categoryDescription?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  questionCount?: number
  isSelected?: boolean
  onClick: () => void
  neonColor: string
}

/**
 * Modern Infographic Category Card Component
 */
const ModernCategoryCard: React.FC<CategoryCardProps> = ({
  categoryId,
  categoryName,
  categoryDescription,
  difficulty = 'beginner',
  questionCount = 0,
  isSelected = false,
  onClick,
  neonColor,
}) => {
  const IconComponent = getCategoryIcon(categoryId)
  
  const difficultyColor = {
    beginner: NEON_PALETTE.green,
    intermediate: NEON_PALETTE.yellow,
    advanced: NEON_PALETTE.orange,
    expert: NEON_PALETTE.red
  }[difficulty]

  const difficultyLabel = {
    beginner: '',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    expert: 'خبير'
  }[difficulty]

  return (
    <div
      onClick={onClick}
      className={`
        relative group cursor-pointer overflow-hidden rounded-2xl
        transition-all duration-300 ease-out hover:scale-103
        h-64 flex flex-col
      `}
      style={{
        backgroundColor: `${neonColor}08`,
        borderColor: isSelected ? neonColor : `${neonColor}40`,
        borderWidth: '2px',
        boxShadow: isSelected ? `0 0 20px ${neonColor}60` : `0 0 10px ${neonColor}20`,
      }}
    >
      {/* Background Gradient Animation */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${neonColor}20, transparent 50%)`,
        }}
      />

      {/* Icon Container (نفس تصميم لوحة الأسئلة) */}
      <div className="relative z-5 flex-1 flex items-center justify-center p-4">
        <div
          className="transition-all duration-300"
          style={{
            transform: isSelected ? 'scale(1.06)' : 'scale(1)',
          }}
        >
          <AppIcon icon={IconComponent} size={28} className="rounded-2xl" accent="cyan" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-4 bg-black/40 backdrop-blur-sm border-t"
           style={{ borderColor: `${neonColor}30` }}>
        
        {/* Title */}
        <h3 className="font-bold text-base mb-1 line-clamp-2" style={{ color: neonColor }}>
          {categoryName}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1" style={{ color: neonColor }}>
            <TrendingUp size={12} />
            <span>📝 {questionCount} أسئلة</span>
          </div>
          {difficultyLabel ? (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${difficultyColor}20`,
                color: difficultyColor,
              }}
            >
              {difficultyLabel}
            </span>
          ) : null}
        </div>

        {/* Description if provided */}
        {categoryDescription && (
          <p className="text-xs mt-2 opacity-70 line-clamp-2 hidden group-hover:block">
            {categoryDescription}
          </p>
        )}
      </div>

      {/* Neon Border Animation on Hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          border: `2px dashed ${neonColor}`,
          animation: 'dashBorder 20s linear infinite',
        }}
      />
    </div>
  )
}

/**
 * Modern Category Grid with Search and Filters
 */
export const ModernCategoryGrid: React.FC<ModernCategoryGridProps> = ({
  categories,
  onSelectCategory,
  selectedCategories = [],
  multiSelect = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [sortBy, setSortBy] = useState<'difficulty' | 'popularity' | 'newest'>('popularity')

  const groupLabelMap = useMemo(() => {
    return Object.fromEntries(categoryGroups.map(g => [g.id, g.name]))
  }, [])

  // Get unique groups
  const groups = useMemo(() => {
    const unique = new Set(categories.map(c => c.group || 'other'))
    return Array.from(unique)
  }, [categories])

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let filtered = categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           cat.id.includes(searchQuery.toLowerCase())
      const matchesGroup = selectedGroup === 'all' || cat.group === selectedGroup
      return matchesSearch && matchesGroup
    })

    // Sort
    if (sortBy === 'difficulty') {
      const diffOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 }
      filtered.sort((a, b) => {
        const aKey = typeof a.difficulty === 'string' ? a.difficulty : 'beginner'
        const bKey = typeof b.difficulty === 'string' ? b.difficulty : 'beginner'
        return (diffOrder[aKey] || 0) - (diffOrder[bKey] || 0)
      })
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b.stats?.totalAttempts || 0) - (a.stats?.totalAttempts || 0))
    }

    return filtered
  }, [categories, searchQuery, selectedGroup, sortBy])

  const handleSelectCategory = (categoryId: string) => {
    // Parent controls add/remove; clicking again should toggle off.
    onSelectCategory(categoryId)
  }

  return (
    <div className="w-full">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Sparkles size={32} />
              اختر التصنيفات
            </h2>
            <p className="text-cyan-400/70">
              {filteredCategories.length} تصنيف متاح • {selectedCategories.length} مختارة
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/40" size={18} />
          <input
            type="text"
            placeholder="ابحث عن تصنيف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              w-full pl-11 pr-4 py-2.5 rounded-lg
              bg-black/20 border border-cyan-400/20
              text-cyan-200 placeholder-cyan-400/40 text-sm
              transition-all duration-300
              focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20
            `}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Group Filter */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                selectedGroup === 'all'
                  ? 'bg-cyan-400/30 text-cyan-300 border border-cyan-400/60'
                  : 'bg-black/20 text-cyan-400/60 border border-cyan-400/20 hover:bg-black/30'
              }`}
            >
              الكل
            </button>
            {groups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  selectedGroup === group
                    ? 'bg-purple-400/30 text-purple-300 border border-purple-400/60'
                    : 'bg-black/20 text-purple-400/60 border border-purple-400/20 hover:bg-black/30'
                }`}
              >
                {groupLabelMap[group] ?? group}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`
              ml-auto px-3 py-1.5 rounded text-xs font-medium
              bg-black/20 border border-cyan-400/20
              text-cyan-400/80
              transition-all duration-200
              focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20
            `}
          >
            <option value="popularity">الأكثر شعبية</option>
            <option value="difficulty">حسب الصعوبة</option>
            <option value="newest">الأحدث</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredCategories.map(category => {
          // توحيد شكل/ألوان كل التصنيفات (بدون اختلاف حسب المجموعة)
          const colorScheme = CATEGORY_COLORS['science']
          const isSelected = selectedCategories.includes(category.id)

          return (
            <ModernCategoryCard
              key={category.id}
              categoryId={category.id}
              categoryName={category.name}
              categoryDescription={category.description}
              difficulty={category.difficulty || 'beginner'}
              questionCount={typeof category.questionCount === "number" ? category.questionCount : 0}
              isSelected={isSelected}
              onClick={() => handleSelectCategory(category.id)}
              neonColor={colorScheme.primary}
            />
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16">
          <div className="mb-4">
            <Search size={48} className="mx-auto text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-cyan-300 mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-cyan-400/70">جرب البحث عن كلمة أخرى أو اختر مجموعة مختلفة</p>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes dashBorder {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20px; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0, 217, 255, 0.3); }
          50% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.6); }
        }

        .group:hover {
          animation: glow 1.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default ModernCategoryGrid
