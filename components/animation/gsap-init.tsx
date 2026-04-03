"use client"
import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"

export function GsapInit() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin)
    // Default ease for the whole app
    gsap.defaults({ ease: "power2.out" })
  }, [])
  return null
}
