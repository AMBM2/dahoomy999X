import { NextResponse } from 'next/server'

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const DAHOOMY_SERVER_ID = 'd7oomy999' // This needs to be the actual Guild ID

export async function GET() {
  try {
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Discord bot token is not configured' },
        { status: 500 }
      )
    }

    // The server URL pattern for Discord API
    // This requires the actual Guild ID, not the vanity URL
    // For now, return a placeholder - you'll need to provide the actual Guild ID
    
    return NextResponse.json({
      memberCount: 1452, // Default value
      onlineCount: 1452,
      message: 'Please configure the actual Guild ID for real member count'
    })
  } catch (error) {
    console.error('Error fetching server stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch server stats', details: String(error) },
      { status: 500 }
    )
  }
}
