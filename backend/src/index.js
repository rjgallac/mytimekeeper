require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://timekeeper.sheffieldwebprogrammer.co.uk",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy((username, password, done) => {
    if (
      username === process.env.AUTH_USERNAME &&
      password === process.env.AUTH_PASSWORD
    ) {
      return done(null, { id: 1, username });
    } else {
      return done(null, false, { message: "Incorrect username or password." });
    }
  }),
);

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.serializeUser((user, done) => {
  done(null, user);
});

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/timekeeper",
  timezone: "UTC",
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
pool.query(initSql).catch((err) => {
  console.error("Error initializing database", err);
});

// Login endpoint
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});

// Apply authentication to all api routes (except login)
app.use("/api", isAuthenticated);

// Get current user info
app.get("/api/me", (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

// Basic health check
app.get("/", (req, res) => {
  res.send("Timekeeper API");
});

// Create a new entry
app.post("/api/entries", async (req, res) => {
  const {
    date,
    morningStart,
    morningEnd,
    afternoonStart,
    afternoonEnd,
    comment,
    tasks,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO entries(date, morning_start, morning_end, afternoon_start, afternoon_end, comment, tasks)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        date,
        morningStart,
        morningEnd,
        afternoonStart,
        afternoonEnd,
        comment,
        tasks,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Retrieve entries, optionally filtered by start/end date (inclusive)
app.get("/api/entries", async (req, res) => {
  try {
    const { start, end } = req.query; // expect YYYY-MM-DD
    let query = "SELECT * FROM entries";
    const params = [];
    if (start && end) {
      params.push(start, end);
      query += " WHERE date >= $1 AND date <= $2";
    }
    query += " ORDER BY date ASC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update an entry by id
app.put("/api/entries/:id", async (req, res) => {
  const id = req.params.id;
  const {
    date,
    morningStart,
    morningEnd,
    afternoonStart,
    afternoonEnd,
    comment,
    tasks,
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE entries SET date=$1, morning_start=$2, morning_end=$3, afternoon_start=$4, afternoon_end=$5, comment=$6, tasks=$7
       WHERE id=$8 RETURNING *`,
      [
        date,
        morningStart,
        morningEnd,
        afternoonStart,
        afternoonEnd,
        comment,
        tasks,
        id,
      ],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete an entry by id
app.delete("/api/entries/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("DELETE FROM entries WHERE id=$1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get weekly hours summary for a specific week
app.get("/api/weekly-summary", async (req, res) => {
  try {
    const { start } = req.query; // expect YYYY-MM-DD for Sunday
    if (!start) {
      return res.status(400).json({ error: "Start date required" });
    }

    const result = await pool.query(
      `SELECT
        SUM(EXTRACT(EPOCH FROM (morning_end - morning_start))/3600) as morning_hours,
        SUM(EXTRACT(EPOCH FROM (afternoon_end - afternoon_start))/3600) as afternoon_hours
       FROM entries
       WHERE date >= $1 AND date < DATE($1 + INTERVAL '7 days')`,
      [start],
    );

    const totalHours =
      parseFloat(result.rows[0].morning_hours || 0) +
      parseFloat(result.rows[0].afternoon_hours || 0);

    res.json({ start, totalHours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get yearly summary for all weeks in the year
app.get("/api/yearly-summary", async (req, res) => {
  try {
    const { year } = req.query; // expect YYYY
    if (!year || !/^\d{4}$/.test(year)) {
      return res.status(400).json({ error: "Valid year required" });
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
      [startDate, endDate],
    );

    const weeklyData = {};
    result.rows.forEach((row) => {
      weeklyData[row.week_start] =
        parseFloat(row.morning_hours || 0) +
        parseFloat(row.afternoon_hours || 0);
    });

    res.json({ year, weeklyHours: weeklyData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
