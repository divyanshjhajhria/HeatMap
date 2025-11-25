-- Add public/private and caption fields to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS caption TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for public photos
CREATE INDEX IF NOT EXISTS idx_photos_is_public ON photos(is_public) WHERE is_public = true;

