-- Create vendor_uploads table for tracking file uploads
CREATE TABLE IF NOT EXISTS vendor_uploads (
  upload_id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'processed',
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  error_message TEXT,
  products_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendor_uploads_vendor_id ON vendor_uploads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_uploads_uploaded_at ON vendor_uploads(uploaded_at DESC);
