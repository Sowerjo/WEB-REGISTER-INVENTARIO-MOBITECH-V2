import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface SectorFormModalProps {
  sector?: any
  onClose: () => void
  onSuccess: () => void
}

export default function SectorFormModal({ sector, onClose, onSuccess }: SectorFormModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (sector) {
      setFormData({
        nome: sector.nome,
        descricao: sector.descricao || ''
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (sector) {
        // Update existing sector
        const { error } = await supabase
          .from('sectors')
          .update({
            nome: formData.nome,
            descricao: formData.descricao,
            updated_at: new Date().toISOString()
          })
          .eq('sector_id', sector.sector_id)

        if (error) throw error
        toast.success('Setor atualizado com sucesso!')
      } else {
        // Create new sector
        const { error } = await supabase
          .from('sectors')
          .insert([{
            nome: formData.nome,
            descricao: formData.descricao,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('Setor criado com sucesso!')
      }

      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar setor')
      console.error('Error saving sector:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {sector ? 'Editar Setor' : 'Novo Setor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nome do setor"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <textarea
                placeholder="Descrição do setor (opcional)"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full pl-4 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Salvando...
                </div>
              ) : (
                sector ? 'Atualizar' : 'Criar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}