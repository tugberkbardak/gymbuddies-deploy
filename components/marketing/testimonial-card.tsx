"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  avatarSrc: string
}

export default function TestimonialCard({ quote, author, role, avatarSrc }: TestimonialCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full transition-all hover:shadow-md bg-black border-gray-800">
        <CardContent className="pt-6">
          <Quote className="h-8 w-8 text-[#40E0D0]/40 mb-2" />
          <p className="text-gray-400">{quote}</p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={avatarSrc} alt={author} />
              <AvatarFallback>{author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{author}</p>
              <p className="text-xs text-gray-400">{role}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

