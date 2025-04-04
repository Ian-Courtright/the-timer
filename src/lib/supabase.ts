import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

// Use environment variables or directly paste URL and key for development
// In production, always use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://poonsqijimozbkxfcesj.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb25zcWlqaW1vemJreGZjZXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5MDM2NjIsImV4cCI6MjAzMjQ3OTY2Mn0.6JFZLzc4R5DhJXdypwcJ2HaFwJxPx0JMaXHH__E3hZY'

// Initialize the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey) 