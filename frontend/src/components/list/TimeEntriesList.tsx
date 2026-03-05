import React from 'react'
import { Button } from '@/components/ui/button'
import { diffMinutes, dailyMinutes, formatDuration } from '@/utils/timeHelpers'
import { TimeEntry } from '@/types'

interface TimeEntriesListProps {
  entries: TimeEntry[]
  weekStart: string
  setWeekStart: React.Dispatch<React.SetStateAction<string>>
  handleEdit: (item: TimeEntry) => void
  handleDelete: (id: number) => Promise<void>
}

const TimeEntriesList: React.FC<TimeEntriesListProps> = ({ 
  entries, 
  weekStart, 
  setWeekStart, 
  handleEdit, 
  handleDelete 
}) => {
  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  const weekTotal = entries.reduce((sum, it) => sum + dailyMinutes(it), 0)

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-4">Entries</h2>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={prevWeek} variant="green" size="sm">&larr; Previous week</Button>
        <span className="text-sm text-muted-foreground">Week starting {new Date(weekStart).toLocaleDateString()}</span>
        <Button onClick={nextWeek} variant="green" size="sm">Next week &rarr;</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4">Date</th>
              <th className="text-left py-2 px-4">Morning</th>
              <th className="text-left py-2 px-4">Afternoon</th>
              <th className="text-left py-2 px-4">Duration</th>
              <th className="text-left py-2 px-4">Comment</th>
              <th className="text-left py-2 px-4">Tasks</th>
              <th className="text-left py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item: TimeEntry, index: number) => (
              <tr key={item.id ?? `temp-${index}-${item.date}`} className="border-b hover:bg-accent">
                <td className="py-2 px-4">
                  {new Date(item.date).toLocaleDateString('en-GB', { weekday: 'short' })} 
                  &nbsp;
                  {item.date.slice(0, 10)}
                </td>
                <td className="py-2 px-4">
                  {item.morning_start?.slice(0,5) || ''} - {item.morning_end?.slice(0,5) || ''}
                </td>
                <td className="py-2 px-4">
                  {item.afternoon_start?.slice(0,5) || ''} - {item.afternoon_end?.slice(0,5) || ''}
                </td>
                <td className="py-2 px-4">
                  {formatDuration(dailyMinutes(item))}
                </td>
                <td className="py-2 px-4">{item.comment}</td>
                <td className="py-2 px-4">{item.tasks}</td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(item)} variant="ghost" size="sm">Edit</Button>
                    <Button 
                      onClick={() => item.id && handleDelete(item.id)} 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted">
              <td colSpan="3" className="py-2 px-4 font-semibold">Weekly total</td>
              <td className="py-2 px-4 font-semibold">{formatDuration(weekTotal)}</td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default TimeEntriesList
