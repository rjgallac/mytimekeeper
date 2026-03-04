import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import TimeEntryForm from './TimeEntryForm'
import TimeEntriesList from './TimeEntriesList'

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

  useEffect(() => {
    const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
    axios.get('/api/entries', { params: { start: weekStart, end: weekEnd.toISOString().split('T')[0] } })
      .then(response => setEntries(response.data))
      .catch(err => console.error('Error fetching entries:', err))
  }, [weekStart])

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
    if (!window.confirm('Delete this entry?')) return
    try {
      await axios.delete(`/api/entries/${id}`)
      setEntries(entries.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Timekeeper</CardTitle>
          <CardDescription>Track your daily hours and manage your time effectively</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeEntryForm 
            entry={entry} 
            setEntry={setEntry} 
            editingId={editingId}
            setEditingId={setEditingId}
            handleSubmit={handleSubmit}
          />

          <TimeEntriesList 
            entries={entries}
            weekStart={weekStart}
            setWeekStart={setWeekStart}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default App
