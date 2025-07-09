import { NextResponse } from 'next/server'
import { clearAllData } from '../store'

export async function POST() {
  clearAllData()
  return NextResponse.json({ success: true, message: 'All in-memory data cleared.' })
} 