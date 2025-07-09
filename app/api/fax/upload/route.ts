import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { sql } from '@vercel/postgres'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  if (file.type !== 'image/tiff' && file.type !== 'image/tif') {
    return NextResponse.json({ error: 'Only TIFF files are accepted' }, { status: 400 })
  }

  // Upload to Vercel Blob Storage
  const arrayBuffer = await file.arrayBuffer()
  const blob = await put(file.name, new Uint8Array(arrayBuffer), {
    access: 'public',
    contentType: file.type,
  })

  // Insert into Postgres fax_queue
  const result = await sql`
    INSERT INTO fax_queue (filename, file_url)
    VALUES (${file.name}, ${blob.url})
    RETURNING id, filename, uploaded_at, file_url
  `
  const newEntry = result.rows[0]

  // Get the current queue (ordered by upload time desc)
  const queueResult = await sql`
    SELECT id, filename, uploaded_at, file_url FROM fax_queue ORDER BY uploaded_at DESC
  `

  return NextResponse.json({ success: true, entry: newEntry, queue: queueResult.rows })
} 