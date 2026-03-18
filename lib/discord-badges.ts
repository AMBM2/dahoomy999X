// Discord User Flags mapping
// https://discord.com/developers/docs/resources/user#user-object-user-flags

export enum DiscordUserFlags {
  STAFF = 1 << 0,
  PARTNER = 1 << 1,
  HYPESQUAD = 1 << 2,
  BUG_HUNTER_LEVEL_1 = 1 << 3,
  HYPESQUAD_ONLINE_HOUSE_1 = 1 << 6,
  HYPESQUAD_ONLINE_HOUSE_2 = 1 << 7,
  HYPESQUAD_ONLINE_HOUSE_3 = 1 << 8,
  BUG_HUNTER_LEVEL_2 = 1 << 14,
  VERIFIED_BOT = 1 << 16,
  VERIFIED_DEVELOPER = 1 << 17,
  CERTIFIED_MODERATOR = 1 << 18,
  BOT_HTTP_INTERACTIONS = 1 << 19,
  ACTIVE_DEVELOPER = 1 << 22,
}

export interface DiscordBadge {
  id: string
  name: string
  icon: string
  description: string
}

export function getDiscordBadges(flags: number | null | undefined): DiscordBadge[] {
  if (!flags) return []

  const badges: DiscordBadge[] = []

  const badgeMap: [DiscordUserFlags, DiscordBadge][] = [
    [DiscordUserFlags.STAFF, { id: "staff", name: "Discord Staff", icon: "👨‍💼", description: "Discord Staff Member" }],
    [DiscordUserFlags.PARTNER, { id: "partner", name: "Partner", icon: "🤝", description: "Discord Partner" }],
    [DiscordUserFlags.HYPESQUAD, { id: "hypesquad", name: "HypeSquad", icon: "🎮", description: "HypeSquad Member" }],
    [DiscordUserFlags.BUG_HUNTER_LEVEL_1, { id: "bug_hunter_1", name: "Bug Hunter", icon: "🐛", description: "Bug Hunter Level 1" }],
    [DiscordUserFlags.BUG_HUNTER_LEVEL_2, { id: "bug_hunter_2", name: "Elite Bug Hunter", icon: "🦗", description: "Bug Hunter Level 2" }],
    [DiscordUserFlags.VERIFIED_DEVELOPER, { id: "verified_dev", name: "Verified Developer", icon: "✅", description: "Verified Bot Developer" }],
    [DiscordUserFlags.CERTIFIED_MODERATOR, { id: "certified_mod", name: "Certified Moderator", icon: "🛡️", description: "Certified Moderator" }],
    [DiscordUserFlags.ACTIVE_DEVELOPER, { id: "active_dev", name: "Active Developer", icon: "👨‍💻", description: "Active Developer" }],
    [DiscordUserFlags.HYPESQUAD_ONLINE_HOUSE_1, { id: "hypesquad_1", name: "House 1", icon: "🏠️", description: "HypeSquad Online House 1" }],
    [DiscordUserFlags.HYPESQUAD_ONLINE_HOUSE_2, { id: "hypesquad_2", name: "House 2", icon: "🏘️", description: "HypeSquad Online House 2" }],
    [DiscordUserFlags.HYPESQUAD_ONLINE_HOUSE_3, { id: "hypesquad_3", name: "House 3", icon: "🏗️", description: "HypeSquad Online House 3" }],
  ]

  for (const [flagValue, badge] of badgeMap) {
    if ((flags & flagValue) === flagValue) {
      badges.push(badge)
    }
  }

  return badges
}

export function hasNitro(premiumType: number | null | undefined): boolean {
  // 0 = None, 1 = Nitro Classic, 2 = Nitro
  return premiumType === 1 || premiumType === 2
}
