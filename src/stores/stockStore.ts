import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface StockItem {
  item_id: string
  sku: string
  nome: string
  descricao: string | null
  local: string
  quantidade: number
  created_at: string
  updated_at: string
}

interface StockState {
  items: StockItem[]
  isLoading: boolean
  error: string | null
  fetchStock: () => Promise<void>
  upsertMany: (rows: Array<Omit<StockItem, 'item_id' | 'created_at' | 'updated_at'>>) => Promise<{ inserted: number; updated: number }>
  replaceAll: (rows: Array<Omit<StockItem, 'item_id' | 'created_at' | 'updated_at'>>) => Promise<boolean>
}

export const useStockStore = create<StockState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchStock: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .order('nome', { ascending: true })
      if (error) throw error
      set({ items: (data || []) as StockItem[], isLoading: false })
    } catch {
      set({ error: 'Erro ao carregar estoque', isLoading: false })
    }
  },

  upsertMany: async (rows) => {
    set({ isLoading: true, error: null })
    try {
      const payload = rows.map(r => ({
        ...r,
        quantidade: Number(r.quantidade || 0),
        updated_at: new Date().toISOString()
      }))
      const { data, error } = await supabase
        .from('estoque')
        .upsert(payload, { onConflict: 'sku' })
        .select('*')
      if (error) throw error
      const list = (data || []) as StockItem[]
      const before = get().items
      const beforeSkus = new Set(before.map(i => i.sku))
      const inserted = list.filter(i => !beforeSkus.has(i.sku)).length
      const updated = list.length - inserted
      await get().fetchStock()
      return { inserted, updated }
    } catch {
      set({ error: 'Erro ao importar estoque', isLoading: false })
      return { inserted: 0, updated: 0 }
    }
  },

  replaceAll: async (rows) => {
    set({ isLoading: true, error: null })
    try {
      await supabase.from('estoque').delete().not('sku', 'is', null)
      const payload = rows.map(r => ({
        ...r,
        quantidade: Number(r.quantidade || 0),
        updated_at: new Date().toISOString()
      }))
      const { error } = await supabase
        .from('estoque')
        .upsert(payload, { onConflict: 'sku' })
      if (error) throw error
      await get().fetchStock()
      return true
    } catch {
      set({ error: 'Erro ao substituir estoque', isLoading: false })
      return false
    }
  },
}))
