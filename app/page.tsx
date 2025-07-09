"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Remove mockReferrals. Use state and fetch from backend
export default function ReferralTriageSystem() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [resetting, setResetting] = useState(false)
  const router = useRouter()

  // Poll referrals every 2 seconds
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/referrals")
        const data = await res.json()
        setReferrals(data.referrals)
        setLoading(false)
      } catch (e) {
        setError("Failed to fetch referrals.")
        setLoading(false)
      }
    }
    fetchReferrals()
    const interval = setInterval(fetchReferrals, 2000)
    return () => clearInterval(interval)
  }, [])

  const [expandedReferrals, setExpandedReferrals] = useState<string[]>([])
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")

  const toggleReferral = (id: string) => {
    setExpandedReferrals((prev) => (prev.includes(id) ? prev.filter((refId) => refId !== id) : [...prev, id]))
  }

  const handleScheduleAppointment = (referralId: string) => {
    alert(`Scheduling appointment for ${referralId}. Patient will receive appointment booking link.`)
  }

  const handleContactPCP = (referralId: string) => {
    alert(`Contacting PCP for additional information for ${referralId}`)
  }

  const handleReset = async () => {
    setResetting(true)
    setError("")
    const res = await fetch("/api/fax/reset", { method: "POST" })
    setResetting(false)
    setReferrals([])
  }

  // Filter and sort referrals
  const filteredReferrals = referrals
    .filter((referral) => urgencyFilter === "all" || referral.urgency === urgencyFilter)
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
      } else if (sortBy === "urgency") {
        const urgencyOrder = { STAT: 3, Urgent: 2, Routine: 1 }
        return (
          urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder]
        )
      }
      return 0
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg">Loading referrals...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        <div className="text-lg">{error}</div>
      </div>
    )
  }

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
          disabled={resetting}
          className="text-xs px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 disabled:opacity-60"
        >
          {resetting ? "Resetting..." : "Reset Demo"}
        </button>
      </div>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Referral Dashboard</h1>
              <p className="text-white/60 text-sm mt-1">Manage incoming referral faxes and patient workflows</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">12</div>
                <div className="text-xs text-white/60">Active</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">8</div>
                <div className="text-xs text-white/60">Today</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-500">3</div>
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
          {filteredReferrals.map((referral) => {
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
                        className={`${referral.currentStatus === "awaiting-info" ? "text-red-400" : "text-green-500"} hover:underline`}
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
                        {referral.documents && JSON.parse(referral.documents).length} docs
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
                    <div className="text-sm text-white/60">{new Date(referral.received_at).toLocaleDateString()}</div>
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
                            Documents ({referral.documents && JSON.parse(referral.documents).length})
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

                            {referral.extracted_info && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white text-sm">Extracted Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Reason:</span>{" "}
                                    {JSON.parse(referral.extracted_info).reason}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Symptoms:</span>{" "}
                                    {JSON.parse(referral.extracted_info).symptoms}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Medications:</span>{" "}
                                    {JSON.parse(referral.extracted_info).medications}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Allergies:</span>{" "}
                                    {JSON.parse(referral.extracted_info).allergies}
                                  </div>
                                  <div className="text-white/80">
                                    <span className="font-medium text-white/60">Insurance:</span>{" "}
                                    {JSON.parse(referral.extracted_info).insurance}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-3 mt-4">
                          {referral.documents && JSON.parse(referral.documents).map((doc: any) => (
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
                            {referral.currentStatus === "awaiting-info" && (
                              <div className="p-4 border border-red-500/30 bg-red-500/10 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <h4 className="font-semibold text-red-500 text-sm">Missing Information</h4>
                                </div>
                                <p className="text-xs text-white/80 mb-3">
                                  Additional information required from referring provider.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleContactPCP(referral.id)}
                                  className="h-7 text-xs border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  Contact PCP
                                </Button>
                              </div>
                            )}

                            {referral.currentStatus === "ready-schedule" && (
                              <div className="p-4 border border-green-500/30 bg-green-500/10 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <h4 className="font-semibold text-green-500 text-sm">Ready for Scheduling</h4>
                                </div>
                                <p className="text-xs text-white/80 mb-3">
                                  All information validated. Patient can be scheduled for appointment.
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
                                  className="w-full justify-start h-7 text-xs bg-black border-white/20 text-white hover:bg-white/10"
                                >
                                  <Stethoscope className="h-3 w-3 mr-2" />
                                  Review Clinical Notes
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start h-7 text-xs bg-black border-white/20 text-white hover:bg-white/10"
                                >
                                  <User className="h-3 w-3 mr-2" />
                                  Update Patient Info
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
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
          })}
        </div>
      </div>
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
  { key: "initiate-contact", label: "Contact PCP", icon: Phone },
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
