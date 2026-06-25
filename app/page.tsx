import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { NavHeader } from '@/components/nav-header'
import { Zap, Brain, Award } from 'lucide-react'

export default function Home() {
  return (
    <>
      <NavHeader />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold text-foreground sm:text-6xl">
              NagarAI
            </h1>
            <p className="mb-4 text-xl text-muted-foreground sm:text-2xl">
              Smart Civic Issue Reporting & Predictive Analytics
            </p>
            <p className="mb-12 text-lg text-muted-foreground">
              Report municipal issues, get AI-powered analysis, and track community impact with real-time heatmaps
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/report">
                <Button size="lg" className="w-full sm:w-auto">
                  Report an Issue
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t border-border/40 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-card p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-primary">2,847</div>
                <div className="text-sm text-muted-foreground">Issues Reported</div>
              </div>
              <div className="rounded-lg bg-card p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-green-500">1,923</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="rounded-lg bg-card p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-yellow-500">654</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="rounded-lg bg-card p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-red-500">270</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-4xl font-bold text-foreground">
              Why Choose NagarAI?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-border/40 bg-card/50 p-8 hover:bg-card/80 transition-colors">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  Smart Reporting
                </h3>
                <p className="text-muted-foreground">
                  Drag-and-drop image uploads with instant AI classification of civic issues like potholes, waterlogging, broken streetlights, and garbage.
                </p>
              </Card>

              <Card className="border-border/40 bg-card/50 p-8 hover:bg-card/80 transition-colors">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  Predictive AI
                </h3>
                <p className="text-muted-foreground">
                  Advanced machine learning algorithms predict issue severity and identify high-risk zones across the city with heatmap visualization.
                </p>
              </Card>

              <Card className="border-border/40 bg-card/50 p-8 hover:bg-card/80 transition-colors">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  Auto Accountability
                </h3>
                <p className="text-muted-foreground">
                  Track resolution rates by ward, compare performance metrics, and generate official complaint letters with automatic government tracking.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border/40 bg-card/30 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Ready to Make a Difference?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start reporting issues and help your city become cleaner, safer, and more efficient.
            </p>
            <Link href="/report">
              <Button size="lg">
                Report Your First Issue
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
            <p>NagarAI © 2024. Making cities smarter, one report at a time.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
