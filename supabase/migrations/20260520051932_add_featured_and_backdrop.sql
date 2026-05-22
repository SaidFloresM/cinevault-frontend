/*
  # Add featured and backdrop columns to movies

  Adds:
  - `is_featured` boolean on movies for hero section
  - `backdrop_url` text on movies for wide banner images
  - Sets first 3 movies as featured
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'movies' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE movies ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'movies' AND column_name = 'backdrop_url'
  ) THEN
    ALTER TABLE movies ADD COLUMN backdrop_url text DEFAULT '';
  END IF;
END $$;

-- Mark some movies as featured
UPDATE movies SET is_featured = true
WHERE id IN (
  SELECT id FROM movies ORDER BY rating DESC LIMIT 4
);
