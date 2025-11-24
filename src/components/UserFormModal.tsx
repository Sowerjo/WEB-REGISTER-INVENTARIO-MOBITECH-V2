import { useState, useEffect } from 'react'
import { useUserStore } from '../stores/userStore'
import { useSectorStore } from '../stores/sectorStore'
import { X, User, Mail, Building2, Lock } from 'lucide-react'
import { toast } from 'sonner'

interface UserFormModalProps {
  user?: any
  onClose: () => void
  onSuccess: () => void
}

export default function UserFormModal({ user, onClose, onSuccess }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    setor: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createUser, updateUser } = useUserStore()
  const { sectors, fetchSectors } = useSectorStore()

  useEffect(() => {
    fetchSectors()
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        senha: '', // Don't pre-fill password for security
        setor: user.setor
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (user) {
        // Update existing user
        const updateData: any = {
          nome: formData.nome,
          email: formData.email,
          setor: formData.setor,
          updated_at: new Date().toISOString()
        }
        
        // Only update password if provided
        if (formData.senha) {
          updateData.senha = formData.senha
        }

        const success = await updateUser(user.user_id, updateData)
        
        if (success) {
          toast.success('Usuário atualizado com sucesso!')
        } else {
          throw new Error('Erro ao atualizar usuário')
        }
      } else {
        // Create new user - user_id will be generated sequentially
        const success = await createUser(formData)
        
        if (success) {
          toast.success('Usuário criado com sucesso!')
        } else {
          throw new Error('Erro ao criar usuário')
        }
      }

      onSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar usuário'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error saving user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <div className="text-sm text-red-300">
                  <p className="font-medium">Erro ao salvar usuário</p>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um setor</option>
                {sectors.map((sector) => (
                  <option key={sector.sector_id} value={sector.nome}>
                    {sector.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder={user ? 'Nova senha (deixe vazio para manter atual)' : 'Senha'}
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!user}
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
                user ? 'Atualizar' : 'Criar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}