import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { cn } from '@/lib/utils'

function App() {
  const [entries, setEntries] = useState([])
  const [entry, setEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    morningStart: '09:00',
    morningEnd: '12:00',
    afternoonStart: '13:00',
    afternoonEnd: '17:00',
    comment: '',
    tasks: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [weekStart, setWeekStart] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/entries/${editingId}`, entry)
      } else {
        await axios.post('/api/entries', entry)
      }
      // Refresh entries
      const response = await axios.get('/api/entries')
      setEntries(response.data)
      setEntry({
        date: new Date().toISOString().split('T')[0],
        morningStart: '09:00',
        morningEnd: '12:00',
        afternoonStart: '13:00',
        afternoonEnd: '17:00',
        comment: '',
        tasks: ''
      })
      setEditingId(null)
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const handleEdit = (item) => {
    setEntry({
      date: item.date.slice(0, 10),
      morningStart: item.morning_start || '09:00',
      morningEnd: item.morning_end || '12:00',
      afternoonStart: item.afternoon_start || '13:00',
      afternoonEnd: item.afternoon_end || '17:00',
      comment: item.comment || '',
      tasks: item.tasks || ''
    })
    setEditingId(item.id)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`/api/entries/${id}`)
      setEntries(entries.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const diffMinutes = (start, end) => {
    if (!start || !end) return 0;
    const [h1,m1]=start.split(':').map(Number);
    const [h2,m2]=end.split(':').map(Number);
    return (h2*60+m2) - (h1*60+m1);
  }

  const dailyMinutes = (item) => {
    const m1 = diffMinutes(item.morning_start, item.morning_end);
    const m2 = diffMinutes(item.afternoon_start, item.afternoon_end);
    return m1 + m2;
  }

  const formatDuration = (mins) => {
    const h = Math.floor(mins/60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  const weekTotal = entries.reduce((sum, it) => sum + dailyMinutes(it), 0);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Timekeeper</CardTitle>
          <CardDescription>Track your daily hours and manage your time effectively</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date"
                type="date" 
                value={entry.date} 
                onChange={(e) => setEntry({...entry, date: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="morningStart">Morning start</Label>
                <Input 
                  id="morningStart"
                  type="time" 
                  value={entry.morningStart} 
                  onChange={(e) => setEntry({...entry, morningStart: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="morningEnd">Morning end</Label>
                <Input 
                  id="morningEnd"
                  type="time" 
                  value={entry.morningEnd} 
                  onChange={(e) => setEntry({...entry, morningEnd: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="afternoonStart">Afternoon start</Label>
                <Input 
                  id="afternoonStart"
                  type="time" 
                  value={entry.afternoonStart} 
                  onChange={(e) => setEntry({...entry, afternoonStart: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="afternoonEnd">Afternoon end</Label>
                <Input 
                  id="afternoonEnd"
                  type="time" 
                  value={entry.afternoonEnd} 
                  onChange={(e) => setEntry({...entry, afternoonEnd: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea 
                id="comment"
                value={entry.comment} 
                onChange={(e) => setEntry({...entry, comment: e.target.value})}
                placeholder="Add any notes or comments..."
              />
            </div>
            <div>
              <Label htmlFor="tasks">Tasks</Label>
              <Textarea 
                id="tasks"
                value={entry.tasks} 
                onChange={(e) => setEntry({...entry, tasks: e.target.value})}
                placeholder="List your tasks..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update' : 'Save'}</Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setEntry({
                      date: new Date().toISOString().split('T')[0],
                      morningStart: '09:00',
                      morningEnd: '12:00',
                      afternoonStart: '13:00',
                      afternoonEnd: '17:00',
                      comment: '',
                      tasks: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

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
                        {item.date.slice(0,10)}
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
        </CardContent>
      </Card>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Button
          </button>
    </div>
  );
}

export default App;