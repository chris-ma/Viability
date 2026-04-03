"use client"
import { useEffect } from "react"
import gsap from "gsap"

export function HeroAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from("#hero-badge",   { opacity: 0, y: 20, duration: 0.5 })
      tl.from(".gsap-hero-word", { opacity: 0, y: 44, stagger: 0.055, duration: 0.55 }, "-=0.2")
      tl.from("#hero-sub",     { opacity: 0, y: 18, duration: 0.45 }, "-=0.35")
      tl.from("#hero-desc",    { opacity: 0, y: 14, duration: 0.4 },  "-=0.3")
      tl.from("#hero-ctas",    { opacity: 0, y: 14, duration: 0.4 },  "-=0.25")
      tl.from("#hero-mockup",  { opacity: 0, y: 32, scale: 0.96, duration: 0.75 }, "-=0.25")
    })
    return () => ctx.revert()
  }, [])

  return null
}
