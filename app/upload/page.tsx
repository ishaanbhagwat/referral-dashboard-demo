"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type ProcessedReferral = {
  id: string;
  patientName: string;
  currentStatus: string;
  urgency: string;
  specialty: string;
  documents: unknown[];
  [key: string]: unknown;
};

// Mock data for fax queue - matches the referral scenarios
const initialMockQueue = [
  {
    id: "FAX-001",
    filename: "cardiology_referral.tiff",
    uploaded_at: "2025-01-15T10:30:00Z",
    file_url: "https://example.com/fax-001.tiff",
    patientName: "Maria Rodriguez",
    specialty: "Cardiology"
  },
  {
    id: "FAX-002", 
    filename: "neurology_urgent.tiff",
    uploaded_at: "2025-01-15T11:15:00Z",
    file_url: "https://example.com/fax-002.tiff",
    patientName: "James Wilson",
    specialty: "Neurology"
  },
  {
    id: "FAX-003",
    filename: "dermatology_referral.tiff",
    uploaded_at: "2025-01-15T12:00:00Z",
    file_url: "https://example.com/fax-003.tiff",
    patientName: "Sarah Chen",
    specialty: "Dermatology"
  },
  {
    id: "FAX-004",
    filename: "orthopedics_referral.tiff",
    uploaded_at: "2025-01-15T13:30:00Z",
    file_url: "https://example.com/fax-004.tiff",
    patientName: "Robert Martinez",
    specialty: "Orthopedics"
  },
  {
    id: "FAX-005",
    filename: "gastroenterology_referral.tiff",
    uploaded_at: "2025-01-15T14:45:00Z",
    file_url: "https://example.com/fax-005.tiff",
    patientName: "Emily Davis",
    specialty: "Gastroenterology"
  },
  {
    id: "FAX-006",
    filename: "oncology_consult.tiff",
    uploaded_at: "2025-01-15T15:20:00Z",
    file_url: "https://example.com/fax-006.tiff",
    patientName: "David Thompson",
    specialty: "Oncology"
  }
]

// Helper functions for session storage
const getSessionData = (key: string, defaultValue: unknown): unknown => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = sessionStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

const setSessionData = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to session storage:', error)
  }
}

