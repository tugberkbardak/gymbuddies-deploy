"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Calendar, CheckCircle, Trophy, Users } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function HeroAnimation() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const phoneVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (custom: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3 + custom * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
  }

  return (
    <div ref={ref} className="relative w-full max-w-md mx-auto">
      {/* Phone mockup */}
      <motion.div
        variants={phoneVariants}
        initial="hidden"
        animate={controls}
        className="relative z-10 overflow-hidden rounded-[40px] border-8 border-gray-800 bg-gray-800 shadow-xl"
      >
        <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 z-20">
          <div className="mx-auto w-16 h-1 mt-1 rounded-full bg-gray-600"></div>
        </div>
        <div className="relative bg-black overflow-hidden">
          {/* App screenshot */}
          <div className="aspect-[9/19] w-full bg-gradient-to-b from-primary/10 to-black">
            <div className="p-4">
              <div className="h-10 flex items-center justify-between mb-4">
                <div className="w-24 h-6 rounded-md bg-primary/20"></div>
                <div className="w-10 h-10 rounded-full bg-primary/20"></div>
              </div>
              <div className="space-y-4">
                <div className="h-24 rounded-lg bg-gray-900 shadow-sm p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="w-20 h-5 rounded bg-primary/20"></div>
                    <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 rounded bg-gray-800"></div>
                    <div className="w-2/3 h-3 rounded bg-gray-800"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 rounded-lg bg-gray-900 shadow-sm p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 mb-2"></div>
                    <div className="w-full h-3 rounded bg-gray-800"></div>
                  </div>
                  <div className="h-20 rounded-lg bg-gray-900 shadow-sm p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 mb-2"></div>
                    <div className="w-full h-3 rounded bg-gray-800"></div>
                  </div>
                </div>
                <div className="h-40 rounded-lg bg-gray-900 shadow-sm p-3">
                  <div className="w-20 h-5 rounded bg-primary/20 mb-3"></div>
                  <div className="grid grid-cols-7 gap-1 h-20">
                    {Array(7)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-md"></div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        custom={0}
        variants={iconVariants}
        initial="hidden"
        animate={controls}
        className="absolute top-10 -left-16 z-20"
      >
        <Card className="p-3 shadow-lg bg-gray-900 border-gray-800">
          <Calendar className="h-8 w-8 text-primary" />
        </Card>
      </motion.div>

      <motion.div
        custom={1}
        variants={iconVariants}
        initial="hidden"
        animate={controls}
        className="absolute top-1/4 -right-12 z-20"
      >
        <Card className="p-3 shadow-lg bg-gray-900 border-gray-800">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </Card>
      </motion.div>

      <motion.div
        custom={2}
        variants={iconVariants}
        initial="hidden"
        animate={controls}
        className="absolute bottom-1/4 -left-14 z-20"
      >
        <Card className="p-3 shadow-lg bg-gray-900 border-gray-800">
          <Users className="h-8 w-8 text-primary" />
        </Card>
      </motion.div>

      <motion.div
        custom={3}
        variants={iconVariants}
        initial="hidden"
        animate={controls}
        className="absolute bottom-10 -right-10 z-20"
      >
        <Card className="p-3 shadow-lg bg-gray-900 border-gray-800">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </Card>
      </motion.div>
    </div>
  )
}

