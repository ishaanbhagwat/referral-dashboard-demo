-- Create fax_queue table
CREATE TABLE IF NOT EXISTS fax_queue (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  file_url TEXT NOT NULL -- URL or path to the uploaded TIFF file
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  patient_name TEXT,
  patient_id TEXT,
  referring_provider TEXT,
  referring_practice TEXT,
  specialty TEXT,
  urgency TEXT,
  received_at TIMESTAMP,
  current_status TEXT,
  status_progress INTEGER,
  has_missing_info BOOLEAN,
  documents JSONB,
  extracted_info JSONB
); 