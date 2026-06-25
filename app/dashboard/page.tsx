'use client'

import { useEffect, useState } from 'react'
import { NavHeader } from '@/components/nav-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TrendingUp, AlertCircle, CheckCircle2, Clock, Loader2, Zap } from 'lucide-react'
import { wardLeaderboard } from '@/lib/data'
import { subscribeToReports } from '@/lib/firebase'
import { predictCivicRisks } from '@/lib/gemini'

type Report = {
  id: string
  issueType: string
  location: string
  severity: string
  status?: string
  date?: string
  createdAt?: any
}

type Stats = {
  totalReports: number
  resolved: number
  pending: number
  critical: number
}

type Zone = {
  id: string
  risk: 'low' | 'medium' | 'high'
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    resolved: 0,
    pending: 0,
    critical: 0
  })
  const [heatmapZones, setHeatmapZones] = useState<Zone[][]>([])
  const [predictions, setPredictions] = useState<string[]>([])
  const [isPredicting, setIsPredicting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Generate a 6x6 Heatmap Grid (36 zones)
  const generateHeatmap = () => {
    const grid: Zone[][] = []
    let zoneCounter = 1
    for (let r = 0; r < 6; r++) {
      const row: Zone[] = []
      for (let c = 0; c < 6; c++) {
        // Randomly assign risk for visualization
        const rand = Math.random()
        const risk = rand > 0.85 ? 'high' : rand > 0.5 ? 'medium' : 'low'
        row.push({
          id: `Z${zoneCounter++}`,
          risk
        })
      }
      grid.push(row)
    }
    return grid
  }

  useEffect(() => {
    const unsubscribe = subscribeToReports((fetchedReports) => {
      const processedReports = fetchedReports.map(r => ({
        ...r,
        // Format timestamp if it exists, otherwise fallback to now
        date: r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
        // Existing uploads don't have a status, default to Pending
        status: r.status || 'Pending'
      }))
      
      setReports(processedReports)

      // Calculate Stats
      const total = processedReports.length
      const resolved = processedReports.filter(r => r.status?.toLowerCase() === 'resolved').length
      const pending = processedReports.filter(r => r.status?.toLowerCase() !== 'resolved').length
      const critical = processedReports.filter(r => r.severity?.toLowerCase() === 'high' || r.severity?.toLowerCase() === 'critical').length

      setStats({
        totalReports: total,
        resolved,
        pending,
        critical
      })
      
      // Update heatmap only if empty to prevent jittering, 
      // or we can just generate it once on mount
      if (heatmapZones.length === 0) {
        setHeatmapZones(generateHeatmap())
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, []) // Remove heatmapZones.length from dependency to avoid loop

  // Effect to fetch Gemini predictions when reports load/change significantly
  useEffect(() => {
    if (reports.length > 0 && predictions.length === 0 && !isPredicting) {
      const fetchPredictions = async () => {
        setIsPredicting(true)
        try {
          const types = reports.map(r => r.issueType).slice(0, 10).join(", ")
          const locations = reports.map(r => r.location).slice(0, 10).join(", ")
          const summary = `We have ${reports.length} total reports. Recent issues include: ${types} in areas like: ${locations}.`
          
          const preds = await predictCivicRisks(summary)
          setPredictions(preds)
        } catch (error) {
          console.error(error)
        } finally {
          setIsPredicting(false)
        }
      }
      fetchPredictions()
    }
  }, [reports, predictions.length, isPredicting])

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-900/30 text-green-400'
      case 'in progress':
        return 'bg-blue-900/30 text-blue-400'
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <>
      <NavHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor civic issues and track improvement across your city in real-time.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/40 bg-card/50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="mt-2 text-3xl font-bold text-foreground flex items-center">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats.totalReports.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="border-border/40 bg-card/50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="mt-2 text-3xl font-bold text-green-400 flex items-center">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-green-400/50" /> : stats.resolved.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-green-900/20 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="border-border/40 bg-card/50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-400 flex items-center">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-yellow-400/50" /> : stats.pending.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-900/20 p-3">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </Card>

            <Card className="border-border/40 bg-card/50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="mt-2 text-3xl font-bold text-red-400 flex items-center">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-red-400/50" /> : stats.critical.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-red-900/20 p-3">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Predictive Heatmap */}
              <Card className="border-border/40 bg-card/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">
                    Predictive Issue Heatmap
                  </h2>
                </div>
                
                <div className="space-y-2 mb-6">
                  {heatmapZones.map((row, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-6 gap-2">
                      {row.map((zone, colIdx) => (
                        <div
                          key={colIdx}
                          className={`rounded border p-2 text-center transition-all hover:scale-105 cursor-pointer ${getRiskColor(
                            zone.risk
                          )}`}
                          title={`${zone.id} - ${zone.risk} risk`}
                        >
                          <p className="text-[10px] font-semibold opacity-70">
                            {zone.id}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Gemini AI Predictions */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-primary flex items-center gap-2">
                    {isPredicting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Gemini AI Forecast (Monsoon Risk)
                  </h3>
                  {predictions.length > 0 ? (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {predictions.map((pred, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 rounded-full bg-primary/20 p-1 shrink-0">
                            <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                          </span>
                          {pred}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isPredicting ? "Analyzing civic data for predictions..." : "Not enough data for predictions yet."}
                    </p>
                  )}
                </div>
              </Card>

              {/* Recent Reports Table */}
              <Card className="border-border/40 bg-card/50 p-6">
                <h2 className="mb-6 text-xl font-bold text-foreground">
                  Recent Reports
                </h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Issue</TableHead>
                        <TableHead className="text-muted-foreground">Location</TableHead>
                        <TableHead className="text-muted-foreground">Severity</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ) : reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No reports found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow
                            key={report.id}
                            className="border-border/40 hover:bg-card/50 transition-colors"
                          >
                            <TableCell className="font-medium text-foreground">
                              {report.issueType || 'Unknown Issue'}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[150px]">
                              {report.location}
                            </TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(report.status!)}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {report.date}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            {/* Ward Leaderboard */}
            <div>
              <Card className="border-border/40 bg-card/50 p-6 sticky top-6">
                <h2 className="mb-6 text-xl font-bold text-foreground">
                  Ward Performance
                </h2>
                <div className="space-y-4">
                  {wardLeaderboard.map((ward, idx) => {
                    const percentage = Math.round((ward.resolved / ward.total) * 100)
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-border/40 bg-background/50 p-4 hover:bg-card/50 transition-colors"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {ward.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ward.resolved}/{ward.total} resolved
                            </p>
                          </div>
                          <Badge className="bg-primary/20 text-primary">
                            {percentage}%
                          </Badge>
                        </div>
                        <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
