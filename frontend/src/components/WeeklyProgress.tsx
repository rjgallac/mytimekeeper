import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface WeeklyProgressProps {
  weekStart: string
}

const WEEKLY_TARGET = 37.5
const BLOCKS_PER_DAY = 2 // Assuming 2 blocks per day (morning/afternoon) or similar granularity
const TOTAL_BLOCKS = 52

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ weekStart }) => {
  const [totalHours, setTotalHours] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:3001/api/weekly-summary', {
          params: { start: weekStart }
        })
        setTotalHours(response.data.totalHours || 0)
      } catch (error) {
        console.error('Error fetching weekly summary:', error)
        setTotalHours(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [weekStart])

  if (loading) {
    return <div className="mt-4 text-sm text-muted-foreground">Loading...</div>
  }

  const blocks = []
  const hoursPerBlock = WEEKLY_TARGET / TOTAL_BLOCKS

  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    let colorClass = 'bg-gray-200' // blank - no data

    if (totalHours !== null) {
      const accumulatedHours = (i + 1) * hoursPerBlock
      
      if (accumulatedHours <= totalHours * 0.95) {
        colorClass = 'bg-green-600' // over target (dark green)
      } else if (accumulatedHours >= totalHours * 1.05 && accumulatedHours <= WEEKLY_TARGET) {
        colorClass = 'bg-green-400' // under target (light green)
      } else {
        colorClass = 'bg-green-500' // on target (green)
      }
    }

    blocks.push(
      <div
        key={i}
        className={`w-3 h-3 rounded-sm ${colorClass}`}
        title={`Block ${i + 1}: ${(totalHours !== null ? hoursPerBlock : 0).toFixed(1)} hrs`}
      />
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Weekly Progress</h3>
        {totalHours !== null && (
          <span className="text-sm text-muted-foreground">
            {totalHours.toFixed(1)} / {WEEKLY_TARGET} hours
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-0.5 p-2 bg-gray-50 rounded-lg border">
        {blocks}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>Under</span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          On Target
        </span>
        <span className="flex items-center gap-1">
          Over
          <div className="w-3 h-3 rounded-sm bg-green-600" />
        </span>
      </div>
    </div>
  )
}

export default WeeklyProgress
