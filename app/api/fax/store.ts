export type FaxQueueItem = {
  id: string
  filename: string
  uploadedAt: string
}

// Shared in-memory fax queue
export const faxQueue: FaxQueueItem[] = []

export type Referral = {
  id: string
  patientName: string
  patientId: string
  referringProvider: string
  referringPractice: string
  specialty: string
  urgency: string
  receivedAt: string
  currentStatus: string
  statusProgress: number
  hasMissingInfo: boolean
  documents: Array<{
    id: string
    name: string
    type: string
    pages: number
    receivedAt: string
  }>
  extractedInfo: null | {
    reason: string
    symptoms: string
    medications: string
    allergies: string
    insurance: string
  }
}

// Shared in-memory referral store
export const referrals: Referral[] = []

export function clearAllData() {
  faxQueue.length = 0;
  referrals.length = 0;
} 