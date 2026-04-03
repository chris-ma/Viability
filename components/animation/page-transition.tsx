"use client"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Kill any in-flight tween on this element before starting a new one
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.42, ease: "power3.out", clearProps: "transform" }
    )
  }, [pathname])

  return (
    <div ref={ref} style={{ willChange: "opacity, transform" }}>
      {children}
    </div>
  )
}
