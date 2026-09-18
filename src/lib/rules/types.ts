export interface Rule {
  id: string
  user_id: string
  name: string
  description: string
  enabled: boolean
  is_default: boolean
  produces_gap: boolean
  created_at: string
  updated_at: string
}
