"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Modal state and form data
interface EditModalData {
  isOpen: boolean;
  referralId: string | null;
  patientName: string;
  patientId: string;
  specialty: string;
  urgency: string;
  reason: string;
  symptoms: string;
  medications: string;
  allergies: string;
  notes: string;
}
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Calendar,
  Eye,
  Download,
  User,
  Building2,
  Stethoscope,
  Filter,
  Circle,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for referrals
const staticMockReferrals = [
  {
    id: "REF-2025-001",
    patientName: "Sarah Johnson",
    patientId: "PT-12345",
    referringProvider: "Dr. Michael Chen",
    referringPractice: "Downtown Family Medicine",
    specialty: "Cardiology",
    urgency: "Routine",
    receivedAt: "2025-01-15T10:30:00Z",
    currentStatus: "emr-sync",
    statusProgress: 85,
    hasMissingInfo: false,
    documents: [
      { id: 1, name: "Initial Referral", type: "referral", pages: 2, receivedAt: "2025-01-15T10:30:00Z" },
      { id: 2, name: "Lab Results", type: "lab", pages: 1, receivedAt: "2025-01-15T11:15:00Z" },
      { id: 3, name: "EKG Report", type: "diagnostic", pages: 1, receivedAt: "2025-01-15T11:45:00Z" },
    ],
    extractedInfo: {
      reason: "Chest pain evaluation, possible cardiac workup",
      symptoms: "Intermittent chest pain, shortness of breath",
      medications: "Lisinopril 10mg, Metformin 500mg",
      allergies: "NKDA",
      insurance: "Blue Cross Blue Shield",
    },
  },
  {
    id: "REF-2025-002",
    patientName: "Robert Martinez",
    patientId: "PT-12346",
    referringProvider: "Dr. Lisa Wong",
    referringPractice: "Westside Medical Group",
    specialty: "Orthopedics",
    urgency: "Urgent",
    receivedAt: "2025-01-15T14:20:00Z",
    currentStatus: "awaiting-info",
    statusProgress: 35,
    hasMissingInfo: true,
    documents: [{ id: 4, name: "Referral Form", type: "referral", pages: 1, receivedAt: "2025-01-15T14:20:00Z" }],
    extractedInfo: {
      reason: "Knee pain, possible meniscus tear",
      symptoms: "Left knee pain, swelling, limited mobility",
      medications: "Incomplete - awaiting clarification",
      allergies: "Penicillin",
      insurance: "Missing - PCP contacted",
    },
  },
  {
    id: "REF-2025-003",
    patientName: "Emily Davis",
    patientId: "PT-12347",
    referringProvider: "Dr. James Wilson",
    referringPractice: "Northgate Clinic",
    specialty: "Dermatology",
    urgency: "Routine",
    receivedAt: "2025-01-15T16:45:00Z",
    currentStatus: "emr-sync",
    statusProgress: 25,
    hasMissingInfo: false,
    documents: [
      { id: 5, name: "Referral with Photos", type: "referral", pages: 3, receivedAt: "2025-01-15T16:45:00Z" },
    ],
    extractedInfo: null,
  },
  {
    id: "REF-2025-004",
    patientName: "Michael Thompson",
    patientId: "PT-12348",
    referringProvider: "Dr. Amanda Foster",
    referringPractice: "Central Health Clinic",
    specialty: "Neurology",
    urgency: "STAT",
    receivedAt: "2025-01-15T18:10:00Z",
    currentStatus: "ready-schedule",
    statusProgress: 100,
    hasMissingInfo: false,
    documents: [
      { id: 6, name: "Urgent Referral", type: "referral", pages: 1, receivedAt: "2025-01-15T18:10:00Z" },
      { id: 7, name: "MRI Results", type: "diagnostic", pages: 4, receivedAt: "2025-01-15T18:15:00Z" },
    ],
    extractedInfo: {
      reason: "Severe headaches, neurological evaluation needed",
      symptoms: "Persistent headaches, vision changes, dizziness",
      medications: "Sumatriptan 50mg PRN",
      allergies: "Sulfa drugs",
      insurance: "Medicare",
    },
  },
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

// Helper function to generate random doctor names and practices
const generateRandomProvider = () => {
  const doctors = [
    "Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Lisa Wong", "Dr. James Wilson",
    "Dr. Amanda Foster", "Dr. Robert Martinez", "Dr. Emily Davis", "Dr. David Thompson",
    "Dr. Jennifer Lee", "Dr. Christopher Brown", "Dr. Maria Garcia", "Dr. Kevin Smith",
    "Dr. Rachel Green", "Dr. Thomas Anderson", "Dr. Jessica Taylor", "Dr. Daniel White"
  ]
  
  const practices = [
    "Downtown Family Medicine", "Westside Medical Group", "Northgate Clinic", 
    "Central Health Clinic", "Riverside Medical Associates", "Sunset Family Practice",
    "Valley View Healthcare", "Metro Medical Center", "Community Health Partners",
    "Primary Care Associates", "Family Medicine Group", "Health First Clinic"
  ]
  
  return {
    provider: doctors[Math.floor(Math.random() * doctors.length)],
    practice: practices[Math.floor(Math.random() * practices.length)]
  }
}

// Type definitions
interface ReferralDocument {
  id: number | string;
  name: string;
  type: string;
  pages: number;
  receivedAt: string;
  patientData?: {
    name: string;
    dob: string;
    mrn: string;
  };
}

interface ExtractedInfo {
  reason: string;
  symptoms?: string;
  medications?: string;
  allergies?: string;
  insurance?: string;
}

interface Referral {
  id: string;
  patientName: string;
  patientId: string;
  referringProvider: string;
  referringPractice: string;
  specialty: string;
  urgency: string;
  receivedAt: string;
  currentStatus: string;
  statusProgress: number;
  hasMissingInfo: boolean;
  documents: ReferralDocument[];
  extractedInfo: ExtractedInfo | null;
  notes?: string;
}

export default function ReferralTriageSystem() {
  const [referrals, setReferrals] = useState<Referral[]>(staticMockReferrals)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedReferrals, setExpandedReferrals] = useState<string[]>([])
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [editModal, setEditModal] = useState<EditModalData>({
    isOpen: false,
    referralId: null,
    patientName: "",
    patientId: "",
    specialty: "",
    urgency: "",
    reason: "",
    symptoms: "",
    medications: "",
    allergies: "",
    notes: ""
  })
  const router = useRouter()

  // Load processed referrals from session storage and combine with static data
  useEffect(() => {
    try {
      const processedReferrals = getSessionData('processedReferrals', []) as Referral[]
      
          // Transform processed referrals to match the dashboard format
    const transformedReferrals: Referral[] = processedReferrals.map((processed: Referral) => {
      const randomProvider = generateRandomProvider()
      return {
        id: processed.id,
        patientName: processed.patientName,
        patientId: processed.patientId || `PT-${Math.floor(Math.random() * 90000) + 10000}`,
        referringProvider: processed.referringProvider || randomProvider.provider,
        referringPractice: processed.referringPractice || randomProvider.practice,
        specialty: processed.specialty || "General",
        urgency: processed.urgency || "Routine",
        receivedAt: processed.receivedAt || new Date().toISOString(),
        currentStatus: processed.currentStatus || "ocr-processing",
        statusProgress: processed.statusProgress || 25,
        hasMissingInfo: processed.hasMissingInfo || false,
        documents: processed.documents || [],
        extractedInfo: processed.extractedInfo || {
          reason: "Fax processing in progress",
          symptoms: "Awaiting OCR completion",
          medications: "To be extracted",
          allergies: "To be extracted", 
          insurance: "To be extracted",
        },
      }
    })

      // Combine static and processed referrals, with processed ones appearing first
      const allReferrals = [...transformedReferrals, ...staticMockReferrals]
      setReferrals(allReferrals)
    } catch (error) {
      // Fallback to static mock data if there's any error
      console.error('Error loading referrals:', error)
      setReferrals(staticMockReferrals)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleReferral = (id: string) => {
    setExpandedReferrals((prev) => (prev.includes(id) ? prev.filter((refId) => refId !== id) : [...prev, id]))
  }

  const handleScheduleAppointment = (referralId: string) => {
    alert(`Scheduling appointment for ${referralId}. Patient will receive appointment booking link.`)
  }

  const handleContactPCP = (referralId: string) => {
    setReferrals(prevReferrals => 
      prevReferrals.map(referral => {
        if (referral.id === referralId) {
          if (referral.currentStatus === "contact-pcp") {
            // Change from contact-pcp to awaiting-info
            alert(`Contacting PCP for additional information for ${referralId}. Status updated to awaiting information.`)
            return {
              ...referral,
              currentStatus: "awaiting-info",
              statusProgress: getStatusProgress("awaiting-info", referral.hasMissingInfo)
            }
          } else {
            // Follow up call for already contacted cases
            alert(`Following up with PCP for ${referralId}`)
            return referral
          }
        }
        return referral
      })
    )
  }

  const handleReviewClinicalNotes = (referralId: string) => {
    const referral = referrals.find(r => r.id === referralId)
    if (!referral) return

    setEditModal({
      isOpen: true,
      referralId,
      patientName: referral.patientName,
      patientId: referral.patientId,
      specialty: referral.specialty,
      urgency: referral.urgency,
      reason: referral.extractedInfo?.reason || "",
      symptoms: referral.extractedInfo?.symptoms || "",
      medications: referral.extractedInfo?.medications || "",
      allergies: referral.extractedInfo?.allergies || "",
      notes: referral.notes || ""
    })
  }

  const handleUpdatePatientInfo = (referralId: string) => {
    const referral = referrals.find(r => r.id === referralId)
    if (!referral) return

    setEditModal({
      isOpen: true,
      referralId,
      patientName: referral.patientName,
      patientId: referral.patientId,
      specialty: referral.specialty,
      urgency: referral.urgency,
      reason: referral.extractedInfo?.reason || "",
      symptoms: referral.extractedInfo?.symptoms || "",
      medications: referral.extractedInfo?.medications || "",
      allergies: referral.extractedInfo?.allergies || "",
      notes: referral.notes || ""
    })
  }

  const handleAddNotes = (referralId: string) => {
    const referral = referrals.find(r => r.id === referralId)
    if (!referral) return

    setEditModal({
      isOpen: true,
      referralId,
      patientName: referral.patientName,
      patientId: referral.patientId,
      specialty: referral.specialty,
      urgency: referral.urgency,
      reason: referral.extractedInfo?.reason || "",
      symptoms: referral.extractedInfo?.symptoms || "",
      medications: referral.extractedInfo?.medications || "",
      allergies: referral.extractedInfo?.allergies || "",
      notes: referral.notes || ""
    })
  }

  const handleSaveModal = () => {
    if (!editModal.referralId) return

    setReferrals(prevReferrals => 
      prevReferrals.map(r => {
        if (r.id === editModal.referralId) {
          return {
            ...r,
            patientName: editModal.patientName,
            patientId: editModal.patientId,
            specialty: editModal.specialty,
            urgency: editModal.urgency,
                         extractedInfo: r.extractedInfo ? {
               ...r.extractedInfo,
               reason: editModal.reason,
               symptoms: editModal.symptoms,
               medications: editModal.medications,
               allergies: editModal.allergies
             } : {
               reason: editModal.reason,
               symptoms: editModal.symptoms,
               medications: editModal.medications,
               allergies: editModal.allergies,
               insurance: ""
             },
            notes: editModal.notes
          }
        }
        return r
      })
    )

    setEditModal({
      isOpen: false,
      referralId: null,
      patientName: "",
      patientId: "",
      specialty: "",
      urgency: "",
      reason: "",
      symptoms: "",
      medications: "",
      allergies: "",
      notes: ""
    })
  }

  const handleCloseModal = () => {
    setEditModal({
      isOpen: false,
      referralId: null,
      patientName: "",
      patientId: "",
      specialty: "",
      urgency: "",
      reason: "",
      symptoms: "",
      medications: "",
      allergies: "",
      notes: ""
    })
  }

  const handleEMRSync = (referralId: string) => {
    const referral = referrals.find(r => r.id === referralId)
    if (!referral) return

    const providerSelect = document.getElementById(`emr-provider-${referralId}`) as HTMLSelectElement
    const selectedProvider = providerSelect?.value

    if (!selectedProvider) {
      alert("Please select an EHR provider first.")
      return
    }

    // Simulate EMR sync process
    const syncButton = providerSelect?.nextElementSibling?.querySelector('button') as HTMLButtonElement
    if (syncButton) {
      syncButton.disabled = true
      syncButton.innerHTML = '<Building2 className="h-3 w-3 mr-1" /> Syncing...'
    }

    // Mock sync delay
    setTimeout(() => {
      // Update referral status to ready-schedule
      setReferrals(prevReferrals => 
        prevReferrals.map(r => {
          if (r.id === referralId) {
            return {
              ...r,
              currentStatus: "ready-schedule",
              statusProgress: 100
            }
          }
          return r
        })
      )

      alert(`Successfully synced with ${selectedProvider} EHR for ${referral.patientName}`)
    }, 2000)
  }

  const handleReset = () => {
    setReferrals(staticMockReferrals)
    setSessionData('processedReferrals', [])
    setSessionData('faxQueue', []) // This will be reset to initial queue in upload page
  }

  // Filter and sort referrals
  const filteredReferrals = referrals
    .filter((referral: Referral) => urgencyFilter === "all" || referral.urgency === urgencyFilter)
    .sort((a: Referral, b: Referral) => {
      if (sortBy === "recent") {
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      } else if (sortBy === "urgency") {
        const urgencyOrder = { STAT: 3, Urgent: 2, Routine: 1 }
        return (
          urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder]
        )
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="w-full flex justify-end max-w-7xl mx-auto mb-2 gap-2">
        <button
          onClick={() => router.push("/upload")}
          className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white"
        >
          Go to Upload
        </button>
        <button
          onClick={handleReset}
          disabled={false} // No resetting in mock data
          className="text-xs px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 disabled:opacity-60"
        >
          Reset Demo
        </button>
        <button
          onClick={() => {}} // No manual refresh in mock data
          disabled={false}
          className="text-xs px-3 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 disabled:opacity-60"
        >
          Manual Refresh
        </button>
      </div>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Referral Dashboard</h1>
              <p className="text-white/60 text-sm mt-1">Manage incoming referral faxes and patient workflows</p>
              {/* No last updated in mock data */}
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">{referrals.length}</div>
                <div className="text-xs text-white/60">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">
                  {referrals.filter(r => {
                    const today = new Date().toDateString()
                    const receivedDate = new Date(r.receivedAt).toDateString()
                    return receivedDate === today
                  }).length}
                </div>
                <div className="text-xs text-white/60">Today</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-500">
                  {referrals.filter(r => r.currentStatus !== "ready-schedule").length}
                </div>
                <div className="text-xs text-white/60">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-white/60" />
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Urgency:</span>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-32 h-8 bg-black border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem className="text-white" value="all">
                      All
                    </SelectItem>
                    <SelectItem className="text-white" value="STAT">
                      STAT
                    </SelectItem>
                    <SelectItem className="text-white" value="Urgent">
                      Urgent
                    </SelectItem>
                    <SelectItem className="text-white" value="Routine">
                      Routine
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 h-8 bg-black border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem className="text-white" value="recent">
                      Recent
                    </SelectItem>
                    <SelectItem className="text-white" value="urgency">
                      Urgency
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-white/60">Loading referrals...</div>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/60">No referrals found. Using mock data...</div>
              <button 
                onClick={() => setReferrals(staticMockReferrals)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load Mock Data
              </button>
            </div>
          ) : (
            filteredReferrals.map((referral: Referral) => {
            const workflowSteps = getWorkflowSteps(referral.hasMissingInfo)
            const calculatedProgress = getStatusProgress(referral.currentStatus, referral.hasMissingInfo)

            return (
              <div key={referral.id} className="border-b border-white/10">
                {/* Main Row */}
                <div
                  className="flex items-center justify-between py-3 px-2 hover:bg-white/5 cursor-pointer"
                  onClick={() => toggleReferral(referral.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="text-white">{referral.patientName}</div>
                      <div className="text-white/60">|</div>
                      <div
                        className={`${
                          referral.currentStatus === "awaiting-info" || referral.currentStatus === "contact-pcp" 
                            ? "text-red-400" 
                            : referral.currentStatus === "ready-schedule" 
                              ? "text-green-500" 
                              : "text-blue-400"
                        } hover:underline`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!expandedReferrals.includes(referral.id)) {
                            setExpandedReferrals((prev) => [...prev, referral.id])
                          }
                          // Set active tab to actions when status is clicked
                          setTimeout(() => {
                            const tabsContainer = document.querySelector(`[data-referral="${referral.id}"]`)
                            const actionsTab = tabsContainer?.querySelector(
                              '[data-state="inactive"][value="actions"]',
                            ) as HTMLElement
                            if (actionsTab) {
                              actionsTab.click()
                            }
                          }, 150)
                        }}
                      >
                        {getCurrentStageLabel(referral.currentStatus)}
                      </div>
                      <div className="text-white/60">|</div>
                      <div className={getUrgencyColor(referral.urgency)}>{referral.urgency}</div>
                      <div className="text-white/60">|</div>
                      <div
                        className="text-white/60 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!expandedReferrals.includes(referral.id)) {
                            setExpandedReferrals((prev) => [...prev, referral.id])
                          }
                          // Set active tab to documents when docs is clicked
                          setTimeout(() => {
                            const tabsContainer = document.querySelector(`[data-referral="${referral.id}"]`)
                            const documentsTab = tabsContainer?.querySelector(
                              '[data-state="inactive"][value="documents"]',
                            ) as HTMLElement
                            if (documentsTab) {
                              documentsTab.click()
                            }
                          }, 150)
                        }}
                      >
                        {referral.documents.length} docs
                      </div>
                      <div className="text-white/60">|</div>
                      <div className="text-white/60">{referral.id}</div>
                      <div className="text-white/60">|</div>
                      <div className="text-white/60">{referral.referringPractice}</div>
                      <div className="text-white/60">|</div>
                      <div className="text-white/60">{referral.referringProvider}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-white/60">{new Date(referral.receivedAt).toLocaleDateString()}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleReferral(referral.id)
                      }}
                      className="p-1 h-6 w-6 text-white/60 hover:text-white hover:bg-white/10"
                    >
                      {expandedReferrals.includes(referral.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedReferrals.includes(referral.id) && (
                  <div className="px-2 pb-4">
                    <div className="border-t border-white/10 pt-4">
                      {/* Full Progress Bar */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/60">Workflow Progress</span>
                          <span className="text-sm text-white/60">{calculatedProgress}%</span>
                        </div>
                        <Progress value={calculatedProgress} className="h-2 bg-white/10" />

                        {/* Dynamic Status Steps */}
                        <div className="flex items-center justify-between mt-4 px-1">
                          {workflowSteps.map((step, index) => {
                            const isActive = step.key === referral.currentStatus
                            const isCompleted = workflowSteps.findIndex((s) => s.key === referral.currentStatus) > index
                            const Icon = step.icon

                            return (
                              <div key={step.key} className="flex flex-col items-center gap-2">
                                <div className="relative">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                      isActive
                                        ? step.key === "awaiting-info"
                                          ? "bg-red-500 border-red-500 text-white"
                                          : "bg-green-500 border-green-500 text-black"
                                        : isCompleted
                                          ? "bg-white border-white text-black"
                                          : "bg-black border-white/30 text-white/30"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  {isActive && (
                                    <div className="absolute -top-1 -right-1">
                                      <Circle
                                        className={`h-3 w-3 animate-pulse ${
                                          step.key === "awaiting-info"
                                            ? "fill-red-500 text-red-500"
                                            : "fill-green-500 text-green-500"
                                        }`}
                                      />
                                    </div>
                                  )}
                                </div>
                                <span
                                  className={`text-xs text-center max-w-20 leading-tight ${
                                    isActive
                                      ? step.key === "awaiting-info"
                                        ? "text-red-400 font-medium"
                                        : "text-green-500 font-medium"
                                      : isCompleted
                                        ? "text-white"
                                        : "text-white/30"
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <Tabs defaultValue="details" className="w-full" data-referral={referral.id}>
                        <TabsList className="grid w-full grid-cols-3 bg-white/10">
                          <TabsTrigger
                            value="details"
                            className="text-white/60 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                          >
                            Details
                          </TabsTrigger>
                          <TabsTrigger
                            value="documents"
                            className="text-white/60 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                          >
                            Documents ({referral.documents.length})
                          </TabsTrigger>
                          <TabsTrigger
                            value="actions"
                            className="text-white/60 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                          >
                            Actions
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-white text-sm">Patient Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="text-white/80">
                                  <span className="font-medium text-white/60">Patient ID:</span> {referral.patientId}
                                </div>
                                <div className="text-white/80">
                                  <span className="font-medium text-white/60">Referring Provider:</span>{" "}
                                  {referral.referringProvider}
                                </div>
                                <div className="text-white/80">
                                  <span className="font-medium text-white/60">Practice:</span>{" "}
                                  {referral.referringPractice}
                                </div>
                                <div className="text-white/80">
                                  <span className="font-medium text-white/60">Specialty:</span> {referral.specialty}
                                </div>
                              </div>
                            </div>

                            {referral.extractedInfo && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white text-sm">Extracted Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Reason:</span>{" "}
                                    {referral.extractedInfo.reason}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Symptoms:</span>{" "}
                                    {referral.extractedInfo.symptoms}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Medications:</span>{" "}
                                    {referral.extractedInfo.medications}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Allergies:</span>{" "}
                                    {referral.extractedInfo.allergies}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Insurance:</span>{" "}
                                    {referral.extractedInfo.insurance}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {referral.notes && (
                            <div className="mt-4 p-3 border border-blue-500/30 bg-blue-500/10 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <h4 className="font-semibold text-blue-500 text-sm">Notes</h4>
                              </div>
                              <p className="text-xs text-white/80">{referral.notes}</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-3 mt-4">
                          {referral.documents.map((doc: ReferralDocument) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 border border-white/10 rounded bg-white/5"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-white/60" />
                                <div>
                                  <div className="font-medium text-white text-sm">{doc.name}</div>
                                  <div className="text-xs text-white/60">
                                    {doc.pages} page{doc.pages !== 1 ? "s" : ""} •{" "}
                                    {new Date(doc.receivedAt).toLocaleString()}
                                  </div>
                                  {doc.patientData && (
                                    <div className="text-xs text-green-400 mt-1">
                                      <span className="text-white/60">Patient: </span>
                                      {doc.patientData.name} • DOB: {doc.patientData.dob} • MRN: {doc.patientData.mrn}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-white/20 bg-black text-white hover:bg-white/10"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-white/20 bg-black text-white hover:bg-white/10"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {referral.currentStatus === "contact-pcp" && (
                              <div className="p-4 border border-orange-500/30 bg-orange-500/10 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                  <h4 className="font-semibold text-orange-500 text-sm">Missing Information Detected</h4>
                                </div>
                                <p className="text-xs text-white/80 mb-3">
                                  Missing information detected. Click below to contact the referring provider.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContactPCP(referral.id)}
                                  className="h-7 text-xs border-orange-500 bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  Contact PCP
                                </Button>
                              </div>
                            )}

                            {referral.currentStatus === "awaiting-info" && (
                              <div className="p-4 border border-red-500/30 bg-red-500/10 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <h4 className="font-semibold text-red-500 text-sm">Awaiting Information</h4>
                                </div>
                                <p className="text-xs text-white/80 mb-3">
                                  PCP contacted. Awaiting additional information from referring provider.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContactPCP(referral.id)}
                                  className="h-7 text-xs border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  Follow Up
                                </Button>
                              </div>
                            )}

                            {referral.currentStatus === "emr-sync" && (
                              <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="h-4 w-4 text-blue-500" />
                                  <h4 className="font-semibold text-blue-500 text-sm">EMR Sync Required</h4>
                                </div>
                                <p className="text-xs text-white/80 mb-3">
                                  Patient information ready for EMR synchronization. Select your provider and sync.
                                </p>
                                <div className="space-y-3">
                                  <select
                                    id={`emr-provider-${referral.id}`}
                                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white text-xs"
                                  >
                                    <option value="">Select EHR Provider</option>
                                    <option value="epic">Epic</option>
                                    <option value="cerner">Cerner</option>
                                    <option value="athena">Athenahealth</option>
                                    <option value="meditech">Meditech</option>
                                    <option value="allscripts">Allscripts</option>
                                    <option value="nextgen">NextGen</option>
                                    <option value="eclinicalworks">eClinicalWorks</option>
                                    <option value="practicefusion">Practice Fusion</option>
                                  </select>
                                  <Button
                                    size="sm"
                                    onClick={() => handleEMRSync(referral.id)}
                                    className="h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                                  >
                                    <Building2 className="h-3 w-3 mr-1" />
                                    Sync with EHR
                                  </Button>
                                </div>
                              </div>
                            )}

                            {referral.currentStatus === "ready-schedule" && (
                              <div className="p-4 border border-green-500/30 bg-green-500/10 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <h4 className="font-semibold text-green-500 text-sm">Ready for Scheduling</h4>
                                </div>
                                <p className="text-xs text-white/80 mb-3">
                                  EMR sync completed. Patient can be scheduled for appointment.
                                </p>
                                <Button
                                  size="sm"
                                  onClick={() => handleScheduleAppointment(referral.id)}
                                  className="h-7 text-xs bg-green-500 hover:bg-green-600 text-black"
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Schedule Appointment
                                </Button>
                              </div>
                            )}

                            {referral.currentStatus === "ocr-processing" && (
                              <div className="p-4 border border-white/20 bg-white/5 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-white/60" />
                                  <h4 className="font-semibold text-white text-sm">Processing</h4>
                                </div>
                                <p className="text-xs text-white/60">OCR text extraction in progress. Please wait...</p>
                              </div>
                            )}

                            <div className="p-4 border border-white/20 bg-white/5 rounded">
                              <h4 className="font-semibold text-white mb-2 text-sm">Manual Actions</h4>
                              <div className="space-y-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReviewClinicalNotes(referral.id)}
                                  className="w-full justify-start h-7 text-xs bg-black border-white/20 text-white hover:bg-white/10"
                                >
                                  <Stethoscope className="h-3 w-3 mr-2" />
                                  Review Clinical Notes
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePatientInfo(referral.id)}
                                  className="w-full justify-start h-7 text-xs bg-black border-white/20 text-white hover:bg-white/10"
                                >
                                  <User className="h-3 w-3 mr-2" />
                                  Update Patient Info
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddNotes(referral.id)}
                                  className="w-full justify-start h-7 text-xs bg-black border-white/20 text-white hover:bg-white/10"
                                >
                                  <FileText className="h-3 w-3 mr-2" />
                                  Add Notes
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Edit Referral Information</h2>
              <button
                onClick={handleCloseModal}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Referral ID</label>
                  <input
                    type="text"
                    value={editModal.referralId || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Insurance</label>
                  <input
                    type="text"
                    value={referrals.find(r => r.id === editModal.referralId)?.extractedInfo?.insurance || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white/40"
                  />
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={editModal.patientName}
                    onChange={(e) => setEditModal(prev => ({ ...prev, patientName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Patient ID</label>
                  <input
                    type="text"
                    value={editModal.patientId}
                    onChange={(e) => setEditModal(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Specialty</label>
                  <select
                    value={editModal.specialty}
                    onChange={(e) => setEditModal(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Urgency</label>
                  <select
                    value={editModal.urgency}
                    onChange={(e) => setEditModal(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Clinical Reason</label>
                <textarea
                  value={editModal.reason}
                  onChange={(e) => setEditModal(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Symptoms</label>
                <textarea
                  value={editModal.symptoms}
                  onChange={(e) => setEditModal(prev => ({ ...prev, symptoms: e.target.value }))}
                  rows={2}
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Medications</label>
                <textarea
                  value={editModal.medications}
                  onChange={(e) => setEditModal(prev => ({ ...prev, medications: e.target.value }))}
                  rows={2}
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Allergies</label>
                <input
                  type="text"
                  value={editModal.allergies}
                  onChange={(e) => setEditModal(prev => ({ ...prev, allergies: e.target.value }))}
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Notes</label>
                <textarea
                  value={editModal.notes}
                  onChange={(e) => setEditModal(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Add any additional notes..."
                  className="w-full bg-white/5 border border-white/20 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Base workflow steps
const baseStatusSteps = [
  { key: "received", label: "Received", icon: FileText },
  { key: "ocr-processing", label: "OCR Processing", icon: Eye },
]

// Missing info workflow
const missingInfoSteps = [
  { key: "contact-pcp", label: "Contact PCP", icon: Phone },
  { key: "awaiting-info", label: "Awaiting Info", icon: Clock },
]

// Complete info workflow
const completeInfoSteps = [
  { key: "classified", label: "Classified", icon: CheckCircle },
  { key: "chart-generated", label: "Chart Generated", icon: User },
  { key: "emr-sync", label: "EMR Sync", icon: Building2 },
  { key: "ready-schedule", label: "Ready to Schedule", icon: Calendar },
]

const getWorkflowSteps = (hasMissingInfo: boolean) => {
  if (hasMissingInfo) {
    return [...baseStatusSteps, ...missingInfoSteps]
  }
  return [...baseStatusSteps, ...completeInfoSteps]
}

const getCurrentStageLabel = (status: string) => {
  const allSteps = [...baseStatusSteps, ...missingInfoSteps, ...completeInfoSteps]
  const step = allSteps.find((s) => s.key === status)
  return step ? step.label : "Unknown"
}

const getStatusProgress = (currentStatus: string, hasMissingInfo: boolean) => {
  const steps = getWorkflowSteps(hasMissingInfo)
  const currentIndex = steps.findIndex((step) => step.key === currentStatus)
  if (currentIndex === -1) return 0
  return Math.round(((currentIndex + 1) / steps.length) * 100)
}

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "STAT":
      return "text-red-500"
    case "Urgent":
      return "text-red-400"
    case "Routine":
      return "text-white"
    default:
      return "text-white"
  }
}
