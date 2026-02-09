-- Add is_public column to trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Allow public access to public trips (Row Level Security)
-- Note: The backend uses Service Role Key which bypasses RLS, 
-- but this is good practice if you use the Client SDK directly.
create policy "Public trips are viewable by everyone."
  on trips for select
  using ( is_public = true );
