import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import Tesseract from 'tesseract.js'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Helper: Download a file from a URL and return a Buffer
async function downloadFile(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to download file from blob storage')
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Helper: Run OCR on a TIFF buffer
async function runOcrOnTiff(buffer: Buffer): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng')
  return text
}

// Helper: Call OpenAI to extract referral info
async function extractReferralInfoWithLLM(ocrText: string): Promise<any> {
  const prompt = `Extract the following fields from the provided medical referral text. Output ONLY a valid JSON object, no prose or explanation. If a field is missing or cannot be determined, set its value to null. Do not hallucinate or guess. Use these keys: patientName, referringProvider, referringPractice, specialty, urgency, reason, symptoms, medications, allergies, insurance.\n\nReferral Text:\n${ocrText}`
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a medical referral information extraction assistant. Only output valid JSON, never prose.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 512,
  })
  // Parse the JSON from the LLM response, with error handling
  const content = completion.choices[0].message.content
  try {
    return JSON.parse(content || '{}')
  } catch (e) {
    // If parsing fails, return all fields as null
    return {
      patientName: null,
      referringProvider: null,
      referringPractice: null,
      specialty: null,
      urgency: null,
      reason: null,
      symptoms: null,
      medications: null,
      allergies: null,
      insurance: null,
    }
  }
}

export async function POST(req: NextRequest) {
  // Fetch the oldest fax in the queue
  const { rows: queueRows } = await sql`
    SELECT * FROM fax_queue ORDER BY uploaded_at ASC LIMIT 1
  `
  if (queueRows.length === 0) {
    return NextResponse.json({ error: 'No faxes in queue.' }, { status: 400 })
  }
  const fax = queueRows[0]

  // Download the TIFF from Blob Storage
  let ocrText = '[Simulated OCR text from TIFF]'
  try {
    const tiffBuffer = await downloadFile(fax.file_url)
    ocrText = await runOcrOnTiff(tiffBuffer)
  } catch (e) {
    // If OCR fails, continue with simulated text
  }

  // Extract info with LLM
  const extracted = await extractReferralInfoWithLLM(ocrText)

  // Build referral object
  const referral = {
    patient_name: extracted.patientName || null,
    patient_id: null, // To be set later
    referring_provider: extracted.referringProvider || null,
    referring_practice: extracted.referringPractice || null,
    specialty: extracted.specialty || null,
    urgency: extracted.urgency || null,
    received_at: fax.uploaded_at,
    current_status: 'ocr-processing',
    status_progress: 25,
    has_missing_info: Object.values(extracted).some(v => v === null),
    documents: JSON.stringify([
      {
        id: fax.id,
        name: fax.filename,
        type: 'referral',
        pages: 1,
        receivedAt: fax.uploaded_at,
        fileUrl: fax.file_url,
      },
    ]),
    extracted_info: JSON.stringify({
      reason: extracted.reason || null,
      symptoms: extracted.symptoms || null,
      medications: extracted.medications || null,
      allergies: extracted.allergies || null,
      insurance: extracted.insurance || null,
    }),
  }

  // Insert into referrals table
  const insertResult = await sql`
    INSERT INTO referrals (
      patient_name, patient_id, referring_provider, referring_practice, specialty, urgency, received_at, current_status, status_progress, has_missing_info, documents, extracted_info
    ) VALUES (
      ${referral.patient_name}, ${referral.patient_id}, ${referral.referring_provider}, ${referral.referring_practice}, ${referral.specialty}, ${referral.urgency}, ${referral.received_at}, ${referral.current_status}, ${referral.status_progress}, ${referral.has_missing_info}, ${referral.documents}, ${referral.extracted_info}
    ) RETURNING *
  `
  const newReferral = insertResult.rows[0]

  // Remove the processed fax from the queue
  await sql`DELETE FROM fax_queue WHERE id = ${fax.id}`

  // Get the updated queue
  const { rows: updatedQueue } = await sql`
    SELECT id, filename, uploaded_at, file_url FROM fax_queue ORDER BY uploaded_at DESC
  `

  return NextResponse.json({ success: true, referral: newReferral, queue: updatedQueue })
} 