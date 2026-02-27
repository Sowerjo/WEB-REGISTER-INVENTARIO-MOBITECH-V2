import { useEffect, useState } from 'react'
import { useStockStore } from '../stores/stockStore'
import { Upload, Download, Database, ArrowLeft, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'
import ImportStockModal from '../components/ImportStockModal'

export default function StockPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, fetchStock, upsertMany, isLoading } = useStockStore()
  const [search, setSearch] = useState('')
  const [confirmChanges, setConfirmChanges] = useState(true)
  const [sortKey, setSortKey] = useState<'sku'|'nome'|'local'|'quantidade'>('nome')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [lowStock, setLowStock] = useState<number>(0)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    fetchStock()
    if (location.state?.openImport) {
      setShowImportModal(true)
    }
    if (location.state?.lowStockFilter) {
      setLowStock(5)
    }
    // Clear state to prevent reopening on refresh
    if (location.state) {
      window.history.replaceState({}, document.title)
    }
  }, [fetchStock, location.state])

  const filtered = items.filter(i =>
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.local.toLowerCase().includes(search.toLowerCase())
  )

  const lowFiltered = lowStock > 0 ? filtered.filter(i => i.quantidade <= lowStock) : filtered

  const sorted = [...lowFiltered].sort((a,b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'quantidade') return (a.quantidade - b.quantidade) * dir
    const ka = sortKey === 'sku' ? a.sku : sortKey === 'nome' ? a.nome : a.local
    const kb = sortKey === 'sku' ? b.sku : sortKey === 'nome' ? b.nome : b.local
    return ka.localeCompare(kb) * dir
  })

  const exportCsv = (rows: typeof items) => {
    const header = 'SKU,NOME,DESCRICAO,LOCAL,QUANTIDADE'
    const lines = rows.map(r => [r.sku, r.nome, r.descricao ?? '', r.local, String(r.quantidade)].map(v => String(v).replace(/,/g,' ')).join(','))
    return [header, ...lines].join('\n')
  }

  const exportAllCsv = () => {
    const csv = exportCsv(items)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'estoque_completo.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportFilteredCsv = () => {
    const csv = exportCsv(sorted)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'estoque_filtrado.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSort = (key: 'sku'|'nome'|'local'|'quantidade') => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const adjustQuantity = async (item: { sku: string; nome: string; descricao: string | null; local: string; quantidade: number }, delta: number) => {
    const newQty = Math.max(0, item.quantidade + delta)
    if (confirmChanges) {
      const ok = window.confirm(`Atualizar quantidade do SKU ${item.sku} de ${item.quantidade} para ${newQty}?`)
      if (!ok) return
    }
    const result = await upsertMany([{ sku: item.sku, nome: item.nome, descricao: item.descricao, local: item.local, quantidade: newQty }])
    if ((result.inserted + result.updated) > 0) toast.success('Quantidade atualizada')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Top Bar: Title & Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                  title="Voltar ao Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Estoque
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-400">Alerta de Baixo Estoque ≤</span>
                  <input
                    type="number"
                    min={0}
                    value={lowStock}
                    onChange={(e) => setLowStock(Math.max(0, Number(e.target.value)))}
                    className="w-16 bg-transparent outline-none text-white text-center font-mono focus:ring-1 focus:ring-blue-500 rounded"
                  />
                </div>
                
                <label className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-750 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={confirmChanges}
                    onChange={(e) => setConfirmChanges(e.target.checked)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="text-sm text-gray-300">Confirmar alterações</span>
                </label>
              </div>
            </div>

            {/* Controls Bar: Search, Import, Export */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
              <div className="relative flex-1 max-w-md">
                <input
                  placeholder="Buscar por SKU, nome ou local..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Database className="w-4 h-4" />
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm font-medium"
                  disabled={isLoading}
                  title="Carregar arquivo CSV"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar</span>
                </button>

                <div className="h-8 w-px bg-gray-700 mx-1 hidden md:block"></div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportFilteredCsv}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg border border-gray-600 transition-colors text-sm"
                    disabled={isLoading}
                    title="Exportar itens visíveis na tabela"
                  >
                    <Download className="w-4 h-4" />
                    <span>Filtrado</span>
                  </button>
                  <button
                    onClick={exportAllCsv}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg border border-gray-600 transition-colors text-sm"
                    disabled={isLoading}
                    title="Exportar todo o estoque"
                  >
                    <Download className="w-4 h-4" />
                    <span>Completo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showImportModal && (
        <ImportStockModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false)
            fetchStock()
          }}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('sku')} className="hover:text-white flex items-center gap-1">
                      SKU {sortKey==='sku' && (sortDir==='asc' ? '▲' : '▼')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('nome')} className="hover:text-white flex items-center gap-1">
                      Nome {sortKey==='nome' && (sortDir==='asc' ? '▲' : '▼')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('local')} className="hover:text-white flex items-center gap-1">
                      Local {sortKey==='local' && (sortDir==='asc' ? '▲' : '▼')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button onClick={() => handleSort('quantidade')} className="hover:text-white flex items-center gap-1">
                      Quantidade {sortKey==='quantidade' && (sortDir==='asc' ? '▲' : '▼')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Carregando...</td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nenhum item encontrado</td>
                  </tr>
                ) : (
                  sorted.map(item => (
                    <tr key={item.item_id} className={`hover:bg-gray-800/50 ${lowStock > 0 && item.quantidade <= lowStock ? 'bg-red-900/20' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.descricao || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.local}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => adjustQuantity(item, -1)} 
                            className="p-1 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 disabled:opacity-50"
                            title="-1" 
                            disabled={isLoading}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[2rem] text-center font-mono">{item.quantidade}</span>
                          <button 
                            onClick={() => adjustQuantity(item, 1)} 
                            className="p-1 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 disabled:opacity-50"
                            title="+1" 
                            disabled={isLoading}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
