import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

/**
 * Custom hook for fetching and managing time entries with week navigation
 * @param {string} weekStart - The start date of the current week (ISO format)
 * @returns {Object} Entries state, loading status, and navigation handlers
 */
export const useEntries = (weekStart) => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true)
        const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
        const response = await axios.get('/api/entries', {
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

  const addEntry = async (entryData) => {
    try {
      const response = await axios.post('/api/entries', entryData)
      setEntries((prev) => [...prev, response.data])
    } catch (error) {
      console.error('Error saving entry:', error)
      throw error
    }
  }

  const updateEntry = async (id, entryData) => {
    try {
      await axios.put(`/api/entries/${id}`, entryData)
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...entryData } : e)))
    } catch (error) {
      console.error('Error updating entry:', error)
      throw error
    }
  }

  const deleteEntry = async (id) => {
    try {
      await axios.delete(`/api/entries/${id}`)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
      throw error
    }
  }

  const navigateWeek = useCallback((direction) => {
    return new Promise((resolve) => {
      const d = new Date(weekStart)
      if (direction === 'prev') {
        d.setDate(d.getDate() - 7)
      } else {
        d.setDate(d.getDate() + 7)
      }
      resolve(d.toISOString().split('T')[0])
    })
  }, [weekStart])

  return { entries, loading, addEntry, updateEntry, deleteEntry, navigateWeek }
}
