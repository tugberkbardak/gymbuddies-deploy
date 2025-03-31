"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"

interface StatCardProps {
  value: string
  label: string
}

export default function StatCard({ value, label }: StatCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="text-center p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={hasAnimated ? { y: 0 } : { y: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-3xl md:text-4xl font-bold text-[#40E0D0]">{value}</div>
        <div className="text-sm text-gray-400 mt-1">{label}</div>
      </motion.div>
    </motion.div>
  )
}

