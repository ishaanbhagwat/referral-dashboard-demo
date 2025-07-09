import { NextResponse } from 'next/server'
import { referrals } from '../fax/store'

export async function GET() {
  return NextResponse.json({ referrals })
} 