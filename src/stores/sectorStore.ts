import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Sector {
  sector_id: string
  nome: string
  descricao: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SectorState {
  sectors: Sector[]
  isLoading: boolean
  error: string | null
  fetchSectors: () => Promise<void>
  createSector: (nome: string, descricao?: string) => Promise<boolean>
  updateSector: (sector_id: string, nome: string, descricao?: string) => Promise<boolean>
  deleteSector: (sector_id: string) => Promise<boolean>
}

export const useSectorStore = create<SectorState>((set) => ({
  sectors: [],
  isLoading: false,
  error: null,

  fetchSectors: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('is_active', true)
        .order('nome', { ascending: true })
      if (error) throw error
      set({ sectors: data || [], isLoading: false })
    } catch {
      set({ error: 'Erro ao carregar setores', isLoading: false })
    }
  },

  createSector: async (nome: string, descricao?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const payload = { nome, descricao: descricao ?? null, is_active: true }
      const { data, error } = await supabase
        .from('sectors')
        .insert(payload)
        .select('*')
        .single()
      if (error) throw error
      set((state) => ({ 
        sectors: [...state.sectors, data as Sector], 
        isLoading: false 
      }))
      return true
    } catch {
      set({ error: 'Erro ao criar setor', isLoading: false })
      return false
    }
  },

  updateSector: async (sector_id: string, nome: string, descricao?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update({ nome, descricao: descricao ?? null })
        .eq('sector_id', sector_id)
        .select('*')
        .single()
      if (error) throw error
      set((state) => ({
        sectors: state.sectors.map(sector =>
          sector.sector_id === sector_id ? (data as Sector) : sector
        ),
        isLoading: false
      }))
      return true
    } catch {
      set({ error: 'Erro ao atualizar setor', isLoading: false })
      return false
    }
  },

  deleteSector: async (sector_id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('sectors')
        .update({ is_active: false })
        .eq('sector_id', sector_id)
      if (error) throw error
      set((state) => ({
        sectors: state.sectors.filter(sector => sector.sector_id !== sector_id),
        isLoading: false
      }))
      return true
    } catch {
      set({ error: 'Erro ao deletar setor', isLoading: false })
      return false
    }
  }
}))
