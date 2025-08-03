import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://khopmffxdhnjhxqrmuxx.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtob3BtZmZ4ZGhuamh4cXJtdXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1OTI5NDQsImV4cCI6MjA0NzE2ODk0NH0.a5y3sxSwi4F-JBhP_bgb_52_s_KGULp7vJEFQQQbOqA"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)