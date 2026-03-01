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
