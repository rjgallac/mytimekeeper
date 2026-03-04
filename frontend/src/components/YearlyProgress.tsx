import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface YearlyProgressProps {
  year: number
}

const WEEKLY_TARGET = 37.5
const TOTAL_BLOCKS = 52

export const YearlyProgress: React.FC<YearlyProgressProps> = ({ year }) => {
  const [weeklyHours, setWeeklyHours] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:3001/api/yearly-summary', {
          params: { year }
        })
        setWeeklyHours(response.data.weeklyHours || {})
      } catch (error) {
        console.error('Error fetching yearly summary:', error)
        setWeeklyHours({})
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [year])

  if (loading) {
    return <div className="mt-4 text-sm text-muted-foreground">Loading...</div>
  }

  const blocks = []
  
  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    let colorClass = 'bg-gray-100' // blank - no data
    
    const weekStartKey = new Date(year, 0, 1 + i * 7).toISOString().split('T')[0]
    const hours = weeklyHours[weekStartKey]

    if (hours !== undefined && hours !== null) {
      if (hours < WEEKLY_TARGET - 2) {
        colorClass = 'bg-green-300' // under target (light green)
      } else if (hours >= WEEKLY_TARGET - 2 && hours <= WEEKLY_TARGET + 2) {
        colorClass = 'bg-green-500' // on target (green)
      } else {
        colorClass = 'bg-green-700' // over target (dark green)
      }
    }

    blocks.push(
      <div
        key={i}
        className={`w-2 h-4 rounded-sm ${colorClass}`}
        title={`Week ${i + 1}: ${hours !== undefined ? hours.toFixed(1) : 'No data'} hrs`}
      />
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{year} Yearly Progress</h3>
        <span className="text-xs text-muted-foreground">52 weeks</span>
      </div>
      <div className="flex flex-wrap gap-0.5 p-2 bg-gray-50 rounded-lg border max-w-full overflow-x-auto">
        {blocks}
      </div>
      <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground gap-4">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-300" /> Under
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" /> Target
        </span>
        <span className="flex items-center gap-1">
          Over
          <div className="w-3 h-3 rounded-sm bg-green-700" />
        </span>
      </div>
    </div>
  )
}

export default YearlyProgress
