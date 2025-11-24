import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  user_id: string
  nome: string
  setor: string
  email: string
  senha: string
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

// Function to generate next sequential user ID
const generateNextUserId = (users: User[]): string => {
  if (users.length === 0) {
    return 'USR0001'
  }
  
  // Extract numeric parts from existing user IDs that follow the USR format
  const existingNumbers = users
    .map(user => user.user_id)
    .filter(id => id.startsWith('USR'))
    .map(id => {
      const numberPart = id.substring(3) // Remove 'USR' prefix
      return parseInt(numberPart, 10)
    })
    .filter(num => !isNaN(num))
  
  // If no USR format IDs exist yet (only UUIDs), start from USR0001
  if (existingNumbers.length === 0) {
    return 'USR0001'
  }
  
  const maxNumber = Math.max(...existingNumbers)
  const nextNumber = maxNumber + 1
  
  // Pad with zeros to maintain 4-digit format (supports up to USR9999)
  return `USR${nextNumber.toString().padStart(4, '0')}`
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
        .order('nome')

      if (error) throw error

      set({ users: data || [], isLoading: false })
    } catch (error) {
      set({ error: 'Erro ao carregar usuários', isLoading: false })
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Starting user creation process...')
      
      // Check if email already exists
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single()

      if (existingEmail) {
        console.error('Email already exists:', userData.email)
        set({ error: 'Email já cadastrado no sistema', isLoading: false })
        return false
      }

      // Get current users to generate next sequential ID
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('user_id')

      if (fetchError) {
        console.error('Error fetching existing users:', fetchError)
        throw fetchError
      }

      console.log('Existing users found:', existingUsers?.length || 0)
      if (existingUsers && existingUsers.length > 0) {
        console.log('Sample existing user IDs:', existingUsers.slice(0, 3).map(u => u.user_id))
      }

      // Convert to User array format for the generator function
      const usersForGeneration: User[] = existingUsers ? existingUsers.map(u => ({ 
        user_id: u.user_id,
        nome: '',
        setor: '',
        email: '',
        senha: '',
        created_at: '',
        updated_at: ''
      })) : []

      // Generate next sequential user ID
      const nextUserId = generateNextUserId(usersForGeneration)
      console.log('Generated next user ID:', nextUserId)

      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          user_id: nextUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error inserting user:', error)
        
        // Handle specific database errors
        if (error.code === '23505' && error.message.includes('email')) {
          set({ error: 'Email já cadastrado no sistema', isLoading: false })
        } else {
          throw error
        }
        return false
      }

      console.log('User created successfully with ID:', nextUserId)

      set((state) => ({ 
        users: [...state.users, data], 
        isLoading: false 
      }))
      return true
    } catch (error) {
      console.error('Error creating user:', error)
      set({ error: 'Erro ao criar usuário', isLoading: false })
      return false
    }
  },

  updateUser: async (user_id, userData) => {
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        users: state.users.map(user => 
          user.user_id === user_id ? data : user
        ),
        isLoading: false
      }))
      return true
    } catch (error) {
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
    } catch (error) {
      set({ error: 'Erro ao deletar usuário', isLoading: false })
      return false
    }
  }
}))