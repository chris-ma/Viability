"use client"
import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function ResultsAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Page header
      tl.from("#results-header", { opacity: 0, y: 22, duration: 0.5 })

      // Action plan card
      tl.from("#results-action-plan", { opacity: 0, y: 20, duration: 0.5 }, "-=0.2")

      // Verdict panel (gauge + radar) — scale in from slightly smaller
      tl.from("#results-verdict-panel", {
        opacity: 0,
        y: 24,
        scale: 0.98,
        duration: 0.6,
        ease: "back.out(1.3)",
      }, "-=0.2")

      // Dimension bars — stagger each row on scroll
      gsap.from(".results-dim-bar", {
        scrollTrigger: {
          trigger: ".results-dim-bar",
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        x: -20,
        stagger: 0.06,
        duration: 0.4,
      })

      // Fix-It module cards on scroll
      gsap.from(".results-fixit-card", {
        scrollTrigger: {
          trigger: ".results-fixit-card",
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.5,
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
