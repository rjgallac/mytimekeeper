import axios from 'axios'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import TimeEntryForm from '@/components/form/TimeEntryForm'
import TimeEntriesList from '@/components/list/TimeEntriesList'
import { useForm } from '@/hooks/useForm'
import { useEntries } from '@/hooks/useEntries'

/**
 * Main application component - orchestrates form and list components
 */
function App() {
  const [weekStart, setWeekStart] = useState(new Date().toISOString().split('T')[0])
  
  const { entry, setEntry, editingId, setEditingId, resetForm, handleEdit } = useForm()
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useEntries(weekStart)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateEntry(editingId, entry)
      } else {
        await addEntry(entry)
      }
      resetForm()
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return
    try {
      await deleteEntry(id)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleWeekChange = async (direction) => {
    try {
      const newDate = await window.navigateWeek(direction)
      setWeekStart(newDate)
    } catch (error) {
      console.error('Error navigating week:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-background p-8 flex items-center justify-center">Loading...</div>
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
