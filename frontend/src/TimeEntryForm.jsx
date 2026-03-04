import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { CardContent } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'

function TimeEntryForm({ entry, setEntry, editingId, setEditingId, handleSubmit }) {
  return (
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
        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">{editingId ? 'Update' : 'Save'}</Button>
        {editingId && (
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setEditingId(null)
              setEntry({
                date: new Date().toISOString().split('T')[0],
                morningStart: '09:00',
                morningEnd: '12:00',
                afternoonStart: '13:00',
                afternoonEnd: '17:00',
                comment: '',
                tasks: ''
              })
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default TimeEntryForm
