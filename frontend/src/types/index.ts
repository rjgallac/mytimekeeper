// Time Entry data types

export interface TimeEntry {
  id?: number
  date: string
  morning_start: string | null
  morning_end: string | null
  afternoon_start: string | null
  afternoon_end: string | null
  comment: string | null
  tasks: string | null
}

export interface TimeEntryFormState extends Omit<TimeEntry, 'id' | 'morning_start' | 'morning_end' | 'afternoon_start' | 'afternoon_end'> {
  morningStart: string
  morningEnd: string
  afternoonStart: string
  afternoonEnd: string
}

export interface WeekNavigationResult {
  weekStart: string
  entries: TimeEntry[]
  loading: boolean
  addEntry: (entryData: TimeEntryFormState) => Promise<void>
  updateEntry: (id: number, entryData: TimeEntryFormState) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
}

export interface FormHookResult {
  entry: TimeEntryFormState
  setEntry: React.Dispatch<React.SetStateAction<TimeEntryFormState>>
  editingId: number | null
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>
  resetForm: () => void
  handleEdit: (item: TimeEntry) => void
}

export interface EntriesHookResult {
  entries: TimeEntry[]
  loading: boolean
  addEntry: (entryData: TimeEntryFormState) => Promise<void>
  updateEntry: (id: number, entryData: TimeEntryFormState) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
}
