-- Enable Row Level Security on carbon_transactions table
ALTER TABLE public.carbon_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for carbon_transactions
CREATE POLICY "Users can view all transactions" 
ON public.carbon_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create transactions" 
ON public.carbon_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add credit transactions tracking
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  buyer_id UUID REFERENCES public.profiles(user_id),
  seller_id UUID REFERENCES public.profiles(user_id),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_per_credit NUMERIC NOT NULL CHECK (price_per_credit > 0),
  total_amount NUMERIC GENERATED ALWAYS AS (quantity * price_per_credit) STORED,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'retirement', 'transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  blockchain_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Enable RLS on credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for credit_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Enable realtime for key tables
ALTER TABLE public.carbon_projects REPLICA IDENTITY FULL;
ALTER TABLE public.credit_transactions REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;