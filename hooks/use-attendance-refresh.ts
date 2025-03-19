"use client"

import { useRef } from "react"

export function useAttendanceRefresh() {
  const attendanceListRef = useRef(null)

  // Function to refresh the attendance list
  const refreshAttendanceList = () => {
    if (attendanceListRef.current && typeof attendanceListRef.current.refreshAttendances === "function") {
      attendanceListRef.current.refreshAttendances()
    }
  }

  return {
    attendanceListRef,
    refreshAttendanceList,
  }
}

