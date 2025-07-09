/*
  # Add metadata and blockchain columns to carbon_projects

  1. Changes
    - Add `metadata_uri` column to store metadata URIs (if not exists)
    - Add `blockchain_tx_hash` column to store transaction hashes (if not exists)
  
  2. Security
    - No RLS changes needed as these are additional columns to existing table
*/

-- Add metadata_uri column to carbon_projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carbon_projects' AND column_name = 'metadata_uri'
  ) THEN
    ALTER TABLE public.carbon_projects ADD COLUMN metadata_uri TEXT;
  END IF;
END $$;

-- Add blockchain_tx_hash column for storing transaction hashes if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carbon_projects' AND column_name = 'blockchain_tx_hash'
  ) THEN
    ALTER TABLE public.carbon_projects ADD COLUMN blockchain_tx_hash TEXT;
  END IF;
END $$;