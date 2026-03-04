import { useState, useCallback } from 'react'

/**
 * Custom hook for managing time entry form state and validation
 * @returns {Object} Form state and handlers
 */
export const useForm = () => {
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

  const resetForm = useCallback(() => {
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
  }, [])

  const handleEdit = useCallback((item) => {
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
  }, [])

  return { entry, setEntry, editingId, setEditingId, resetForm, handleEdit }
}
