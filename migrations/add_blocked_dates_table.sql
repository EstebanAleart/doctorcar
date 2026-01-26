CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    reason TEXT
);