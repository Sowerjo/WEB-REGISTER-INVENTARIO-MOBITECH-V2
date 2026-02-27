import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import { useSectorStore } from '../stores/sectorStore'
import { useStockStore } from '../stores/stockStore'
import { UserPlus, Users, Building2, LogOut, Plus, Edit, Trash2, Search, Copy, Check, Boxes, AlertTriangle, Activity, Package, Upload, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import UserFormModal from '../components/UserFormModal'
import SectorFormModal from '../components/SectorFormModal'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { admin, logout } = useAuthStore()
  const { users, fetchUsers, deleteUser, isLoading } = useUserStore()
  const { sectors, fetchSectors } = useSectorStore()
  const { items: stockItems, fetchStock } = useStockStore()

  type EditingUser = { user_id: string; nome: string; email: string; setor: string; user_admin?: boolean; senha?: string }
  type EditingSector = { sector_id: string; nome: string; descricao: string | null }
  
  const [showUserModal, setShowUserModal] = useState(false)
  const [showSectorModal, setShowSectorModal] = useState(false)
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null)
  const [editingSector, setEditingSector] = useState<EditingSector | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'sectors'>('dashboard')
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null)
  const [copiedCredsUserId, setCopiedCredsUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchSectors()
    fetchStock()
  }, [fetchUsers, fetchSectors, fetchStock])

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

  const copyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopiedUserId(userId)
      toast.success('ID do usuário copiado!')
      setTimeout(() => setCopiedUserId(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar ID')
      console.error('Error copying user ID:', error)
    }
  }

  const copyCredentials = async (email: string, senha: string, userId: string) => {
    try {
      const text = `login: ${email}\nsenha: ${senha}`
      await navigator.clipboard.writeText(text)
      setCopiedCredsUserId(userId)
      toast.success('Login e senha copiados!')
      setTimeout(() => setCopiedCredsUserId(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar credenciais')
      console.error('Error copying credentials:', error)
    }
  }

  // Dashboard calculations
  const totalStockItems = stockItems.length
  const totalStockQuantity = stockItems.reduce((acc, item) => acc + (item.quantidade || 0), 0)
  const lowStockThreshold = 5
  const lowStockItems = stockItems.filter(item => (item.quantidade || 0) <= lowStockThreshold)
  const lowStockCount = lowStockItems.length

  // Sector distribution
  const sectorDistribution = sectors.map(sector => {
    const count = users.filter(u => u.setor === sector.nome).length
    const percentage = users.length > 0 ? (count / users.length) * 100 : 0
    return { ...sector, count, percentage }
  }).sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative bg-gray-800/90 backdrop-blur-lg border-b border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
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
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-0">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 backdrop-blur-lg rounded-xl p-1 border border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Activity className="w-5 h-5 inline-block mr-2" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
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
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'sectors'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Building2 className="w-5 h-5 inline-block mr-2" />
            Setores
          </button>
          <button
            onClick={() => navigate('/estoque')}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-all text-gray-400 hover:text-white hover:bg-gray-700/50 whitespace-nowrap"
          >
            <Boxes className="w-5 h-5 inline-block mr-2" />
            Estoque
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total de Itens</p>
                    <p className="text-3xl font-bold text-white mt-1">{totalStockItems}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Unidades em Estoque</p>
                    <p className="text-3xl font-bold text-white mt-1">{totalStockQuantity}</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Boxes className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-red-500/10 backdrop-blur-lg rounded-xl p-6 border border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer group"
                   onClick={() => navigate('/estoque', { state: { lowStockFilter: true } })}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors">Baixo Estoque</p>
                    <p className="text-3xl font-bold text-red-400 mt-1">{lowStockCount}</p>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Usuários Ativos</p>
                    <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  onClick={() => navigate('/estoque', { state: { openImport: true } })}
                  className="group flex flex-col items-center justify-center p-8 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-blue-500/50 rounded-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <span className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">Novo Inventário</span>
                  <span className="text-sm text-gray-400 mt-2 text-center">Importar planilha ou adicionar itens</span>
                </button>

                <button 
                  onClick={() => navigate('/estoque', { state: { lowStockFilter: true } })}
                  className="group flex flex-col items-center justify-center p-8 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-8 h-8 text-red-500" />
                  </div>
                  <span className="text-lg font-medium text-white group-hover:text-red-400 transition-colors">Auditoria</span>
                  <span className="text-sm text-gray-400 mt-2 text-center">Verificar itens com estoque baixo</span>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('users')
                    setTimeout(() => setShowUserModal(true), 100)
                  }}
                  className="group flex flex-col items-center justify-center p-8 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-green-500/50 rounded-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-8 h-8 text-green-500" />
                  </div>
                  <span className="text-lg font-medium text-white group-hover:text-green-400 transition-colors">Adicionar Usuário</span>
                  <span className="text-sm text-gray-400 mt-2 text-center">Cadastrar novo acesso ao sistema</span>
                </button>
              </div>
            </div>

            {/* Charts & Lists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sector Distribution */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-purple-400" />
                    Distribuição por Setor
                  </h3>
                </div>
                <div className="p-6 flex-1">
                  <div className="space-y-5">
                    {sectorDistribution.map((item) => (
                      <div key={item.sector_id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 font-medium">{item.nome}</span>
                          <span className="text-gray-400">{item.count} usuários ({Math.round(item.percentage)}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {sectorDistribution.length === 0 && (
                      <div className="text-center text-gray-500 py-8">Nenhum setor cadastrado</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Low Stock Alert List */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    Itens Críticos
                  </h3>
                  <button 
                    onClick={() => navigate('/estoque', { state: { lowStockFilter: true } })}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Ver todos
                  </button>
                </div>
                <div className="flex-1 overflow-auto max-h-[300px] p-0">
                  {lowStockItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                      <Check className="w-12 h-12 mb-3 text-green-500/20" />
                      <p>Estoque saudável</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-700/30 sticky top-0 backdrop-blur-sm">
                        <tr>
                          <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Item</th>
                          <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Qtd</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {lowStockItems.slice(0, 5).map(item => (
                          <tr key={item.item_id} className="hover:bg-gray-700/30 transition-colors group cursor-pointer" onClick={() => navigate('/estoque')}>
                            <td className="p-4">
                              <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{item.nome}</div>
                              <div className="text-xs text-gray-500">{item.sku} • {item.local}</div>
                            </td>
                            <td className="p-4 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                {item.quantidade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {lowStockItems.length > 5 && (
                  <div className="p-3 border-t border-gray-700 bg-gray-800/30 text-center">
                    <span className="text-xs text-gray-500">Exibindo 5 de {lowStockItems.length} itens críticos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                          <button
                            onClick={() => copyCredentials(user.email, user.senha, user.user_id)}
                            className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded font-mono hover:bg-green-500/30 transition-colors flex items-center space-x-1 group"
                            title="Copiar login e senha"
                          >
                            <span>login/senha</span>
                            {copiedCredsUserId === user.user_id ? (
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
                              setEditingUser({
                                user_id: user.user_id,
                                nome: user.nome,
                                email: user.email,
                                setor: user.setor,
                                user_admin: Boolean(user.user_admin),
                              })
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
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                            {user.setor}
                          </span>
                          <span className={`px-2 py-1 rounded ${user.user_admin ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                            {user.user_admin ? 'Admin' : 'Usuário'}
                          </span>
                        </div>
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
