import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oroxzyoyoeymxvcxrsdm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb3h6eW95b2V5bXh2Y3hyc2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTI1NjAsImV4cCI6MjA4MzYyODU2MH0.wBd29Mnwce0w6GnYxjolIHmyu248S6JLGQ8eu1grgO8'

export const supabase = createClient(supabaseUrl, supabaseKey)