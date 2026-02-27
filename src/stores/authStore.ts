import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface AdminUser {
  admin_id: string
  username: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_login: string | null
}

interface AuthState {
  admin: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  serverConnected: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkServerConnection: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  serverConnected: false,

  checkServerConnection: async () => {
    try {
      const { error } = await supabase
        .from('sectors')
        .select('sector_id')
        .limit(1)
      set({ serverConnected: !error })
    } catch {
      set({ serverConnected: false })
    }
  },
 

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      if (username === 'admin' && password === '#@superuser#@') {
        const now = new Date().toISOString()
        const adminUser: AdminUser = {
          admin_id: 'local-admin',
          username: 'admin',
          email: 'admin@example.com',
          full_name: 'Administrador',
          is_active: true,
          created_at: now,
          updated_at: now,
          last_login: now
        }
        set({ admin: adminUser, isAuthenticated: true, isLoading: false, error: null })
        return true
      }
      set({ error: 'Credenciais inválidas', isLoading: false })
      return false
    } catch {
      set({ error: 'Erro no processo de login', isLoading: false })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true })
    
    try {
      set({ 
        admin: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      })
    } catch {
      set({ isLoading: false })
    }
  }
}))
