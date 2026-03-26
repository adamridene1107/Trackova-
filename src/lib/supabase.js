import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yxxsawqbwjzjsynhjpus.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eHNhd3Fid2p6anN5bmhqcHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDExNTEsImV4cCI6MjA5MDExNzE1MX0.Cjo0FoBtwQlpdKn5XH71VdYtetRMkwzzFYuMC_gNyX0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)