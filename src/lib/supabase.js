import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const PLACEHOLDER_VALUES = ['https://your-project.supabase.co', 'your-anon-key-here']

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !PLACEHOLDER_VALUES.includes(supabaseUrl) &&
  !PLACEHOLDER_VALUES.includes(supabaseAnonKey)
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const PHOTO_BUCKET = 'baby-photos'

// crypto.randomUUID is only available in secure contexts (HTTPS / localhost)
export const newId = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
