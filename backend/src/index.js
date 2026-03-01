require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
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
    query += ' ORDER BY date DESC';
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

// More routes (get entries, update, etc.) can be added later

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
