/*
  # Add latitude and longitude columns to breweries table

  1. Changes
    - Add `latitude` column (double precision, nullable)
    - Add `longitude` column (double precision, nullable)
  
  2. Notes
    - Columns are nullable to accommodate existing breweries without coordinate data
    - Uses double precision for accurate geographic coordinates
*/

-- Add latitude and longitude columns to breweries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'breweries' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE breweries ADD COLUMN latitude double precision;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'breweries' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE breweries ADD COLUMN longitude double precision;
  END IF;
END $$;