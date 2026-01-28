-- RODE ESTE COMANDO NO SQL EDITOR DO SUPABASE
-- Para habilitar o módulo financeiro

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS price numeric;
