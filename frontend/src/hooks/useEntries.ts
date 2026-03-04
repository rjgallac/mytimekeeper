import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { TimeEntry, TimeEntryFormState, EntriesHookResult } from '@/types'

export const useEntries = (weekStart: string): EntriesHookResult => {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true)
        const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
        const response = await axios.get<TimeEntry[]>('/api/entries', {
          params: { start: weekStart, end: weekEnd.toISOString().split('T')[0] }
        })
        setEntries(response.data)
      } catch (err) {
        console.error('Error fetching entries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [weekStart])

  const addEntry = useCallback(async (entryData: TimeEntryFormState) => {
    try {
      await axios.post<TimeEntry>('/api/entries', entryData)
      setEntries((prev) => [...prev, entryData as TimeEntry])
    } catch (error) {
      console.error('Error saving entry:', error)
      throw error
    }
  }, [])

  const updateEntry = useCallback(async (id: number, entryData: TimeEntryFormState) => {
    try {
      await axios.put<TimeEntry>(`/api/entries/${id}`, entryData)
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entryData } : e)))
    } catch (error) {
      console.error('Error updating entry:', error)
      throw error
    }
  }, [])

  const deleteEntry = useCallback(async (id: number) => {
    try {
      await axios.delete(`/api/entries/${id}`)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
      throw error
    }
  }, [])

  return { entries, loading, addEntry, updateEntry, deleteEntry }
}
