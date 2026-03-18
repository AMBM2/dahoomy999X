// =====================================================
// Modern Infographic Icon System (2026)
// =====================================================

"use client"

import React from 'react'

/**
 * Generate a modern SVG icon with gradient and 3D effects
 * Suitable for infographic-style quiz categories
 */

interface IconProps {
  size?: number
  color?: string
  className?: string
}

// Science & Nature Icons
export const ScienceIcon: React.FC<IconProps> = ({ size = 48, color = '#00D9FF' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scienceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#0080FF" stopOpacity="1" />
      </linearGradient>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="3" dy="3" stdDeviation="4" floodOpacity="0.3" />
      </filter>
    </defs>
    
    {/* Beaker */}
    <path d="M 60 80 L 65 140 Q 65 155 75 155 L 125 155 Q 135 155 135 140 L 140 80 Z" 
          fill="url(#scienceGrad)" filter="url(#shadow)" strokeWidth="3" stroke="#00D9FF" />
    
    {/* Liquid */}
    <path d="M 70 120 Q 70 125 75 125 L 125 125 Q 130 125 130 120 L 130 140 Q 130 150 125 150 L 75 150 Q 70 150 70 140 Z" 
          fill="#00D9FF" opacity="0.3" />
    
    {/* Molecular structure */}
    <circle cx="60" cy="60" r="8" fill={color} filter="url(#shadow)" />
    <circle cx="100" cy="45" r="8" fill={color} filter="url(#shadow)" />
    <circle cx="140" cy="60" r="8" fill={color} filter="url(#shadow)" />
    <line x1="66" y1="56" x2="94" y2="48" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="100" y1="53" x2="134" y2="64" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="140" y1="60" x2="100" y2="100" stroke={color} strokeWidth="2" opacity="0.6" />
  </svg>
)

export const MathIcon: React.FC<IconProps> = ({ size = 48, color = '#9D00FF' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#FF00FF" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Grid background */}
    <rect x="40" y="40" width="120" height="120" fill="none" stroke={color} strokeWidth="2" opacity="0.2" />
    <line x1="100" y1="40" x2="100" y2="160" stroke={color} strokeWidth="1" opacity="0.3" />
    <line x1="40" y1="100" x2="160" y2="100" stroke={color} strokeWidth="1" opacity="0.3" />
    
    {/* π symbol */}
    <text x="100" y="110" fontSize="60" fontWeight="bold" fill="url(#mathGrad)" 
          textAnchor="middle" fontFamily="Georgia, serif">π</text>
  </svg>
)

export const GeographyIcon: React.FC<IconProps> = ({ size = 48, color = '#00FF00' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="globeGrad" cx="40%" cy="40%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.8" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Globe */}
    <circle cx="100" cy="100" r="60" fill="url(#globeGrad)" filter="url(#glow)" stroke={color} strokeWidth="2" />
    
    {/* Continents representation */}
    <circle cx="85" cy="85" r="12" fill={color} opacity="0.4" />
    <circle cx="115" cy="95" r="10" fill={color} opacity="0.4" />
    <ellipse cx="100" cy="125" rx="15" ry="8" fill={color} opacity="0.3" />
    
    {/* Longitude/Latitude lines */}
    <circle cx="100" cy="100" r="60" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
    <ellipse cx="100" cy="100" rx="60" ry="30" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
  </svg>
)

export const SportsIcon: React.FC<IconProps> = ({ size = 48, color = '#FF00FF' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sportsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#FF0080" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Trophy */}
    <path d="M 70 150 L 70 170 L 130 170 L 130 150" fill={color} opacity="0.2" stroke={color} strokeWidth="2" />
    <ellipse cx="100" cy="150" rx="30" ry="8" fill={color} opacity="0.3" />
    <path d="M 70 100 Q 70 80 80 70 L 120 70 Q 130 80 130 100" fill={color} opacity="0.4" stroke={color} strokeWidth="2" />
    <path d="M 65 100 L 55 90 L 55 110 Z" fill={color} opacity="0.3" />
    <path d="M 135 100 L 145 90 L 145 110 Z" fill={color} opacity="0.3" />
    <circle cx="100" cy="75" r="8" fill={color} />
  </svg>
)

export const TechIcon: React.FC<IconProps> = ({ size = 48, color = '#00D9FF' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#9D00FF" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Monitor */}
    <rect x="50" y="40" width="100" height="70" rx="5" fill="none" stroke={color} strokeWidth="3" />
    <rect x="55" y="45" width="90" height="60" fill={color} opacity="0.1" />
    
    {/* Screen content - circuit pattern */}
    <line x1="70" y1="60" x2="130" y2="60" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="70" y1="75" x2="130" y2="75" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="70" y1="90" x2="130" y2="90" stroke={color} strokeWidth="2" opacity="0.6" />
    
    {/* Stand */}
    <path d="M 85 110 L 82 130 L 118 130 L 115 110" fill={color} opacity="0.3" stroke={color} strokeWidth="2" />
    
    {/* Power indicator */}
    <circle cx="155" cy="100" r="6" fill={color} opacity="0.6" />
  </svg>
)

export const HistoryIcon: React.FC<IconProps> = ({ size = 48, color = '#FF8C00' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="historyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#FFFF00" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Book */}
    <path d="M 60 60 L 60 140 Q 60 150 70 150 L 130 150 Q 140 150 140 140 L 140 60 Q 140 50 130 50 L 70 50 Q 60 50 60 60 Z" 
          fill="url(#historyGrad)" opacity="0.3" stroke={color} strokeWidth="2" />
    
    {/* Spine */}
    <line x1="65" y1="55" x2="65" y2="145" stroke={color} strokeWidth="2" opacity="0.6" />
    
    {/* Pages */}
    <line x1="70" y1="70" x2="130" y2="70" stroke={color} strokeWidth="1" opacity="0.4" />
    <line x1="70" y1="85" x2="130" y2="85" stroke={color} strokeWidth="1" opacity="0.4" />
    <line x1="70" y1="100" x2="130" y2="100" stroke={color} strokeWidth="1" opacity="0.4" />
    <line x1="70" y1="115" x2="110" y2="115" stroke={color} strokeWidth="1" opacity="0.4" />
    
    {/* Clock icon overlay */}
    <circle cx="120" cy="130" r="12" fill={color} opacity="0.5" stroke={color} strokeWidth="1" />
    <line x1="120" y1="123" x2="120" y2="130" stroke="white" strokeWidth="1.5" />
    <line x1="120" y1="130" x2="125" y2="130" stroke="white" strokeWidth="1.5" />
  </svg>
)

export const ArtIcon: React.FC<IconProps> = ({ size = 48, color = '#FF00FF' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="artGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#FF0080" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Palette */}
    <ellipse cx="100" cy="100" rx="50" ry="45" fill="none" stroke={color} strokeWidth="3" />
    <circle cx="100" cy="100" r="8" fill={color} opacity="0.3" />
    
    {/* Paint dots */}
    <circle cx="80" cy="75" r="8" fill="#FF0000" opacity="0.8" />
    <circle cx="120" cy="75" r="8" fill="#00FF00" opacity="0.8" />
    <circle cx="75" cy="110" r="8" fill="#0080FF" opacity="0.8" />
    <circle cx="125" cy="110" r="8" fill="#FF00FF" opacity="0.8" />
    <circle cx="100" cy="135" r="8" fill="#FFFF00" opacity="0.8" />
    
    {/* Brush */}
    <rect x="145" y="55" width="15" height="40" fill={color} opacity="0.3" stroke={color} strokeWidth="1" rx="3" />
    <path d="M 145 95 L 150 110 L 160 110 L 155 95 Z" fill={color} opacity="0.4" stroke={color} strokeWidth="1" />
  </svg>
)

export const LanguageIcon: React.FC<IconProps> = ({ size = 48, color = '#00FF00' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="langGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#00D9FF" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Book with text */}
    <path d="M 50 60 L 150 60 L 150 140 L 50 140 Z" fill="none" stroke={color} strokeWidth="2" />
    
    {/* Text lines */}
    <line x1="65" y1="75" x2="135" y2="75" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="65" y1="90" x2="135" y2="90" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="65" y1="105" x2="120" y2="105" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="65" y1="120" x2="130" y2="120" stroke={color} strokeWidth="2" opacity="0.6" />
    
    {/* Speech bubble */}
    <ellipse cx="100" cy="160" rx="25" ry="15" fill={color} opacity="0.2" stroke={color} strokeWidth="1" />
    <path d="M 90 155 L 85 170 L 95 160 Z" fill={color} opacity="0.2" />
  </svg>
)

export const PhysicsIcon: React.FC<IconProps> = ({ size = 48, color = '#0080FF' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="physicsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#00D9FF" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Atom orbits */}
    <circle cx="100" cy="100" r="60" fill="none" stroke={color} strokeWidth="2" opacity="0.4" />
    <circle cx="100" cy="100" r="45" fill="none" stroke={color} strokeWidth="2" opacity="0.3" transform="rotate(45 100 100)" />
    <circle cx="100" cy="100" r="30" fill="none" stroke={color} strokeWidth="2" opacity="0.2" transform="rotate(-30 100 100)" />
    
    {/* Nucleus */}
    <circle cx="100" cy="100" r="12" fill="url(#physicsGrad)" />
    
    {/* Electrons */}
    <circle cx="100" cy="40" r="8" fill={color} opacity="0.8" />
    <circle cx="156" cy="110" r="8" fill={color} opacity="0.8" />
    <circle cx="80" cy="150" r="8" fill={color} opacity="0.8" />
  </svg>
)

export const ChemistryIcon: React.FC<IconProps> = ({ size = 48, color = '#FF0080' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#FF00FF" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Test tubes */}
    <path d="M 60 100 L 65 160 Q 65 170 75 170 L 85 170 Q 95 170 95 160 L 95 100" 
          fill="none" stroke={color} strokeWidth="3" />
    <path d="M 105 100 L 110 160 Q 110 170 120 170 L 130 170 Q 140 170 140 160 L 140 100" 
          fill="none" stroke={color} strokeWidth="3" />
    
    {/* Liquids */}
    <path d="M 70 130 Q 70 140 75 142 L 85 142 Q 95 140 95 130" 
          fill={color} opacity="0.4" />
    <path d="M 115 110 Q 115 125 120 128 L 130 128 Q 140 125 140 110" 
          fill={color} opacity="0.3" />
    
    {/* Flask top */}
    <ellipse cx="77.5" cy="100" rx="17.5" ry="12" fill={color} opacity="0.2" stroke={color} strokeWidth="1" />
    <ellipse cx="122.5" cy="100" rx="17.5" ry="12" fill={color} opacity="0.2" stroke={color} strokeWidth="1" />
    
    {/* Cork/stoppers */}
    <rect x="75" y="95" width="5" height="8" fill={color} opacity="0.6" />
    <rect x="120" y="95" width="5" height="8" fill={color} opacity="0.6" />
  </svg>
)

export const BiologyIcon: React.FC<IconProps> = ({ size = 48, color = '#00FF00' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#00D9FF" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Cell membrane */}
    <circle cx="100" cy="100" r="55" fill="none" stroke={color} strokeWidth="3" />
    
    {/* Nucleus */}
    <circle cx="100" cy="100" r="28" fill={color} opacity="0.2" stroke={color} strokeWidth="2" />
    <circle cx="100" cy="100" r="15" fill={color} opacity="0.4" />
    
    {/* Organelles */}
    <ellipse cx="70" cy="75" rx="10" ry="8" fill={color} opacity="0.3" stroke={color} strokeWidth="1" />
    <ellipse cx="130" cy="80" rx="10" ry="8" fill={color} opacity="0.3" stroke={color} strokeWidth="1" />
    <ellipse cx="75" cy="130" rx="10" ry="8" fill={color} opacity="0.3" stroke={color} strokeWidth="1" />
    <ellipse cx="125" cy="125" rx="10" ry="8" fill={color} opacity="0.3" stroke={color} strokeWidth="1" />
  </svg>
)

export const AstronomyIcon: React.FC<IconProps> = ({ size = 48, color = '#FFFF00' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="starGrad" cx="50%" cy="50%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.8" />
      </radialGradient>
    </defs>
    
    {/* Sun */}
    <circle cx="100" cy="60" r="20" fill="url(#starGrad)" />
    <circle cx="100" cy="60" r="22" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
    
    {/* Planets orbits */}
    <circle cx="100" cy="100" r="35" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
    <circle cx="100" cy="100" r="50" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
    
    {/* Planets */}
    <circle cx="130" cy="75" r="8" fill={color} opacity="0.7" />
    <circle cx="65" cy="135" r="12" fill={color} opacity="0.5" />
    <circle cx="130" cy="140" r="6" fill={color} opacity="0.6" />
    
    {/* Stars */}
    <circle cx="50" cy="50" r="2" fill={color} opacity="0.6" />
    <circle cx="150" cy="40" r="2" fill={color} opacity="0.6" />
    <circle cx="40" cy="160" r="2" fill={color} opacity="0.6" />
  </svg>
)

export const GeologyIcon: React.FC<IconProps> = ({ size = 48, color = '#8B4513' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF8C00" stopOpacity="1" />
        <stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Mountain */}
    <path d="M 40 120 L 80 50 L 120 90 L 160 40 L 160 160 L 40 160 Z" 
          fill="url(#geoGrad)" opacity="0.4" stroke="#FF8C00" strokeWidth="2" />
    
    {/* Rock layers */}
    <line x1="40" y1="140" x2="160" y2="140" stroke="#FF8C00" strokeWidth="2" opacity="0.6" />
    <line x1="40" y1="130" x2="160" y2="130" stroke="#FF8C00" strokeWidth="1" opacity="0.3" />
    <line x1="40" y1="150" x2="160" y2="150" stroke="#FF8C00" strokeWidth="1" opacity="0.3" />
    
    {/* Crystal/gem */}
    <path d="M 100 80 L 110 95 L 95 95 Z" fill="#FF8C00" opacity="0.8" />
  </svg>
)

export const MedicineIcon: React.FC<IconProps> = ({ size = 48, color = '#FF0000' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#FF6B6B" stopOpacity="1" />
      </linearGradient>
    </defs>
    
    {/* Medical cross */}
    <rect x="80" y="50" width="40" height="100" fill="url(#medGrad)" opacity="0.4" stroke={color} strokeWidth="2" />
    <rect x="50" y="80" width="100" height="40" fill="url(#medGrad)" opacity="0.4" stroke={color} strokeWidth="2" />
    
    {/* Capsule pill */}
    <ellipse cx="75" cy="160" rx="8" ry="12" fill="#FF0000" opacity="0.6" />
    <ellipse cx="125" cy="160" rx="8" ry="12" fill="#FFFFFF" opacity="0.6" />
    <line x1="83" y1="160" x2="117" y2="160" stroke={color} strokeWidth="1" opacity="0.5" />
    
    {/* Heartbeat line */}
    <polyline points="45,110 55,110 60,95 70,115 75,105 85,110" 
              fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
  </svg>
)

/**
 * Complete category icon mapping
 */
export const INFOGRAPHIC_ICONS: Record<string, React.FC<IconProps>> = {
  // Science & Education
  'science': ScienceIcon,
  'math': MathIcon,
  'physics': PhysicsIcon,
  'chemistry': ChemistryIcon,
  'biology': BiologyIcon,
  'astronomy': AstronomyIcon,
  'geology': GeologyIcon,
  'medicine': MedicineIcon,
  'anatomy': BiologyIcon,
  'psychology': ScienceIcon,
  
  // Geography
  'geography': GeographyIcon,
  'maps': GeographyIcon,
  'capitals': GeographyIcon,
  'flags': GeographyIcon,
  'countries': GeographyIcon,
  'rivers': GeologyIcon,
  'mountains': GeologyIcon,
  
  // Sports & Entertainment
  'sports': SportsIcon,
  'football': SportsIcon,
  'basketball': SportsIcon,
  'tennis': SportsIcon,
  'entertainment': ArtIcon,
  'celebrities': ArtIcon,
  
  // Technology
  'tech': TechIcon,
  'technology': TechIcon,
  'computers': TechIcon,
  'programming': TechIcon,
  
  // History & Culture
  'history': HistoryIcon,
  'ancient-history': HistoryIcon,
  'modern-history': HistoryIcon,
  'wars': HistoryIcon,
  'civilizations': HistoryIcon,
  
  // Art & Culture
  'art': ArtIcon,
  'music': ArtIcon,
  'theater': ArtIcon,
  
  // Language
  'language': LanguageIcon,
  'arabic': LanguageIcon,
  'english': LanguageIcon,
  'literature': LanguageIcon,
  
  // Religion & Philosophy
  'religion': HistoryIcon,
  
  // Food & Lifestyle
  'food': ArtIcon,
  
  // Puzzles & Games
  'puzzles': MathIcon,
  'custom': ScienceIcon,
  
  // Arabic Categories
  'arab': LanguageIcon,
}

/**
 * Get icon component by category ID
 */
export const getIconComponent = (categoryId: string): React.FC<IconProps> => {
  return INFOGRAPHIC_ICONS[categoryId] || ScienceIcon
}

/**
 * SVG export helper for backend use
 */
export const getSVGString = (categoryId: string, size: number = 48, color: string = '#00D9FF'): string => {
  const IconComponent = getIconComponent(categoryId)
  // Note: In server component context, render to string using renderToString
  return `<svg><!-- Icon for ${categoryId} --></svg>`
}

export default INFOGRAPHIC_ICONS
