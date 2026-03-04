import React from 'react'
import { Button } from '@/components/ui/button.jsx'

function TimeEntriesList({ entries, weekStart, setWeekStart, handleEdit, handleDelete }) {
  const diffMinutes = (start, end) => {
    if (!start || !end) return 0
    const [h1, m1] = start.split(':').map(Number)
    const [h2, m2] = end.split(':').map(Number)
    return (h2 * 60 + m2) - (h1 * 60 + m1)
  }

  const dailyMinutes = (item) => {
    const m1 = diffMinutes(item.morning_start, item.morning_end)
    const m2 = diffMinutes(item.afternoon_start, item.afternoon_end)
    return m1 + m2
  }

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  const weekTotal = entries.reduce((sum, it) => sum + dailyMinutes(it), 0)

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

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Entries</h2>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={prevWeek} variant="outline" size="sm">&larr; Previous week</Button>
        <span className="text-sm text-muted-foreground">Week starting {new Date(weekStart).toLocaleDateString()}</span>
        <Button onClick={nextWeek} variant="outline" size="sm">Next week &rarr;</Button>
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
            {entries.map((item) => (
              <tr key={item.id} className="border-b hover:bg-accent">
                <td className="py-2 px-4">
                  {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })} 
                  {item.date.slice(0, 10)}
                </td>
                <td className="py-2 px-4">
                  {item.morning_start || ''} - {item.morning_end || ''}
                </td>
                <td className="py-2 px-4">
                  {item.afternoon_start || ''} - {item.afternoon_end || ''}
                </td>
                <td className="py-2 px-4">
                  {formatDuration(dailyMinutes(item))}
                </td>
                <td className="py-2 px-4">
                  {item.comment}
                </td>
                <td className="py-2 px-4">
                  {item.tasks}
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEdit(item)} 
                      variant="ghost" 
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(item.id)} 
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
              <td colSpan="3" className="py-2 px-4 font-semibold">
                Weekly total
              </td>
              <td className="py-2 px-4 font-semibold">
                {formatDuration(weekTotal)}
              </td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default TimeEntriesList
