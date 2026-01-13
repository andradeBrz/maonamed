# Mao na med

Plataforma educacional  desenvolvida com Vue.js e Firebase, oferecendo gerenciamento de aulas, estudantes e sistema de pagamento via PIX.

## 📋 Índice

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Firebase](#firebase)
- [Desenvolvimento](#desenvolvimento)

## 🚀 Tecnologias Utilizadas

### Frontend
- **Vue.js 3** - Framework JavaScript progressivo
- **Vue Router 4** - Roteamento oficial do Vue.js
- **Vuex 4** - Gerenciamento de estado
- **Bootstrap 5** - Framework CSS
- **HLS.js** - Player de vídeo HLS
- **SweetAlert2** - Alertas e modais
- **vue-the-mask** - Máscaras de input
- **Sass** - Pré-processador CSS

### Backend
- **Firebase Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Firebase Functions** - Funções serverless
- **Firebase Authentication** - Autenticação de usuários
- **Firebase Analytics** - Análise de uso

### Integrações
- **Panda CDN** - Streaming de vídeo
- **GerenciaNet/EFiPay** - Pagamentos via PIX

## ✨ Funcionalidades

- 🔐 **Autenticação de usuários** com Firebase Auth
- 📚 **Gerenciamento de aulas** - Criar, editar, buscar e visualizar aulas
- 📁 **Organização em pastas** - Estruturar conteúdo em pastas
- 📄 **Gestão de documentos** - Upload e organização de materiais
- 🎥 **Player de vídeo** - Reprodução de aulas via streaming HLS
- 👥 **Cadastro de estudantes** - Gerenciar alunos e seus acessos
- 💳 **Pagamentos PIX** - Integração com GerenciaNet para pagamentos
- 🔍 **Busca de aulas** - Sistema de filtros e pesquisa
- 📊 **Tipos de aula** - Categorização (APG, revisões, etc.)

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Firebase CLI** (`npm install -g firebase-tools`)
- Uma conta Firebase com projeto configurado
- Credenciais da GerenciaNet/EFiPay (para pagamentos)
- Credenciais do Panda CDN (para streaming de vídeo)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd descomplica-pbl
```

2. Instale as dependências do projeto principal:
```bash
npm install
```

3. Instale as dependências das Cloud Functions:
```bash
cd functions
npm install
cd ..
```

## ⚙️ Configuração

As configurações do Firebase já estão no repositório (projeto, credenciais, regras). Para testar em uma nova máquina:

**Para desenvolvimento do frontend:**
- Nenhuma configuração adicional necessária. As credenciais do Firebase já estão no código.

**Para deploy ou desenvolvimento de Cloud Functions:**
1. Faça login no Firebase CLI:
```bash
firebase login
```

2. Se precisar testar as Cloud Functions localmente, crie o arquivo `functions/.env`:
```env
GERENCIANET_CERT_NAME=seu-certificado.p12
GERENCIANET_CLIENT_ID=seu-client-id
GERENCIANET_CLIENT_SECRET=seu-client-secret
GERENCIANET_ENDPOINT=https://pix.api.efipay.com.br
PANDA_AUTH_KEY=sua-chave-panda
```

3. Coloque o certificado da GerenciaNet na pasta `functions/certs/`

## 📜 Scripts Disponíveis

### Projeto Principal

- `npm run serve` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa o linter ESLint

### Cloud Functions

- `cd functions && npm run lint` - Linter das funções
- `cd functions && npm run deploy` - Deploy das funções
- `cd functions && npm run logs` - Visualiza logs das funções

## 📁 Estrutura do Projeto

```
descomplica-pbl/
├── functions/              # Cloud Functions do Firebase
│   ├── index.js           # Código das funções
│   ├── package.json
│   └── certs/             # Certificados (GerenciaNet)
├── public/                # Arquivos estáticos
│   ├── index.html
│   └── assets/           # Imagens, ícones
├── src/
│   ├── components/        # Componentes Vue
│   │   ├── Base/         # Componentes base
│   │   ├── Buttons/      # Botões
│   │   ├── Lessons/      # Componentes de aulas
│   │   ├── Login/        # Componentes de login
│   │   └── Modal/        # Modais
│   ├── firebase/         # Configuração Firebase
│   ├── router/           # Configuração de rotas
│   ├── store/            # Store Vuex
│   ├── views/            # Páginas/Views
│   ├── App.vue           # Componente raiz
│   └── main.js           # Entry point
├── firebase.json          # Configuração Firebase
├── firestore.rules        # Regras do Firestore
├── storage.rules          # Regras do Storage
└── package.json
```

## 🔥 Firebase

### Serviços Utilizados

- **Authentication** - Login e cadastro de usuários
- **Firestore** - Banco de dados para aulas, usuários, documentos
- **Storage** - Armazenamento de arquivos (vídeos, documentos)
- **Functions** - Backend serverless (pagamentos, uploads, etc.)
- **Analytics** - Métricas e análise de uso

### Deploy

Para fazer deploy do projeto:

```bash
# Deploy do hosting (frontend)
firebase deploy --only hosting

# Deploy das funções
firebase deploy --only functions

# Deploy completo
firebase deploy
```

## 💻 Desenvolvimento

### Estrutura de Rotas

- `/login` - Página de login
- `/` - Home (requer autenticação)
- `/myLessons` - Minhas aulas adquiridas
- `/myLessons/:id` - Player de vídeo
- `/lessons` - Buscar aulas
- `/createLessons` - Criar/editar aulas (admin)
- `/createLessonTypes` - Gerenciar tipos de aula
- `/lessonDetails/:lessonId` - Detalhes da aula
- `/students` - Gerenciar estudantes
- `/folderDetails/:folderId` - Detalhes de pasta

### Estado Global (Vuex)

O store Vuex gerencia:
- Estado de carregamento
- Filtros de aulas
- Lista de aulas e tipos
- Usuário atual
- Configurações de pagamento (GerenciaNet)
- Cache de documentos

## 📝 Observações

- O projeto utiliza `--openssl-legacy-provider` nos scripts devido a compatibilidade com Node.js mais recentes
- O certificado da GerenciaNet deve estar no formato `.p12`
- Para desenvolvimento local das Cloud Functions, use o Firebase Emulator Suite

## 📄 Licença

Este projeto é privado.
---


