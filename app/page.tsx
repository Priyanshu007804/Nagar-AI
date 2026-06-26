'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { NavHeader } from '@/components/nav-header'
import { HeroCityscape } from '@/components/hero-cityscape'
import { Zap, Brain, Award } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function Counter({ targetValue, duration = 2000 }: { targetValue: number, duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTimestamp: number;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(ease * targetValue));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [targetValue, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // 1. NAVBAR - handled via React state in NavHeader component

    // 2. HERO SECTION - Parallax
    gsap.fromTo('.hero-content', 
      { y: 0 },
      {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      }
    );

    // Initial Hero Load Animation
    gsap.from('.hero-element', {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // 3. STATS SECTION
    
    // Stats cards slide in scrub
    gsap.fromTo('.stat-card', 
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.stats-section',
          start: 'top 80%',
          end: 'top 40%',
          scrub: true
        }
      }
    );

    // 4. "WHY CHOOSE NagarAI" SECTION
    // Heading curtain wipe
    gsap.fromTo('.features-heading',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        scrollTrigger: {
          trigger: '.features-heading',
          start: 'top 80%',
          end: 'top 40%',
          scrub: 1
        }
      }
    );

    // Feature cards alternate left-right
    gsap.utils.toArray('.feature-card').forEach((card: any, index) => {
      const isLeft = index % 2 === 0;
      gsap.fromTo(card,
        { x: isLeft ? -100 : 100, opacity: 0 },
        {
          x: 0, opacity: 1,
          scrollTrigger: {
            trigger: '.features-section',
            start: 'top 70%',
            end: 'top 20%',
            scrub: 1
          }
        }
      );
    });
    
    // 5. FOOTER/BOTTOM CTA SECTION
    gsap.to('.cta-section', {
      backgroundColor: 'rgba(30, 27, 75, 0.4)', // warmer dark
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top bottom',
        end: 'center center',
        scrub: true
      }
    });

    // CTA Button elastic bounce
    gsap.fromTo('.cta-button',
      { scale: 0.5, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
          trigger: '.cta-button',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      // Explicitly requested cleanup
      ScrollTrigger.getAll().forEach(t => t.kill());
    };

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      <NavHeader />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="hero-section relative px-4 flex flex-col justify-center min-h-[100vh] sm:px-6 lg:px-8 overflow-hidden">
          <HeroCityscape />
          <div className="hero-content relative z-10 mx-auto max-w-6xl text-center">
            <h1 className="hero-element mb-6 text-6xl font-extrabold sm:text-8xl bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              NagarAI
            </h1>
            <p className="hero-element mb-6 text-xl sm:text-2xl font-medium bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-md max-w-2xl mx-auto leading-relaxed">
              Smart Civic Issue Reporting & Predictive Analytics
            </p>
            <p className="hero-element mb-10 text-lg sm:text-xl bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-md max-w-2xl mx-auto">
              Report municipal issues, get AI-powered analysis, and track community impact with real-time heatmaps
            </p>
            <div className="hero-element flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/report">
                <Button size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform text-lg px-8 py-6">
                  Report an Issue
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto hover:scale-105 transition-transform text-lg px-8 py-6">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section border-t border-border/40 px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="stat-card rounded-xl border border-border/50 bg-card p-8 sm:p-10 text-center hover:bg-card/90 transition-all duration-300 shadow-[0_0_25px_rgba(139,92,246,0.15)] hover:shadow-[0_0_40px_rgba(139,92,246,0.35)] backdrop-blur-md">
                <div className="stat-number mb-3 text-5xl font-extrabold text-primary drop-shadow-md"><Counter targetValue={2847} /></div>
                <div className="text-lg font-medium text-muted-foreground">Issues Reported</div>
              </div>
              <div className="stat-card rounded-xl border border-border/50 bg-card p-8 sm:p-10 text-center hover:bg-card/90 transition-all duration-300 shadow-[0_0_25px_rgba(34,197,94,0.15)] hover:shadow-[0_0_40px_rgba(34,197,94,0.35)] backdrop-blur-md">
                <div className="stat-number mb-3 text-5xl font-extrabold text-green-500 drop-shadow-md"><Counter targetValue={1923} /></div>
                <div className="text-lg font-medium text-muted-foreground">Resolved</div>
              </div>
              <div className="stat-card rounded-xl border border-border/50 bg-card p-8 sm:p-10 text-center hover:bg-card/90 transition-all duration-300 shadow-[0_0_25px_rgba(234,179,8,0.15)] hover:shadow-[0_0_40px_rgba(234,179,8,0.35)] backdrop-blur-md">
                <div className="stat-number mb-3 text-5xl font-extrabold text-yellow-500 drop-shadow-md"><Counter targetValue={654} /></div>
                <div className="text-lg font-medium text-muted-foreground">In Progress</div>
              </div>
              <div className="stat-card rounded-xl border border-border/50 bg-card p-8 sm:p-10 text-center hover:bg-card/90 transition-all duration-300 shadow-[0_0_25px_rgba(239,68,68,0.15)] hover:shadow-[0_0_40px_rgba(239,68,68,0.35)] backdrop-blur-md">
                <div className="stat-number mb-3 text-5xl font-extrabold text-red-500 drop-shadow-md"><Counter targetValue={270} /></div>
                <div className="text-lg font-medium text-muted-foreground">Critical</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section border-t border-border/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="features-heading mb-12 text-center text-4xl font-bold text-foreground">
              Why Choose NagarAI?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="feature-card h-full">
                <Card className="h-full border-border/40 bg-card/50 p-8 hover:bg-card/80 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] hover:-translate-y-2">
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
              </div>

              <div className="feature-card h-full">
                <Card className="h-full border-border/40 bg-card/50 p-8 hover:bg-card/80 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] hover:-translate-y-2">
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
              </div>

              <div className="feature-card h-full">
                <Card className="h-full border-border/40 bg-card/50 p-8 hover:bg-card/80 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] hover:-translate-y-2">
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section border-t border-border/40 bg-card/30 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Ready to Make a Difference?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start reporting issues and help your city become cleaner, safer, and more efficient.
            </p>
            <div className="cta-button">
              <Link href="/report">
                <Button size="lg" className="hover:scale-105 transition-transform">
                  Report Your First Issue
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
            <p>NagarAI © 2024. Making cities smarter, one report at a time.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
