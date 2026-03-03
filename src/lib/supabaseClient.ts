import { createClient } from '@supabase/supabase-js'

// Sostituisci con i tuoi dati che trovi nella dashboard di Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)