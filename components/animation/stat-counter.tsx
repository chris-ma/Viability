"use client"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface StatCounterProps {
  value: number
  suffix?: string
  duration?: number
}

export function StatCounter({ value, suffix = "", duration = 1.8 }: StatCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const el = ref.current
    if (!el) return
    const obj = { val: 0 }
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: value,
          duration,
          ease: "power2.out",
          onUpdate: () => setCount(Math.round(obj.val)),
        })
      },
    })
  }, [value, duration])

  return <span ref={ref}>{count}{suffix}</span>
}
