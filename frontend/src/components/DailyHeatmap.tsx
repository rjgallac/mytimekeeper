import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface DailyData {
  [date: string]: number
}

const MAX_HOURS = 16
const DAYS_PER_ROW = 7
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const DailyHeatmap: React.FC = () => {
  const [dailyHours, setDailyHours] = useState<DailyData>({})
  const [loading, setLoading] = useState(true)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        setLoading(true)
        const startDate = `${currentYear}-01-01`
        const endDate = `${currentYear}-12-31`
        
        const response = await axios.get('http://localhost:3001/api/entries', {
          params: { start: startDate, end: endDate }
        })

        const hoursByDate: DailyData = {}
        response.data.forEach((entry: any) => {
          const dateObj = new Date(entry.date)
          const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
          
          const morningHours = entry.morning_start && entry.morning_end
            ? (new Date('1970-01-01T' + entry.morning_end + 'Z').getTime() - new Date('1970-01-01T' + entry.morning_start + 'Z').getTime()) / 3600000
            : 0
          const afternoonHours = entry.afternoon_start && entry.afternoon_end
            ? (new Date('1970-01-01T' + entry.afternoon_end + 'Z').getTime() - new Date('1970-01-01T' + entry.afternoon_start + 'Z').getTime()) / 3600000
            : 0
          const total = morningHours + afternoonHours
          
          if (total > 0) {
            hoursByDate[dateStr] = total
          }
        })

        setDailyHours(hoursByDate)
      } catch (error) {
        console.error('Error fetching daily data:', error)
        setDailyHours({})
      } finally {
        setLoading(false)
      }
    }

    fetchDailyData()
  }, [currentYear])

  const getIntensityColor = (hours: number): string => {
    if (hours === 0) return 'bg-gray-100'
    
    const intensity = Math.min(hours / MAX_HOURS, 1)
    
    if (intensity <= 0.25) return 'bg-green-300'
    if (intensity <= 0.5) return 'bg-green-400'
    if (intensity <= 0.75) return 'bg-green-500'
    return 'bg-green-600'
  }

  const generateGrid = () => {
    const startDate = new Date(currentYear, 0, 1)
    const endDate = new Date(currentYear, 11, 31)
    
    let firstDay = new Date(startDate)
    while (firstDay.getDay() !== 0) {
      firstDay.setDate(firstDay.getDate() - 1)
    }
    
    const weeks: React.ReactNode[][] = []
    let currentWeekStart = new Date(firstDay)
    
    while (currentWeekStart <= endDate || !weeks.some(w => w[6])) {
      const weekDays: React.ReactNode[] = []
      
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentWeekStart)
        dayDate.setDate(currentWeekStart.getDate() + i)
        
        if (dayDate > endDate) {
          weekDays.push(<div key={`end-${i}`} className="w-3" />)
        } else {
          const isBeforeYearStart = dayDate < startDate
          
          weekDays.push(
            <div
              key={dayDate.toISOString()}
              className={`w-3 h-3 rounded-sm ${isBeforeYearStart ? 'invisible' : getIntensityColor(dailyHours[dayDate.toISOString().split('T')[0]] || 0)}`}
              title={isBeforeYearStart ? '' : `${dayDate.toISOString().split('T')[0]}: ${(dailyHours[dayDate.toISOString().split('T')[0]] || 0).toFixed(1)} hours`}
            />
          )
        }
      }
      
      weeks.push(weekDays)
      currentWeekStart = new Date(currentWeekStart)
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }
    
    const grid = []
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const row = weeks.map(week => week[dayOfWeek])
      
      grid.push(
        <div key={dayOfWeek} className="flex gap-0.5">
          <span className="w-8 text-[10px] text-muted-foreground">{DAY_NAMES[dayOfWeek].charAt(0)}</span>
          {row}
        </div>
      )
    }
    
    return grid
  }

  if (loading) {
    return <div className="mt-4 text-sm text-muted-foreground">Loading...</div>
  }

  const totalHours = Object.values(dailyHours).reduce((sum, hours) => sum + hours, 0)
  const workingDays = Object.keys(dailyHours).length

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{currentYear} Daily Activity</h3>
        <span className="text-xs text-muted-foreground">
          {workingDays} days logged · {totalHours.toFixed(1)} total hours
        </span>
      </div>

     
      <div className="flex flex-col gap-0.5 p-2 bg-gray-50 rounded-lg border max-w-full overflow-x-auto">
        {generateGrid()}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground gap-4">
        <span>Fewer</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-300" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
        </div>
        <span>More</span>
      </div>

      <div className="flex items-center justify-end mt-1 text-[10px] text-muted-foreground gap-2">
        <div className="w-3 h-3 rounded-sm bg-green-500 ring-1 ring-black" />
        Today
      </div>
    </div>
  )
}

export default DailyHeatmap
