
-- Add metadata_uri column to carbon_projects table
ALTER TABLE public.carbon_projects 
ADD COLUMN metadata_uri TEXT;

-- Add blockchain_tx_hash column for storing transaction hashes
ALTER TABLE public.carbon_projects 
ADD COLUMN blockchain_tx_hash TEXT;
