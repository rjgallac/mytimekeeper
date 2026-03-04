import React from 'react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TimeEntryFormState, FormHookResult } from '@/types'

interface TimeEntryFormProps extends Omit<FormHookResult, 'setEntry' | 'setEditingId'> {
  setEntry: React.Dispatch<React.SetStateAction<TimeEntryFormState>>
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>
  handleSubmit: (e: React.FormEvent) => void
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ 
  entry, 
  setEntry, 
  editingId, 
  setEditingId, 
  handleSubmit 
}) => (
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
          onClick={() => setEditingId(null)}
        >
          Cancel
        </Button>
      )}
    </div>
  </form>
)

export default TimeEntryForm
