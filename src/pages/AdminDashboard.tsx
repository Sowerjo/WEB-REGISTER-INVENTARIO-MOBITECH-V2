import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { useSectorStore } from '../stores/sectorStore'
import { UserPlus, Users, Building2, LogOut, Plus, Edit, Trash2, Search, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import UserFormModal from '../components/UserFormModal'
import SectorFormModal from '../components/SectorFormModal'

export default function AdminDashboard() {
  const { admin, logout } = useAuthStore()
  const { users, fetchUsers, deleteUser, isLoading } = useUserStore()
  const { sectors, fetchSectors } = useSectorStore()
  const [showUserModal, setShowUserModal] = useState(false)
  const [showSectorModal, setShowSectorModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingSector, setEditingSector] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'sectors'>('users')
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchSectors()
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logout realizado com sucesso!')
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      const success = await deleteUser(userId)
      if (success) {
        toast.success('Usuário excluído com sucesso!')
      } else {
        toast.error('Erro ao excluir usuário')
      }
    }
  }

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.setor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSectorName = (sectorId: string) => {
    const sector = sectors.find(s => s.sector_id === sectorId)
    return sector ? sector.nome : sectorId
  }

  const copyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopiedUserId(userId)
      toast.success('ID do usuário copiado!')
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedUserId(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar ID')
      console.error('Error copying user ID:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Header */}
      <header className="relative bg-gray-800/90 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                <span className="font-medium">{admin?.full_name || admin?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Usuários</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Setores</p>
                <p className="text-3xl font-bold text-white">{sectors.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Admin Ativo</p>
                <p className="text-lg font-bold text-white">{admin?.full_name || admin?.username}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-1 border border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'sectors'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Building2 className="w-5 h-5 inline-block mr-2" />
            Setores
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-xl font-bold text-white">Gerenciamento de Usuários</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null)
                      setShowUserModal(true)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Novo Usuário</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => (
                    <div key={user.user_id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-white">{user.nome}</h3>
                            <button
                              onClick={() => copyUserId(user.user_id)}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded font-mono hover:bg-blue-500/30 transition-colors flex items-center space-x-1 group"
                              title="Clique para copiar o ID"
                            >
                              <span>{user.user_id}</span>
                              {copiedUserId === user.user_id ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user)
                              setShowUserModal(true)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                          {user.setor}
                        </span>
                        <span className="text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sectors Tab */}
        {activeTab === 'sectors' && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Gerenciamento de Setores</h2>
                <button
                  onClick={() => {
                    setEditingSector(null)
                    setShowSectorModal(true)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Setor</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectors.map((sector) => (
                  <div key={sector.sector_id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{sector.nome}</h3>
                        {sector.descricao && (
                          <p className="text-sm text-gray-400">{sector.descricao}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingSector(sector)
                            setShowSectorModal(true)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Tem certeza que deseja excluir este setor?')) {
                              const success = await useSectorStore.getState().deleteSector(sector.sector_id)
                              if (success) {
                                toast.success('Setor excluído com sucesso!')
                              } else {
                                toast.error('Erro ao excluir setor')
                              }
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Criado em {new Date(sector.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showUserModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => setShowUserModal(false)}
          onSuccess={() => {
            setShowUserModal(false)
            fetchUsers()
          }}
        />
      )}

      {showSectorModal && (
        <SectorFormModal
          sector={editingSector}
          onClose={() => setShowSectorModal(false)}
          onSuccess={() => {
            setShowSectorModal(false)
            fetchSectors()
          }}
        />
      )}

      <style>{`
        .bg-grid-pattern {
          background-image: 
            radial-gradient(circle, #ffffff 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  )
}