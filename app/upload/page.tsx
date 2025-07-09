"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function FaxUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [queue, setQueue] = useState<any[]>([])
  const [error, setError] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processMsg, setProcessMsg] = useState("")
  const [lastReferral, setLastReferral] = useState<any>(null)
  const [resetting, setResetting] = useState(false)
  const router = useRouter()

  // Poll the queue every 2 seconds
  useEffect(() => {
    const fetchQueue = async () => {
      const res = await fetch("/api/fax/queue")
      const data = await res.json()
      setQueue(data.queue)
    }
    fetchQueue()
    const interval = setInterval(fetchQueue, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
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
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/fax/upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) {
      setError(data.error || "Upload failed.")
    } else {
      setQueue(data.queue)
      setFile(null)
    }
  }

  const handleProcess = async () => {
    setProcessing(true)
    setProcessMsg("")
    setLastReferral(null)
    const res = await fetch("/api/fax/process", { method: "POST" })
    const data = await res.json()
    setProcessing(false)
    if (!res.ok) {
      setProcessMsg(data.error || "Processing failed.")
    } else {
      setProcessMsg("Fax processed successfully!")
      setQueue(data.queue)
      setLastReferral(data.referral)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    setError("")
    setProcessMsg("")
    setLastReferral(null)
    const res = await fetch("/api/fax/reset", { method: "POST" })
    setResetting(false)
    setQueue([])
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
          disabled={resetting}
          className="text-xs px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 disabled:opacity-60"
        >
          {resetting ? "Resetting..." : "Reset Demo"}
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
          <h2 className="text-lg font-semibold mb-2">Current Fax Queue</h2>
          {queue.length === 0 ? (
            <div className="text-white/60 text-sm">No faxes in queue.</div>
          ) : (
            <ul className="space-y-2">
              {queue.map(item => (
                <li key={item.id} className="flex justify-between items-center text-sm border-b border-white/10 pb-1">
                  <span>{item.filename}</span>
                  <span className="text-white/60">{new Date(item.uploaded_at).toLocaleString()}</span>
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 underline ml-2">View</a>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 