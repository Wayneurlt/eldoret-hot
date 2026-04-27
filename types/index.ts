export interface User {
  id: number
  email: string
  name: string
  role: 'model' | 'client' | 'admin'
  avatar?: string
  phone?: string
  location?: string
  bio?: string
  created_at: string
}

export interface ModelProfile {
  id: number
  user_id: number
  user?: User
  category: string
  subcategory?: string
  rates?: string
  availability: 'available' | 'busy' | 'unavailable'
  instagram?: string
  twitter?: string
  tiktok?: string
  portfolio_images?: string[]
  tags?: string[]
  rating?: number
  total_reviews?: number
  verified: boolean
  featured: boolean
  created_at: string
  // joined from users
  name?: string
  avatar?: string
  location?: string
  bio?: string
  phone?: string
}

export interface MeetupRequest {
  id: number
  client_id: number
  model_id: number
  client?: User
  model_profile?: ModelProfile
  message: string
  project_type: string
  budget?: string
  preferred_date?: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  response_message?: string
  created_at: string
  updated_at: string
  // joined
  client_name?: string
  client_avatar?: string
  model_name?: string
  model_avatar?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export type ModelCategory =
  | 'Fashion'
  | 'Fitness & Health'
  | 'Beauty & Makeup'
  | 'Lifestyle'
  | 'Food & Cooking'
  | 'Travel'
  | 'Tech & Gaming'
  | 'Entertainment'
  | 'Sports'
  | 'Business'
  | 'Art & Culture'
  | 'Photography'

export const MODEL_CATEGORIES: ModelCategory[] = [
  'Fashion',
  'Fitness & Health',
  'Beauty & Makeup',
  'Lifestyle',
  'Food & Cooking',
  'Travel',
  'Tech & Gaming',
  'Entertainment',
  'Sports',
  'Business',
  'Art & Culture',
  'Photography',
]
