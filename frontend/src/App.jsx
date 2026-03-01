import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const defaultDate = new Date().toISOString().slice(0, 10);
  const [entry, setEntry] = useState({
    date: defaultDate,
    morningStart: '',
    morningEnd: '',
    afternoonStart: '',
    afternoonEnd: '',
    comment: '',
    tasks: ''
  });
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // week navigation state, start on current week's Monday
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday=0
    const diff = (day + 6) % 7; // shift so Monday=0
    d.setDate(d.getDate() - diff);
    return d.toISOString().slice(0,10);
  };
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));

  useEffect(() => {
    fetchEntries();
  }, [weekStart]);

  const fetchEntries = async () => {
    try {
      const start = weekStart;
      const endDate = new Date(start);
      endDate.setDate(endDate.getDate() + 6);
      const end = endDate.toISOString().slice(0,10);
      const res = await axios.get(`/api/entries?start=${start}&end=${end}`);
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to load entries', err);
    }
  };

  const handleChange = (e) => {
    setEntry({ ...entry, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/entries/${editingId}`, entry);
        alert('Updated');
      } else {
        await axios.post('/api/entries', entry);
        alert('Saved');
      }
      setEntry({
        date: defaultDate,
        morningStart: '',
        morningEnd: '',
        afternoonStart: '',
        afternoonEnd: '',
        comment: '',
        tasks: ''
      });
      setEditingId(null);
      fetchEntries();
    } catch (err) {
      console.error(err);
      alert('Error saving');
    }
  };

  const handleEdit = (item) => {
    setEntry({
      date: item.date.slice(0,10),
      morningStart: item.morning_start || '',
      morningEnd: item.morning_end || '',
      afternoonStart: item.afternoon_start || '',
      afternoonEnd: item.afternoon_end || '',
      comment: item.comment || '',
      tasks: item.tasks || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete(`/api/entries/${id}`);
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // calculate minutes between two HH:MM strings
  const diffMinutes = (start, end) => {
    if (!start || !end) return 0;
    const [h1,m1]=start.split(':').map(Number);
    const [h2,m2]=end.split(':').map(Number);
    return (h2*60+m2) - (h1*60+m1);
  };

  const dailyMinutes = (item) => {
    const m1 = diffMinutes(item.morning_start, item.morning_end);
    const m2 = diffMinutes(item.afternoon_start, item.afternoon_end);
    return m1 + m2;
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins/60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const weekTotal = entries.reduce((sum, it) => sum + dailyMinutes(it), 0);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(getWeekStart(d));
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(getWeekStart(d));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Timekeeper</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div>
          <label>Date: <input type="date" name="date" value={entry.date} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Morning start: <input type="time" name="morningStart" value={entry.morningStart} onChange={handleChange} /></label>
          <label> Morning end: <input type="time" name="morningEnd" value={entry.morningEnd} onChange={handleChange} /></label>
        </div>
        <div>
          <label>Afternoon start: <input type="time" name="afternoonStart" value={entry.afternoonStart} onChange={handleChange} /></label>
          <label> Afternoon end: <input type="time" name="afternoonEnd" value={entry.afternoonEnd} onChange={handleChange} /></label>
        </div>
        <div>
          <label>Comment:<br /><textarea name="comment" value={entry.comment} onChange={handleChange} /></label>
        </div>
        <div>
          <label>Tasks:<br /><textarea name="tasks" value={entry.tasks} onChange={handleChange} /></label>
        </div>
        <button type="submit">{editingId ? 'Update' : 'Save'}</button>
        {editingId && <button type="button" onClick={() => {setEditingId(null); setEntry({date: defaultDate, morningStart:'',morningEnd:'',afternoonStart:'',afternoonEnd:'',comment:'',tasks:''});}}>Cancel</button>}
      </form>

      <h2>Entries</h2>
      <div style={{ marginBottom: '0.5rem' }}>
        <button onClick={prevWeek}>&larr; Previous week</button>
        <span style={{ margin: '0 1rem' }}>Week starting {weekStart}</span>
        <button onClick={nextWeek}>Next week &rarr;</button>
      </div>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Morning</th>
            <th>Afternoon</th>
            <th>Duration</th>
            <th>Comment</th>
            <th>Tasks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((item) => (
            <tr key={item.id}>
              <td>{item.date.slice(0,10)}</td>
              <td>{item.morning_start || ''} - {item.morning_end || ''}</td>
              <td>{item.afternoon_start || ''} - {item.afternoon_end || ''}</td>
              <td>{formatDuration(dailyMinutes(item))}</td>
              <td>{item.comment}</td>
              <td>{item.tasks}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3"><strong>Weekly total</strong></td>
            <td><strong>{formatDuration(weekTotal)}</strong></td>
            <td colSpan="3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default App;
