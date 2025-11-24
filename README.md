# Sistema de Gerenciamento de Usuários - Admin Dashboard

Um sistema web moderno e robusto para gerenciamento de usuários com autenticação de administrador, desenvolvido com React, TypeScript, Supabase e Tailwind CSS.

## 🎨 Características Visuais

- **Design Moderno**: Interface com gradientes, glassmorphism e animações suaves
- **Tema Escuro**: Layout profissional com cores escuras e acentos vibrantes
- **Responsivo**: Totalmente adaptável para dispositivos móveis e desktop
- **Animações**: Transições suaves e efeitos visuais agradáveis

## 🔧 Funcionalidades

### Autenticação de Admin
- Login seguro para administradores
- Sistema de sessão com estado global
- Credenciais padrão: `admin` / `#@superuser#@`

### Gerenciamento de Usuários
- Criar novos usuários com dados completos
- Editar informações de usuários existentes
- Excluir usuários do sistema
- Busca e filtro de usuários

### Gerenciamento de Setores
- Criar e gerenciar setores/departamentos
- Vincular usuários a setores específicos
- Interface dedicada para administração de setores

### Dashboard Administrativo
- Estatísticas em tempo real
- Visualização de dados em cards modernos
- Sistema de abas para organização
- Notificações toast para feedback visual

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Gerenciamento de Estado**: Zustand
- **Roteamento**: React Router DOM
- **Notificações**: Sonner (Toast)
- **Ícones**: Lucide React

## ⚙️ Configuração do Supabase

- Arquivo de configuração: `src/lib/supabase.ts`
- Variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Arquivo de exemplo: `.env.example`
- Crie um arquivo `.env` na raiz com:

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
```

O Vite carrega essas variáveis automaticamente e o cliente é inicializado em `src/lib/supabase.ts`.

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── UserFormModal.tsx    # Modal de formulário de usuário
│   └── SectorFormModal.tsx  # Modal de formulário de setor
├── lib/                 # Configurações e utilitários
│   └── supabase.ts          # Cliente Supabase
├── pages/               # Páginas principais
│   ├── AdminLogin.tsx       # Página de login
│   └── AdminDashboard.tsx   # Dashboard administrativo
├── stores/              # Gerenciamento de estado
│   ├── authStore.ts         # Estado de autenticação
│   ├── userStore.ts         # Estado de usuários
│   └── sectorStore.ts       # Estado de setores
└── App.tsx              # Componente principal com rotas
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd sistema-gerenciamento-usuarios
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Supabase**
   - Crie um projeto no Supabase
   - Defina as variáveis no arquivo `.env` (conforme acima)
   - Aplique a migration completa (veja seção abaixo)

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse o sistema**
   - Abra o navegador em `http://localhost:5173`
   - Faça login com as credenciais padrão

## 🧩 Migration Completa do Banco

- Arquivo único: `supabase/migrations/supabase_migration_full.sql`
- O script cria as tabelas `admin_users`, `users` e `sectors`, triggers de `updated_at`, ativa RLS e define políticas permissivas para facilitar uso com a chave `anon`.
- Como aplicar:
  - Supabase SQL Editor: abra o projeto → `SQL` → `New query` → cole o conteúdo do arquivo → execute
  - `psql`: `psql -h <host> -U <user> -d <database> -f supabase/migrations/supabase_migration_full.sql`

## 🗄️ Estrutura do Banco de Dados

### Tabela `admin_users`
- `admin_id` (UUID) - Chave primária
- `username` (VARCHAR) - Nome de usuário único
- `email` (VARCHAR) - Email do administrador
- `full_name` (VARCHAR) - Nome completo
- `is_active` (BOOLEAN) - Status do administrador
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Última atualização
- `last_login` (TIMESTAMPTZ) - Último login

### Tabela `users`
- `user_id` (VARCHAR) - Chave primária
- `nome` (VARCHAR) - Nome do usuário
- `setor` (VARCHAR) - Setor/departamento
- `email` (VARCHAR) - Email único
- `senha` (VARCHAR) - Senha
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Última atualização

### Tabela `sectors`
- `sector_id` (UUID) - Chave primária
- `nome` (VARCHAR) - Nome do setor
- `descricao` (TEXT) - Descrição opcional
- `is_active` (BOOLEAN) - Status do setor
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Última atualização

## 🔐 Segurança

- Autenticação baseada em sessão
- Validação de formulários no frontend
- Uso de chaves apropriadas do Supabase (anon para frontend)
- Políticas de segurança configuradas no Supabase

## 🏗️ Build e Deploy

- Script de compilação: `compile.cmd`
- O que o script faz:
  - Executa `npm install` se necessário
  - Roda `npm run build` (TypeScript + Vite)
  - Copia/mantém espelhada a pasta `dist` em `site` com `robocopy /MIR`
  - Gera `site/.htaccess` se não existir
- Resultado: a pasta `site` fica pronta para subir na hospedagem.

Para usar: execute `compile.cmd` no Windows.

## 📄 Arquivo .htaccess

- Local: `public/.htaccess` (incluído automaticamente no `dist` durante o build)
- Funções:
  - Fallback do React Router (`RewriteRule . /index.html`)
  - Headers de segurança
  - Cache de assets estáticos

## 🎨 Personalização

### Cores
O sistema utiliza uma paleta de cores escura com acentos em azul e roxo. Você pode personalizar as cores modificando:
- Classes de gradiente: `from-blue-600 to-purple-600`
- Cores de fundo: `bg-gray-800`, `bg-gray-900`
- Cores de texto: `text-white`, `text-gray-400`

### Animações
As animações podem ser ajustadas em `src/index.css`:
- Duração das animações
- Tipos de easing
- Intensidade dos efeitos

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

