import { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle, RefreshCw, PlusCircle, MinusCircle, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useStockStore } from '../stores/stockStore'

type ImportType = 'definir' | 'entrada' | 'saida' | 'inserir' | 'atualizar' | 'substituir'

interface ImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

type PreviewRow = {
  sku: string
  nome: string
  descricao: string | null
  local: string
  quantidade: number
}

export default function ImportStockModal({ onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'configure' | 'confirm'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [importType, setImportType] = useState<ImportType>('definir')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { items, upsertMany, replaceAll } = useStockStore()

  const importOptions: { type: ImportType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
      type: 'definir',
      label: 'Definir Quantidades (Upsert)',
      description: 'Atualiza a quantidade exata do CSV. Se o item não existir, cria novo. Se existir, sobrescreve.',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    },
    {
      type: 'entrada',
      label: 'Entrada de Estoque (+)',
      description: 'Soma a quantidade do CSV ao estoque atual. Ideal para recebimento de mercadoria.',
      icon: <PlusCircle className="w-5 h-5" />,
      color: 'text-green-400 bg-green-400/10 border-green-400/20'
    },
    {
      type: 'saida',
      label: 'Saída de Estoque (-)',
      description: 'Subtrai a quantidade do CSV do estoque atual. Ignora itens que não existem.',
      icon: <MinusCircle className="w-5 h-5" />,
      color: 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    },
    {
      type: 'inserir',
      label: 'Apenas Novos Itens',
      description: 'Adiciona somente SKUs que ainda não existem no sistema. Ignora os já cadastrados.',
      icon: <PlusCircle className="w-5 h-5" />,
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    },
    {
      type: 'atualizar',
      label: 'Apenas Atualizar Existentes',
      description: 'Atualiza dados de SKUs já cadastrados. Ignora SKUs novos no arquivo.',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
    },
    {
      type: 'substituir',
      label: 'Substituir Tudo (Perigoso)',
      description: 'APAGA TODO o estoque atual e insere apenas os itens do arquivo CSV.',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'text-red-400 bg-red-400/10 border-red-400/20'
    }
  ]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.type !== 'text/csv' && !selected.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV válido')
      return
    }

    setFile(selected)
    
    // Preview parse
    const text = await selected.text()
    const rows = parseCsv(text)
    if (rows.length === 0) {
      toast.error('Arquivo vazio ou formato inválido')
      setFile(null)
      return
    }
    setPreviewRows(rows)
    setStep('configure')
  }

  const parseCsv = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return []
    const header = lines[0].toLowerCase().split(',').map(h => h.trim())
    const idx = {
      sku: header.indexOf('sku'),
      nome: header.indexOf('nome'),
      descricao: header.indexOf('descricao'),
      local: header.indexOf('local'),
      quantidade: header.indexOf('quantidade'),
    }
    
    if (idx.sku === -1 || idx.nome === -1 || idx.local === -1 || idx.quantidade === -1) {
      return []
    }

    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      const sku = cols[idx.sku] || ''
      const nome = cols[idx.nome] || ''
      const local = cols[idx.local] || ''
      
      if (!sku || !nome || !local) continue

      const quantidadeRaw = cols[idx.quantidade] || '0'
      const quantidade = Number(quantidadeRaw.replace(/\./g, '').replace(',', '.')) || 0

      rows.push({
        sku,
        nome,
        descricao: cols[idx.descricao] || null,
        local,
        quantidade: quantidade < 0 ? 0 : Math.floor(quantidade)
      })
    }
    return rows
  }

  const handleExecute = async () => {
    if (!file || previewRows.length === 0) return
    setIsLoading(true)

    try {
      if (importType === 'substituir') {
        const ok = await replaceAll(previewRows)
        if (ok) {
          toast.success('Estoque substituído com sucesso')
          onSuccess()
        } else {
          toast.error('Erro ao substituir estoque')
        }
        return
      }

      const map = new Map(items.map(i => [i.sku, i]))
      let toApply = [...previewRows]

      if (importType === 'inserir') {
        toApply = toApply.filter(r => !map.has(r.sku))
      } else if (importType === 'atualizar') {
        toApply = toApply.filter(r => map.has(r.sku))
      } else if (importType === 'entrada' || importType === 'saida') {
        toApply = toApply.map(r => {
          const ex = map.get(r.sku)
          if (!ex) {
            return importType === 'entrada' ? r : null
          }
          const delta = r.quantidade
          const newQty = importType === 'entrada' ? ex.quantidade + delta : Math.max(0, ex.quantidade - delta)
          return { ...r, quantidade: newQty }
        }).filter(Boolean) as PreviewRow[]
      }

      if (toApply.length === 0) {
        toast.info('Nenhum registro a processar com as regras selecionadas')
        onSuccess()
        return
      }

      const { inserted, updated } = await upsertMany(toApply)
      toast.success(`Processado: ${inserted} inseridos, ${updated} atualizados`)
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao processar importação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              Importar Estoque
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {step === 'upload' && 'Selecione o arquivo CSV'}
              {step === 'configure' && 'Escolha como processar os dados'}
              {step === 'confirm' && 'Confirme a operação'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-600 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-white mb-2">Clique para selecionar o CSV</p>
              <p className="text-sm text-gray-400 mb-6">Cabeçalho obrigatório: SKU, NOME, DESCRICAO, LOCAL, QUANTIDADE</p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Selecionar Arquivo
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileSelect} 
              />
            </div>
          )}

          {step === 'configure' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{file?.name}</p>
                    <p className="text-sm text-gray-400">{previewRows.length} linhas identificadas</p>
                  </div>
                </div>
                <button onClick={() => setStep('upload')} className="text-sm text-blue-400 hover:text-blue-300">
                  Trocar
                </button>
              </div>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Selecione o Tipo de Importação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {importOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setImportType(opt.type)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      importType === opt.type
                        ? `${opt.color} ring-1 ring-offset-1 ring-offset-gray-800` 
                        : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {opt.icon}
                      <span className="font-bold">{opt.label}</span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800">
          {step === 'upload' ? (
            <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
          ) : (
            <>
              <button 
                onClick={() => setStep('upload')} 
                className="px-4 py-2 text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                Voltar
              </button>
              <button 
                onClick={handleExecute}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2 ${
                  importType === 'substituir' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Importação
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}