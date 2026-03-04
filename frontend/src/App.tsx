import axios from 'axios'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TimeEntryForm from '@/components/form/TimeEntryForm'
import TimeEntriesList from '@/components/list/TimeEntriesList'
import { useForm } from '@/hooks/useForm'
import { useEntries } from '@/hooks/useEntries'
import { FormHookResult, EntriesHookResult, TimeEntry } from '@/types'

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState<string>(new Date().toISOString().split('T')[0])
  
  const { entry, setEntry, editingId, setEditingId, resetForm, handleEdit }: FormHookResult = useForm()
  const { entries, loading, addEntry, updateEntry, deleteEntry }: EntriesHookResult = useEntries(weekStart)

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this entry?')) return
    try {
      await deleteEntry(id)
    } catch (error) {
      console.error('Delete failed:', error)
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
