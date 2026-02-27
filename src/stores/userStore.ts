import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  user_id: string
  nome: string
  setor: string
  email: string
  senha: string
  user_admin: boolean
  created_at: string
  updated_at: string
}

interface UserState {
  users: User[]
  isLoading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  createUser: (userData: Omit<User, 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updateUser: (user_id: string, userData: Partial<User>) => Promise<boolean>
  deleteUser: (user_id: string) => Promise<boolean>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('nome', { ascending: true })
      if (error) throw error
      set({ users: data || [], isLoading: false })
    } catch {
      set({ error: 'Erro ao carregar usuários', isLoading: false })
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null })
    
    try {
      const { data: last } = await supabase
        .from('users')
        .select('user_id')
        .like('user_id', 'USR%')
        .order('user_id', { ascending: false })
        .limit(1)
      let next = 1
      if (last && last[0]?.user_id?.startsWith('USR')) {
        const n = parseInt(last[0].user_id.slice(3), 10)
        next = isNaN(n) ? 1 : n + 1
      }
      const user_id = 'USR' + String(next).padStart(4, '0')
      const insertPayload = { 
        ...userData, 
        user_id,
        user_admin: Boolean(userData.user_admin),
      }
      const { data, error } = await supabase
        .from('users')
        .insert(insertPayload)
        .select('*')
        .single()
      if (error) throw error
      const created = data as User
      set((state) => ({ 
        users: [...state.users, created], 
        isLoading: false 
      }))
      return true
    } catch {
      set({ error: 'Erro ao criar usuário', isLoading: false })
      return false
    }
  },

  updateUser: async (user_id, userData) => {
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
          ...(userData.user_admin !== undefined ? { user_admin: Boolean(userData.user_admin) } : {}),
        })
        .eq('user_id', user_id)
        .select('*')
        .single()
      if (error) throw error
      const updated = data as User
      set((state) => ({
        users: state.users.map(user => 
          user.user_id === user_id ? updated : user
        ),
        isLoading: false
      }))
      return true
    } catch {
      set({ error: 'Erro ao atualizar usuário', isLoading: false })
      return false
    }
  },

  deleteUser: async (user_id) => {
    set({ isLoading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', user_id)
      if (error) throw error
      set((state) => ({
        users: state.users.filter(user => user.user_id !== user_id),
        isLoading: false
      }))
      return true
    } catch {
      set({ error: 'Erro ao deletar usuário', isLoading: false })
      return false
    }
  }
}))
