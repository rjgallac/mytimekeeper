require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/timekeeper',
});

// ensure table exists
const initSql = `
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  morning_start TIME,
  morning_end TIME,
  afternoon_start TIME,
  afternoon_end TIME,
  comment TEXT,
  tasks TEXT
);
`;
pool.query(initSql).catch(err => {
  console.error('Error initializing database', err);
});

// Basic health check
app.get('/', (req, res) => {
  res.send('Timekeeper API');
});

// Create a new entry
app.post('/api/entries', async (req, res) => {
  const { date, morningStart, morningEnd, afternoonStart, afternoonEnd, comment, tasks } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO entries(date, morning_start, morning_end, afternoon_start, afternoon_end, comment, tasks)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [date, morningStart, morningEnd, afternoonStart, afternoonEnd, comment, tasks]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Retrieve entries, optionally filtered by start/end date (inclusive)
app.get('/api/entries', async (req, res) => {
  try {
    const { start, end } = req.query; // expect YYYY-MM-DD
    let query = 'SELECT * FROM entries';
    const params = [];
    if (start && end) {
      params.push(start, end);
      query += ' WHERE date >= $1 AND date <= $2';
    }
    query += ' ORDER BY date ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update an entry by id
app.put('/api/entries/:id', async (req, res) => {
  const id = req.params.id;
  const { date, morningStart, morningEnd, afternoonStart, afternoonEnd, comment, tasks } = req.body;
  try {
    const result = await pool.query(
      `UPDATE entries SET date=$1, morning_start=$2, morning_end=$3, afternoon_start=$4, afternoon_end=$5, comment=$6, tasks=$7
       WHERE id=$8 RETURNING *`,
      [date, morningStart, morningEnd, afternoonStart, afternoonEnd, comment, tasks, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete an entry by id
app.delete('/api/entries/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM entries WHERE id=$1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get weekly hours summary for a specific week
app.get('/api/weekly-summary', async (req, res) => {
  try {
    const { start } = req.query; // expect YYYY-MM-DD for Sunday
    if (!start) {
      return res.status(400).json({ error: 'Start date required' });
    }

    const result = await pool.query(
      `SELECT 
        SUM(EXTRACT(EPOCH FROM (morning_end - morning_start))/3600) as morning_hours,
        SUM(EXTRACT(EPOCH FROM (afternoon_end - afternoon_start))/3600) as afternoon_hours
       FROM entries
       WHERE date >= $1 AND date < DATE($1 + INTERVAL '7 days')`,
      [start]
    );

    const totalHours = parseFloat(result.rows[0].morning_hours || 0) + 
                       parseFloat(result.rows[0].afternoon_hours || 0);

    res.json({ start, totalHours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get yearly summary for all weeks in the year
app.get('/api/yearly-summary', async (req, res) => {
  try {
    const { year } = req.query; // expect YYYY
    if (!year || !/^\d{4}$/.test(year)) {
      return res.status(400).json({ error: 'Valid year required' });
    }

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const result = await pool.query(
      `SELECT 
        date_trunc('week', date) as week_start,
        SUM(EXTRACT(EPOCH FROM (morning_end - morning_start))/3600) as morning_hours,
        SUM(EXTRACT(EPOCH FROM (afternoon_end - afternoon_start))/3600) as afternoon_hours
       FROM entries
       WHERE date >= $1 AND date <= $2
       GROUP BY week_start
       ORDER BY week_start ASC`,
      [startDate, endDate]
    );

    const weeklyData = {};
    result.rows.forEach(row => {
      weeklyData[row.week_start] = parseFloat(row.morning_hours || 0) + 
                                   parseFloat(row.afternoon_hours || 0);
    });

    res.json({ year, weeklyHours: weeklyData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
