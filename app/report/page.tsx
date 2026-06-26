'use client'

import { useState, useRef, useEffect } from 'react'
import { NavHeader } from '@/components/nav-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, MapPin, CheckCircle, Zap, Loader2, AlertCircle } from 'lucide-react'
import { analyzeIssueImage } from '@/lib/gemini'
import { saveReport } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'

export default function ReportPage() {
  const slideUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  }
  const [dragActive, setDragActive] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  
  // States for API integration
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  
  const [aiResult, setAiResult] = useState<{
    type: string
    severity: string
    confidence: number
    description?: string
  } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scanContainerRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // GSAP Animation Effect
  useEffect(() => {
    const ctx = gsap.context(() => {});
    
    if (isAnalyzing && image) {
      ctx.add(() => {
        const tl = gsap.timeline({ repeat: -1 });
        tl.fromTo('.scan-line', 
          { top: '0%' }, 
          { top: '100%', duration: 1.5, ease: 'linear' }
        );
      });
    }

    if (aiResult && !isAnalyzing) {
      ctx.add(() => {
        const tl = gsap.timeline();
        tl.fromTo(resultRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }
        );
      });
    }

    return () => ctx.revert();
  }, [isAnalyzing, aiResult, image])

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setImage(result)
          setFileName(file.name)
          setAiResult(null)
          setAiError(null)
          setIsAnalyzing(true)
          
          try {
            const analysis = await analyzeIssueImage(result)
            // Handle if model returned 0-1 scale or 0-100 scale
            const confidenceVal = analysis.confidence > 1 
              ? Math.round(analysis.confidence) 
              : Math.round(analysis.confidence * 100);

            setAiResult({
              type: analysis.issueType,
              severity: analysis.severity,
              confidence: confidenceVal,
              description: analysis.description
            })
          } catch (error) {
            console.error("AI Analysis failed:", error)
            setAiError("AI analysis failed, please try again")
          } finally {
            setIsAnalyzing(false)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!image || !aiResult || !location) return;

    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      await saveReport({
        imageUrl: image, // Note: In a production app, we would upload the image to Firebase Storage and save the URL here.
        issueType: aiResult.type,
        severity: aiResult.severity,
        confidence: aiResult.confidence,
        location,
        description,
        aiDescription: aiResult.description
      })
      
      setSubmitted(true)
      
      setTimeout(() => {
        setSubmitted(false)
        setImage(null)
        setAiResult(null)
        setLocation('')
        setDescription('')
        setFileName('')
      }, 3000)
    } catch (error) {
      console.error("Submission failed:", error)
      setSubmitError("Submission failed, please try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-green-900/30 text-green-400'
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400'
      case 'critical':
      case 'high':
        return 'bg-red-900/30 text-red-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <>
      <NavHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-foreground">Report an Issue</h1>
            <p className="text-muted-foreground">
              Upload an image and our AI will automatically classify and analyze the civic issue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <motion.div initial="hidden" animate="visible" variants={slideUpVariants}>
              <Card className="border-border/40 bg-card/50 p-8 backdrop-blur-md shadow-lg">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
                <Upload className="h-5 w-5" />
                Upload Image
              </h2>

              <div
                className={`relative rounded-lg border-2 border-dashed transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border/40 bg-background/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {image ? (
                  <div className="p-6 relative group">
                    <img
                      src={image}
                      alt="Uploaded issue"
                      className="h-80 w-full rounded-lg object-cover"
                    />
                    
                    {/* Scanning Overlay (Rendered during analysis) */}
                    {isAnalyzing && (
                      <div ref={scanContainerRef} className="absolute inset-6 rounded-lg bg-black/40 overflow-hidden flex items-center justify-center pointer-events-none">
                        <div className="scan-line absolute left-0 right-0 h-[2px] bg-orange-500 shadow-[0_0_8px_#f97316] top-0 z-10" />
                        <div className="scan-text text-xl font-bold text-orange-400 font-mono tracking-widest bg-black/60 px-4 py-2 rounded shadow-lg border border-orange-500/30 z-20">
                          AI Analyzing<span className="animate-pulse">_</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      {fileName}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null)
                        setAiResult(null)
                        setFileName('')
                        setAiError(null)
                      }}
                      className="mt-4 w-full rounded-lg border border-border/40 py-2 text-sm text-muted-foreground hover:bg-card/50 transition-colors"
                      disabled={isAnalyzing || isSubmitting}
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer p-8 text-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Drag and drop your image here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  disabled={isAnalyzing || isSubmitting}
                />
              </div>

              {/* Old AI Processing State (Removed in favor of overlay) */}

              {/* AI Error State */}
              <AnimatePresence mode="wait">
                {aiError && (
                  <motion.div 
                    initial="hidden" animate="visible" exit="exit" variants={slideUpVariants}
                    className="mt-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{aiError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Classification Result */}
              {aiResult && !isAnalyzing && (
                  <div 
                    ref={resultRef}
                    className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6 opacity-0"
                  >
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                      <Zap className="h-5 w-5 text-primary" />
                      AI Classification Result
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Issue Type</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {aiResult.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Severity</p>
                        <div className="mt-1">
                          <Badge className={getSeverityColor(aiResult.severity)}>
                            {aiResult.severity}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">AI Confidence</p>
                        <p className="mt-1 text-lg font-semibold text-primary">
                          {aiResult.confidence}%
                        </p>
                      </div>
                    </div>
                    {aiResult.description && (
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <p className="text-xs text-muted-foreground">AI Description</p>
                        <p className="mt-1 text-sm text-foreground">
                          {aiResult.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </Card>
            </motion.div>

            {/* Location and Description */}
            <AnimatePresence mode="wait">
              {image && aiResult && !isAnalyzing && (
                <motion.div initial="hidden" animate="visible" exit="exit" variants={slideUpVariants}>
                  <Card className="border-border/40 bg-card/50 p-8 backdrop-blur-md shadow-lg">
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
                      <MapPin className="h-5 w-5" />
                      Issue Details
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground">
                          Location
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter the street or area name"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                          className="mt-2 bg-background/50 text-foreground placeholder:text-muted-foreground/50"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground">
                          Description (Optional)
                        </label>
                        <textarea
                          placeholder="Provide additional details about the issue"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-2 h-32 w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Submit Error State */}
                      <AnimatePresence mode="wait">
                        {submitError && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500"
                          >
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">{submitError}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !aiResult}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Report"
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Success Message */}
          <AnimatePresence>
            {submitted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <Card className="border-border/40 bg-card/60 p-8 text-center backdrop-blur-md shadow-lg">
                    <div className="mb-4 flex justify-center">
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-foreground">
                      Issue reported successfully!
                    </h3>
                    <p className="text-muted-foreground">
                      Your issue has been recorded and forwarded to the relevant authorities.
                    </p>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}