export default function FaxUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [queue, setQueue] = useState<typeof initialMockQueue>([])
  const [error, setError] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processMsg, setProcessMsg] = useState("")
  const [lastReferral, setLastReferral] = useState<{
    id: string;
    patientName: string;
    currentStatus: string;
    urgency: string;
  } | null>(null)
  const router = useRouter()

  // Load queue from session storage on component mount
  useEffect(() => {
    const savedQueue = getSessionData('faxQueue', initialMockQueue) as typeof initialMockQueue
    // Ensure we always have some data, even if session storage is empty
    if (savedQueue.length === 0) {
      setQueue(initialMockQueue)
      setSessionData('faxQueue', initialMockQueue)
    } else {
      setQueue(savedQueue)
    }
  }, [])

  // Save queue to session storage whenever it changes
  useEffect(() => {
    if (queue.length > 0) {
      setSessionData('faxQueue', queue)
    }
  }, [queue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!file) {
      setError("Please select a TIFF file.")
      return
    }
    if (!file.type.includes("tiff") && !file.type.includes("tif")) {
      setError("Only TIFF files are accepted.")
      return
    }
    setUploading(true)
    
    // Simulate upload delay
    setTimeout(() => {
      const newFax = {
        id: `FAX-${Date.now()}`,
        filename: file.name,
        uploaded_at: new Date().toISOString(),
        file_url: `https://example.com/${file.name}`,
        patientName: "New Patient",
        specialty: "General"
      }
      setQueue([newFax, ...queue])
      setFile(null)
      setUploading(false)
    }, 1000)
  }

  const handleProcess = async () => {
    setProcessing(true)
    setProcessMsg("")
    setLastReferral(null)
    
    // Simulate processing delay with OCR and referral creation
    setTimeout(() => {
      if (queue.length > 0) {
        const processedFax = queue[0]
        const newQueue = queue.slice(1) // Remove the first item
        
        // If queue becomes empty, reinitialize with mock data
        if (newQueue.length === 0) {
          setQueue(initialMockQueue)
          setSessionData('faxQueue', initialMockQueue)
        } else {
          setQueue(newQueue)
        }
        
        // Create realistic referral with full workflow simulation
        const mockReferral = createRealisticReferral(processedFax)
        
        // Save processed referral to session storage
        const existingReferrals = getSessionData('processedReferrals', []) as ProcessedReferral[]
        setSessionData('processedReferrals', [...existingReferrals, mockReferral]);
        
        setLastReferral(mockReferral)
        setProcessMsg(`Fax processed successfully! Referral created with status: ${mockReferral.currentStatus}`)
      }
      setProcessing(false)
    }, 2000)
  }

  // Function to create realistic referrals with different workflow scenarios
  const createRealisticReferral = (processedFax: typeof initialMockQueue[0]) => {
    // Get the next referral ID from session storage
    const getNextReferralId = () => {
      const existingReferrals = getSessionData('processedReferrals', []) as ProcessedReferral[]
      const staticReferrals = getSessionData('staticReferralCount', 4) as number
      const totalCount = existingReferrals.length + staticReferrals
      return `REF-2025-${String(totalCount + 1).padStart(3, '0')}`
    }

    const scenarios = [
      // Happy path - complete information, goes to scheduling
      {
        patientName: "Maria Rodriguez",
        specialty: "Cardiology",
        urgency: "Routine",
        currentStatus: "emr-sync",
        statusProgress: 75,
        hasMissingInfo: false,
        extractedInfo: {
          reason: "Chest pain evaluation, possible cardiac workup",
          symptoms: "Intermittent chest pain, shortness of breath on exertion",
          medications: "Lisinopril 10mg daily, Metformin 500mg twice daily",
          allergies: "NKDA",
          insurance: "Blue Cross Blue Shield PPO"
        },
        documents: [
          {
            id: processedFax.id,
            name: processedFax.filename,
            type: "referral",
            pages: 2,
            receivedAt: processedFax.uploaded_at,
            patientData: {
              name: "Maria Rodriguez",
              dob: "1985-03-15",
              mrn: "MR-2025-001"
            }
          }
        ]
      },
      // Happy path - urgent case, complete information
      {
        patientName: "James Wilson",
        specialty: "Neurology",
        urgency: "Urgent",
        currentStatus: "emr-sync",
        statusProgress: 75,
        hasMissingInfo: false,
        extractedInfo: {
          reason: "Severe headaches, neurological evaluation needed",
          symptoms: "Persistent headaches, vision changes, dizziness",
          medications: "Sumatriptan 50mg PRN",
          allergies: "Sulfa drugs",
          insurance: "Medicare"
        },
        documents: [
          {
            id: processedFax.id,
            name: processedFax.filename,
            type: "referral",
            pages: 1,
            receivedAt: processedFax.uploaded_at,
            patientData: {
              name: "James Wilson",
              dob: "1972-08-22",
              mrn: "JW-2025-002"
            }
          }
        ]
      },
      // Problematic case - missing insurance information
      {
        patientName: "Sarah Chen",
        specialty: "Dermatology",
        urgency: "Routine",
        currentStatus: "contact-pcp",
        statusProgress: 35,
        hasMissingInfo: true,
        extractedInfo: {
          reason: "Suspicious mole evaluation",
          symptoms: "Irregular mole on left forearm, no pain",
          medications: "None",
          allergies: "Latex",
          insurance: "Missing - PCP contacted"
        },
        documents: [
          {
            id: processedFax.id,
            name: processedFax.filename,
            type: "referral",
            pages: 1,
            receivedAt: processedFax.uploaded_at,
            patientData: {
              name: "Sarah Chen",
              dob: "1990-11-08",
              mrn: "SC-2025-003"
            }
          }
        ]
      },
      // Problematic case - missing medication information
      {
        patientName: "Robert Martinez",
        specialty: "Orthopedics",
        urgency: "Urgent",
        currentStatus: "contact-pcp",
        statusProgress: 45,
        hasMissingInfo: true,
        extractedInfo: {
          reason: "Knee pain, possible meniscus tear",
          symptoms: "Left knee pain, swelling, limited mobility",
          medications: "Incomplete - awaiting clarification",
          allergies: "Penicillin",
          insurance: "Aetna HMO"
        },
        documents: [
          {
            id: processedFax.id,
            name: processedFax.filename,
            type: "referral",
            pages: 2,
            receivedAt: processedFax.uploaded_at,
            patientData: {
              name: "Robert Martinez",
              dob: "1968-05-12",
              mrn: "RM-2025-004"
            }
          }
        ]
      },
      // Problematic case - incomplete symptoms
      {
        patientName: "Emily Davis",
        specialty: "Gastroenterology",
        urgency: "Routine",
        currentStatus: "contact-pcp",
        statusProgress: 30,
        hasMissingInfo: true,
        extractedInfo: {
          reason: "Abdominal pain evaluation",
          symptoms: "Incomplete - PCP contacted for details",
          medications: "Omeprazole 20mg daily",
          allergies: "NKDA",
          insurance: "Cigna PPO"
        },
        documents: [
          {
            id: processedFax.id,
            name: processedFax.filename,
            type: "referral",
            pages: 1,
            receivedAt: processedFax.uploaded_at,
            patientData: {
              name: "Emily Davis",
              dob: "1983-07-25",
              mrn: "ED-2025-005"
            }
          }
        ]
      },
      // Happy path - complete information, different specialty
      {
        patientName: "David Thompson",
        specialty: "Oncology",
        urgency: "Routine",
        currentStatus: "emr-sync",
        statusProgress: 75,
        hasMissingInfo: false,
        extractedInfo: {
          reason: "Follow-up consultation for breast cancer screening",
          symptoms: "No current symptoms, routine follow-up",
          medications: "Tamoxifen 20mg daily",
          allergies: "NKDA",
          insurance: "UnitedHealthcare"
        },
        documents: [
          {
            id: processedFax.id,
            name: processedFax.filename,
            type: "referral",
            pages: 3,
            receivedAt: processedFax.uploaded_at,
            patientData: {
              name: "David Thompson",
              dob: "1975-12-03",
              mrn: "DT-2025-006"
            }
          }
        ]
      }
    ]
    
    // Select a scenario based on the fax ID to ensure variety
    const scenarioIndex = (parseInt(processedFax.id.slice(-1)) - 1) % scenarios.length
    const scenario = scenarios[scenarioIndex]
    
    return {
      id: getNextReferralId(),
      patientName: scenario.patientName,
      patientId: scenario.extractedInfo?.insurance ? `PT-${Math.floor(Math.random() * 90000) + 10000}` : "PT-PENDING",
      referringProvider: "Dr. Fax Processing",
      referringPractice: "Fax System",
      specialty: scenario.specialty,
      urgency: scenario.urgency,
      receivedAt: new Date().toISOString(),
      currentStatus: scenario.currentStatus,
      statusProgress: scenario.statusProgress,
      hasMissingInfo: scenario.hasMissingInfo,
      documents: scenario.documents,
      extractedInfo: scenario.extractedInfo
    }
  }

  const handleReset = () => {
    setQueue(initialMockQueue)
    setSessionData('faxQueue', initialMockQueue)
    setSessionData('processedReferrals', [])
    setError("")
    setProcessMsg("")
    setLastReferral(null)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <div className="w-full flex justify-end max-w-md mx-auto mb-2 gap-2">
        <button
          onClick={() => router.push("/")}
          className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white"
        >
          Go to Dashboard
        </button>
        <button
          onClick={handleReset}
          disabled={false}
          className="text-xs px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 disabled:opacity-60"
        >
          Reset Simulation
        </button>
      </div>
      <div className="max-w-md w-full space-y-6 mt-10">
        <h1 className="text-2xl font-bold text-white mb-2">Simulate Fax Upload</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-4 rounded border border-white/10">
          <input
            type="file"
            accept=".tiff,.tif,image/tiff,image/tif"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-white file:bg-green-500 file:text-black file:rounded file:px-3 file:py-1 file:border-none file:mr-3"
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-green-500 text-black font-semibold py-2 rounded hover:bg-green-600 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload TIFF to Fax Queue"}
          </button>
        </form>
        <div className="bg-white/5 p-4 rounded border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Current Fax Queue</h2>
            <span className="text-white/40 text-xs">
              {queue.length} faxes
            </span>
          </div>
          {queue.length === 0 ? (
            <div className="text-white/60 text-sm">No faxes in queue.</div>
          ) : (
            <ul className="space-y-2">
              {queue.map(item => (
                <li key={item.id} className="flex justify-between items-center text-sm border-b border-white/10 pb-1">
                  <div>
                    <div className="font-medium">{item.filename}</div>
                    <div className="text-xs text-white/60">
                      {item.patientName} • {item.specialty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs">{new Date(item.uploaded_at).toLocaleString()}</div>
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 underline">View</a>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleProcess}
            disabled={processing || queue.length === 0}
            className="mt-4 w-full bg-green-500 text-black font-semibold py-2 rounded hover:bg-green-600 disabled:opacity-60"
          >
            {processing ? "Processing..." : "Process Next Fax"}
          </button>
          {processMsg && <div className="mt-2 text-green-400 text-sm">{processMsg}</div>}
          {lastReferral && (
            <div className="mt-4 p-2 bg-black/40 border border-white/10 rounded text-xs text-white">
              <div className="font-bold mb-1">New Referral Created:</div>
              <div>ID: {lastReferral.id}</div>
              <div>Patient: {lastReferral.patientName}</div>
              <div>Status: {lastReferral.currentStatus}</div>
              <div>Urgency: {lastReferral.urgency}</div>
              <div className="mt-2 text-green-400">Check the dashboard to see the new referral!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 