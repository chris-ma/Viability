"use client"
import { useEffect } from "react"
import gsap from "gsap"

export function IdeasAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from("#ideas-header", { opacity: 0, y: 20, duration: 0.45 })
      tl.from(".ideas-card", {
        opacity: 0,
        y: 22,
        stagger: 0.07,
        duration: 0.45,
        ease: "back.out(1.2)",
      }, "-=0.2")
    })
    return () => ctx.revert()
  }, [])

  return null
}
