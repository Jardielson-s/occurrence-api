# Occurrence API

API robusta e escalável desenvolvida em **Node.js (v24)** e **TypeScript** para gerenciamento de ocorrências de segurança e monitoramento (como alertas de drones, invasões e falhas de bateria). O projeto adota princípios de arquitetura limpa, padrão Repository, DTOs com validação estrita e persistência no **MongoDB**.

---

## 🚀 Tecnologias Utilizadas

*   **Linguagem:** TypeScript (v5+)
*   **Runtime:** Node.js (v24)
*   **Framework:** Express.js
*   **Banco de Dados:** MongoDB com Mongoose (v8)
*   **Empacotamento:** Esbuild (otimizado para CommonJS/`.cjs` output)
*   **Validação & DTOs:** `class-validator` e `class-transformer`
*   **Containerização:** Docker & Docker Compose

---

## 📌 Regras de Negócio Principais

1. **Cálculo de Prioridade Dinâmico:**
   * A prioridade de uma ocorrência é calculada automaticamente multiplicando a severidade pelo peso do tipo de ocorrência: $\text{Prioridade} = \text{severidade (1-5)} \times \text{peso}$.
   * **Pesos por Tipo:**
     * `intrusion`: 3
     * `perimeter_breach`: 2
     * `low_battery`: 1
     * `signal_loss`: 1

2. **Prevenção de Duplicidade:**
   * O sistema impede a inserção de ocorrências idênticas (mesmo `siteId`, `droneId` e `type`) geradas dentro de uma janela de tempo de **10 minutos**.

3. **Performance e Índices:**
   * O banco de dados utiliza um **índice composto** (`siteId`, `droneId`, `type`, `detectedAt`) para otimizar buscas de duplicidade e agregações de ordenação por prioridade.

---

## 🛠️ Como Executar o Projeto

Você pode rodar a aplicação de duas formas: utilizando o **Docker** (recomendado) ou executando **manualmente** na sua máquina.

### Pré-requisitos
* Node.js v24+ instalado (caso vá rodar localmente)
* Docker e Docker Compose instalados (caso vá rodar via containers)

---

### Opção 1: Rodando com Docker Compose (Recomendado)

Esta opção sobe automaticamente a API e um container isolado do MongoDB em uma rede dedicada.

1. Clone o repositório e acesse a pasta do projeto.
2. Crie um arquivo `.env` na raiz com base no exemplo abaixo:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/occurrence-api