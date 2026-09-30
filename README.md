# Occurrence API

API robusta e escalável desenvolvida em **Node.js (v24)** e **TypeScript** para gerenciamento de ocorrências de segurança e monitoramento (como alertas de drones, invasões e falhas de bateria). O projeto adota princípios de arquitetura limpa, padrão Repository, DTOs com validação estrita e persistência no **MongoDB**.

---

## 📑 Sumário

- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Regras de Negócio Principais](#-regras-de-negócio-principais)
- [Arquitetura e Estrutura do Projeto](#-arquitetura-e-estrutura-do-projeto)
- [Passo a Passo para Rodar a Aplicação](#️-passo-a-passo-para-rodar-a-aplicação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Executando os Testes](#-executando-os-testes)
- [Endpoints da API](#-endpoints-da-api)
- [Solução de Problemas](#-solução-de-problemas)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🚀 Tecnologias Utilizadas

| Categoria | Tecnologia |
| --- | --- |
| Linguagem | TypeScript (v5+) |
| Runtime | Node.js (v24) |
| Framework | Express.js |
| Banco de Dados | MongoDB com Mongoose (v8) |
| Empacotamento | Esbuild (otimizado para saída CommonJS / `.cjs`) |
| Validação & DTOs | `class-validator` e `class-transformer` |
| Testes | Vitest (com mocks unitários isolados) |
| Containerização | Docker & Docker Compose (multi-stage build) |

---

## 📌 Regras de Negócio Principais

### 1. Cálculo de Prioridade Dinâmico

A prioridade de uma ocorrência é calculada automaticamente multiplicando a severidade pelo peso do tipo de ocorrência:

$$\text{Prioridade} = \text{severidade (1-5)} \times \text{peso}$$

| Tipo (`type`) | Peso |
| --- | :---: |
| `intrusion` | 3 |
| `perimeter_breach` | 2 |
| `low_battery` | 1 |
| `signal_loss` | 1 |

**Exemplo:** uma ocorrência `intrusion` com severidade `4` terá prioridade `4 × 3 = 12`.

### 2. Prevenção de Duplicidade

O sistema impede a inserção de ocorrências idênticas (mesmo `siteId`, `droneId` e `type`) geradas dentro de uma janela de tempo de **10 minutos**. Quando um novo evento idêntico chega dentro dessa janela, o registro existente é atualizado (contador e severidade) em vez de criar um novo documento.

### 3. Performance e Índices

O banco de dados utiliza um **índice composto** (`siteId`, `droneId`, `type`, `detectedAt`) para otimizar buscas de duplicidade e agregações de ordenação por prioridade.

### 4. Ciclo de Vida do Status

A atualização de status (`PATCH /occurrances/:id/status`) aplica validações estritas de transição, rejeitando mudanças inválidas de estado com erro de validação.

---

## 🧱 Arquitetura e Estrutura do Projeto

O projeto segue uma separação em camadas, onde cada uma tem uma responsabilidade bem definida:

```
Request → Controller → DTO (validação) → Service (regras de negócio) → Repository → MongoDB
```

| Camada | Responsabilidade |
| --- | --- |
| **Controller** | Recebe a requisição HTTP e devolve a resposta. |
| **DTO** | Valida e transforma o payload de entrada com `class-validator` / `class-transformer`. |
| **Service** | Concentra as regras de negócio (prioridade, duplicidade, transição de status). |
| **Repository** | Isola o acesso aos dados (Mongoose), facilitando mocks nos testes. |

Estrutura sugerida de pastas (ajuste conforme o seu projeto):

```
occurrence-api/
├── src/
│   ├── controllers/
│   ├── dtos/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── server.ts
├── tests/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 🛠️ Passo a Passo para Rodar a Aplicação

Você pode executar o projeto de duas formas: utilizando o **Docker Compose** (recomendado, por garantir isolamento e compatibilidade) ou **manualmente** na sua máquina local.

### Pré-requisitos

- **Git** para clonar o repositório
- **Node.js v24+** (caso vá rodar localmente)
- **Docker** e **Docker Compose** (caso vá rodar via containers)
- **MongoDB** (caso vá rodar localmente sem Docker)

---

### Opção 1: Rodando com Docker Compose (Recomendado)

Esta opção utiliza multi-stage build para otimizar a imagem da API e sobe automaticamente a aplicação junto com um container isolado do MongoDB, em uma rede dedicada.

1. **Clone o repositório e acesse a pasta do projeto:**

   ```bash
   git clone <url-do-repositorio>
   cd occurrence-api
   ```

2. **Crie o arquivo `.env` na raiz do projeto:**

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/occurrence-api
   ```

   > ⚠️ **Atenção:** dentro da rede do Docker Compose, `localhost` aponta para o próprio container da API. Se o `docker-compose.yml` sobrescrever a variável, nada muda; caso contrário, use o **nome do serviço do MongoDB** no host (ex.: `mongodb://mongo:27017/occurrence-api`, conforme o nome definido no seu `docker-compose.yml`).

3. **Suba os containers:**

   ```bash
   docker compose up --build -d
   ```

4. **Verifique se está rodando:**

   A API estará disponível em `http://localhost:3000`. Teste com:

   ```bash
   curl http://localhost:3000/health-check
   ```

   Para acompanhar os logs da aplicação:

   ```bash
   docker compose logs -f app
   ```

5. **Para parar e remover os containers:**

   ```bash
   docker compose down
   ```

   Para remover também os volumes (apaga os dados do MongoDB):

   ```bash
   docker compose down -v
   ```

---

### Opção 2: Executando Localmente (Desenvolvimento)

1. **Instale as dependências do projeto:**

   ```bash
   npm install
   ```

2. **Certifique-se de ter o MongoDB rodando:**

   Tenha uma instância do MongoDB ativa na sua máquina (por exemplo, na porta padrão `27017`). Se preferir, suba apenas o banco via Docker:

   ```bash
   docker run -d --name mongo -p 27017:27017 mongo:7
   ```

3. **Configure o arquivo `.env`:**

   Crie um arquivo `.env` na raiz do projeto:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/occurrence-api
   ```

4. **Faça o build da aplicação:**

   Gere os artefatos compilados compatíveis com o Node.js usando o esbuild:

   ```bash
   npm run build
   ```

5. **Inicie o servidor:**

   ```bash
   npm start
   ```

   A API estará disponível em `http://localhost:3000`.

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo | Obrigatória |
| --- | --- | --- | :---: |
| `PORT` | Porta em que a API será exposta. | `3000` | Sim |
| `MONGO_URI` | String de conexão com o MongoDB. | `mongodb://localhost:27017/occurrence-api` | Sim |

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run build` | Gera o bundle de produção com Esbuild (saída `.cjs`). |
| `npm start` | Inicia o servidor a partir do build gerado. |
| `npm run test` | Executa os testes do Vitest em modo interativo (watch). |
| `npx vitest run` | Executa os testes uma única vez (ideal para CI/CD). |

---

## 🧪 Executando os Testes

O projeto utiliza o **Vitest** para garantir a integridade das regras de negócio por meio de testes unitários isolados (Repositories e Services), com dependências externas mockadas — **não é necessário ter o MongoDB rodando** para executá-los.

Modo interativo (watch):

```bash
npm run test
```

Execução única (ideal para pipelines de CI/CD):

```bash
npx vitest run
```

Com relatório de cobertura (requer `@vitest/coverage-v8` instalado):

```bash
npx vitest run --coverage
```

---

## 📡 Endpoints da API

URL base (local): `http://localhost:3000`

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health-check` | Verifica o status de saúde da aplicação. |
| `POST` | `/occurrances` | Cria uma nova ocorrência. |
| `GET` | `/occurrances` | Lista as ocorrências, com ordenação por prioridade. |
| `PATCH` | `/occurrances/:id/status` | Atualiza o status de uma ocorrência. |

> ℹ️ As rotas estão grafadas como `occurrances` (com dois "r"), conforme implementado na API. Mantenha essa grafia nas requisições.

---

### `GET /health-check`

Verifica o status de saúde da aplicação.

**Exemplo:**

```bash
curl http://localhost:3000/health-check
```

**Resposta `200 OK`:**

```json
{
  "status": "ok"
}
```

---

### `POST /occurrances`

Cria uma nova ocorrência. Valida a duplicidade dentro da janela de 10 minutos, gerencia contadores e calcula a prioridade.

**Corpo da requisição:**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `siteId` | `string` | Identificador do local monitorado. |
| `droneId` | `string` | Identificador do drone que gerou o evento. |
| `type` | `string` | Um de: `intrusion`, `perimeter_breach`, `low_battery`, `signal_loss`. |
| `severity` | `number` | Severidade de `1` a `5`. |
| `detectedAt` | `string` (ISO 8601) | Data/hora em que o evento foi detectado. |

**Exemplo:**

```bash
curl -X POST http://localhost:3000/occurrances \
  -H "Content-Type: application/json" \
  -d '{
    "siteId": "site-001",
    "droneId": "drone-042",
    "type": "intrusion",
    "severity": 4,
    "detectedAt": "2026-09-30T14:30:00.000Z"
  }'
```

**Resposta `201 Created` (exemplo):**

```json
{
  "id": "66fa1c2e9b1d4a0012ab34cd",
  "siteId": "site-001",
  "droneId": "drone-042",
  "type": "intrusion",
  "severity": 4,
  "priority": 12,
  "count": 1,
  "status": "open",
  "detectedAt": "2026-09-30T14:30:00.000Z"
}
```

**Possíveis erros:**

| Código | Motivo |
| --- | --- |
| `400 Bad Request` | Payload inválido (campo ausente, `type` desconhecido, `severity` fora de 1–5). |

> Se uma ocorrência idêntica (`siteId` + `droneId` + `type`) já existir nos últimos 10 minutos, o registro existente é atualizado (contador e severidade) em vez de criar um novo.

---

### `GET /occurrances`

Lista as ocorrências cadastradas, com suporte a ordenação dinâmica por prioridade via agregação.

**Exemplo:**

```bash
curl http://localhost:3000/occurrances
```

**Resposta `200 OK` (exemplo):**

```json
[
  {
    "id": "66fa1c2e9b1d4a0012ab34cd",
    "siteId": "site-001",
    "droneId": "drone-042",
    "type": "intrusion",
    "severity": 4,
    "priority": 12,
    "count": 1,
    "status": "open",
    "detectedAt": "2026-09-30T14:30:00.000Z"
  }
]
```

---

### `PATCH /occurrances/:id/status`

Atualiza o status de uma ocorrência específica, aplicando validações estritas de transição de ciclo de vida.

**Parâmetros de rota:**

| Parâmetro | Descrição |
| --- | --- |
| `id` | Identificador da ocorrência. |

**Corpo da requisição:**

```json
{
  "status": "resolved"
}
```

**Exemplo:**

```bash
curl -X PATCH http://localhost:3000/occurrances/66fa1c2e9b1d4a0012ab34cd/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "resolved" }'
```

**Possíveis erros:**

| Código | Motivo |
| --- | --- |
| `400 Bad Request` | Status inválido ou transição de ciclo de vida não permitida. |
| `404 Not Found` | Ocorrência não encontrada. |

> Os valores de status e o diagrama de transições dependem da sua implementação. Ajuste a tabela acima e os exemplos de resposta conforme os estados reais do projeto.

---

## 🩹 Solução de Problemas

| Problema | Possível causa e solução |
| --- | --- |
| A API não conecta ao MongoDB no Docker | `MONGO_URI` usando `localhost`. Use o nome do serviço do MongoDB definido no `docker-compose.yml`. |
| `EADDRINUSE: address already in use` | A porta definida em `PORT` já está em uso. Altere a porta no `.env` ou encerre o processo que a ocupa. |
| Erro de versão do Node ao rodar `npm install` | Confirme que está usando Node.js v24+ (`node -v`). |
| Alterações no código não aparecem no Docker | Reconstrua as imagens com `docker compose up --build -d`. |

---

## 🤝 Contribuindo

1. Faça um fork do projeto.
2. Crie uma branch para a sua feature: `git checkout -b feature/minha-feature`.
3. Faça commit das alterações: `git commit -m "feat: minha feature"`.
4. Garanta que os testes passam: `npx vitest run`.
5. Envie a branch: `git push origin feature/minha-feature`.
6. Abra um Pull Request.

