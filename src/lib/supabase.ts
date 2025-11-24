import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bobqjiglcwdzqnqkfgak.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYnFqaWdsY3dkenFucWtmZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDI5OTgsImV4cCI6MjA3NDMxODk5OH0.LMkFOvumbGiqq585GtECycmA0uzAPKMhHA6TlTLIVQI'

console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  envVars: {
    url: !!import.meta.env.VITE_SUPABASE_URL,
    key: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  }
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)