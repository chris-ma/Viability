"use client"
import { useEffect } from "react"
import gsap from "gsap"

export function DashboardAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Page header
      tl.from("#dash-header", { opacity: 0, y: 22, duration: 0.5 })

      // Stat cards stagger
      tl.from(".dash-stat-card", {
        opacity: 0,
        y: 28,
        scale: 0.97,
        stagger: 0.07,
        duration: 0.5,
        ease: "back.out(1.4)",
      }, "-=0.2")

      // Featured project
      tl.from("#dash-featured", {
        opacity: 0,
        y: 24,
        duration: 0.55,
      }, "-=0.25")

      // Project grid cards
      tl.from(".dash-project-card", {
        opacity: 0,
        y: 20,
        stagger: 0.06,
        duration: 0.45,
      }, "-=0.3")
    })

    return () => ctx.revert()
  }, [])

  return null
}
