'use client'

import { useState, useRef } from 'react'
import { NavHeader } from '@/components/nav-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react'
import { WARDS, ISSUE_TYPES } from '@/lib/data'
import { generateComplaintLetter } from '@/lib/gemini'

export default function ComplaintLetterPage() {
  const [citizenName, setCitizenName] = useState('')
  const [ward, setWard] = useState('')
  const [issueType, setIssueType] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [location, setLocation] = useState('')

  const [letterContent, setLetterContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const letterRef = useRef<HTMLDivElement>(null)

  const handleGenerateLetter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citizenName || !issueDescription || !ward) return

    setIsGenerating(true)
    setError(null)
    setLetterContent('')

    try {
      const today = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const prompt = `Generate a formal complaint letter to the Municipal Corporation of India from a citizen.
Citizen Name: ${citizenName}
Ward: ${ward}
Issue: ${issueType} at ${location}
Description: ${issueDescription}
Date: ${today}
Make it professional, firm but respectful. 
Include proper letterhead format, subject line, and closing. End with space for signature.`

      const letter = await generateComplaintLetter(citizenName, ward, prompt)
      setLetterContent(letter)
    } catch (err) {
      console.error('Failed to generate letter:', err)
      setError('Failed to generate letter. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!letterContent) return
    const element = document.createElement('a')
    const file = new Blob([letterContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `complaint-letter-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <NavHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-foreground">Generate Complaint Letter</h1>
            <p className="text-muted-foreground">
              Create an official complaint letter for municipal authorities with automatic tracking and reference numbers.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form */}
            <div>
              <Card className="border-border/40 bg-card/50 p-8">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
                  <FileText className="h-5 w-5" />
                  Complaint Details
                </h2>

                <form onSubmit={handleGenerateLetter} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Citizen Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      required
                      disabled={isGenerating}
                      className="mt-2 bg-background/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Ward Number <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter ward number (e.g., Ward 5)"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      required
                      disabled={isGenerating}
                      className="mt-2 bg-background/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Issue Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      required
                      disabled={isGenerating}
                      className="mt-2 w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="" disabled className="bg-card text-muted-foreground">
                        Select issue type
                      </option>
                      {ISSUE_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-card text-foreground">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Location <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter the street or area name"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      disabled={isGenerating}
                      className="mt-2 bg-background/50 text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Issue Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      placeholder="Describe the civic issue in detail. Include severity and any supporting details."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      required
                      disabled={isGenerating}
                      className="mt-2 h-40 w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      'Generate Letter'
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Letter Preview */}
            {(letterContent || isGenerating) && (
              <div>
                <Card className="border-border/40 bg-card/50 p-8 max-h-[800px] overflow-y-auto">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Letter Preview</h2>
                    {letterContent && !isGenerating && (
                      <Badge className="bg-green-900/30 text-green-400">Ready</Badge>
                    )}
                    {isGenerating && (
                      <Badge className="bg-yellow-900/30 text-yellow-400">Generating...</Badge>
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Gemini AI is drafting your complaint letter...</p>
                    </div>
                  ) : (
                    <>
                      <div
                        ref={letterRef}
                        id="letter-preview"
                        className="prose prose-invert max-w-none mb-6 rounded-lg bg-white p-8 font-serif text-sm leading-relaxed text-gray-900 print:shadow-none print:p-0"
                      >
                        <pre className="whitespace-pre-wrap break-words font-serif text-sm text-gray-900">
                          {letterContent}
                        </pre>
                      </div>

                      <div className="space-y-3 border-t border-border/40 pt-6">
                        <Button
                          onClick={handlePrint}
                          size="sm"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download as PDF
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          size="sm"
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Download as Text
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </div>
            )}
          </div>

          {/* Info Section */}
          {!letterContent && !isGenerating && (
            <Card className="mt-8 border-border/40 border-l-4 border-l-primary bg-primary/5 p-6">
              <h3 className="mb-4 font-semibold text-foreground">About This Letter</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AI-powered letter generation using Google Gemini</li>
                <li>• Generates a professional, properly formatted complaint letter</li>
                <li>• Pre-formatted for municipal corporation submission</li>
                <li>• Can be printed as PDF or downloaded for official use</li>
                <li>• Helps ensure your issue receives proper attention</li>
              </ul>
            </Card>
          )}
        </div>
      </main>

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #letter-preview,
          #letter-preview * {
            visibility: visible;
          }
          #letter-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 40px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </>
  )
}
