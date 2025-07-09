import { NextRequest, NextResponse } from 'next/server'
import { faxQueue } from '../store'

export async function GET() {
  return NextResponse.json({ queue: faxQueue })
} 