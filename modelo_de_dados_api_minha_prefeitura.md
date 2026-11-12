# Modelo de Dados API - Projeto "Minha Prefeitura" (Multi-Tenant)

Esta documentação apresenta a arquitetura relacional do banco de dados estruturada com **multi-tenancy nativo** (através de `tenant_id` em UUID) para suportar múltiplas prefeituras de forma isolada, ideal para consumo via API REST nos aplicativos dos alunos.

## 1. Visão Geral das Tabelas

* **`tenants` (Prefeituras):** Isola os dados de cada município participante.

* **`noticias` (Notícias):** Gerencia as matérias, comunicados e informativos municipais.

* **`notificacoes` (Notificações / Alertas):** Gerencia os avisos rápidos do tipo push/banner (ex: "Campanha de Alimentos", alertas de Defesa Civil).

## 2. Estrutura do Banco de Dados

### Tabela: `tenants` (Prefeituras / Municípios)

Armazena os dados cadastrais de cada prefeitura participante da plataforma.

| Coluna | Tipo | Chave / Restrições | Descrição | 
| ----- | ----- | ----- | ----- | 
| `id` | UUID | PK | Identificador único da prefeitura | 
| `nome` | VARCHAR(150) | NOT NULL | Nome da cidade (ex: "Prefeitura de Venda Nova") | 
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | Identificador URL-friendly (ex: "venda-nova") | 
| `codigo_ibge` | VARCHAR(7) | UNIQUE, NULLABLE | Código oficial do IBGE para integrações territoriais | 
| `ativo` | BOOLEAN | DEFAULT TRUE | Status operacional do tenant | 
| `created_at` | TIMESTAMP | DEFAULT NOW() | Data de cadastro | 
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última atualização | 

### Tabela: `noticias`

Armazena as postagens e informativos oficiais da prefeitura. O isolamento multi-tenant é garantido pelo `tenant_id`.

| Coluna | Tipo | Chave / Restrições | Descrição | 
| ----- | ----- | ----- | ----- | 
| `id` | UUID | PK | Identificador único da notícia | 
| `tenant_id` | UUID | FK (`tenants.id`), INDEX | **Chave de multi-tenancy** (vínculo com a prefeitura) | 
| `titulo` | VARCHAR(255) | NOT NULL | Título principal da matéria | 
| `slug` | VARCHAR(255) | NOT NULL | URL amigável do post (único por tenant) | 
| `resumo` | TEXT | NOT NULL | Subtítulo ou resumo exibido nas listagens do app | 
| `conteudo` | LONGTEXT | NOT NULL | Corpo completo da notícia (suporta HTML ou Markdown) | 
| `imagem_capa_url` | VARCHAR(500) | NULLABLE | URL da imagem principal da notícia | 
| `status` | VARCHAR(20) | DEFAULT 'rascunho' | Estados: `rascunho`, `publicado`, `arquivado` | 
| `publicado_em` | TIMESTAMP | NULLABLE | Data/hora oficial de publicação no app | 
| `created_at` | TIMESTAMP | DEFAULT NOW() | Data de criação do registro | 
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última atualização | 
| `deleted_at` | TIMESTAMP | NULLABLE | Suporte a Soft Deletes | 

> **Índices recomendados:** `INDEX (tenant_id, status, publicado_em)` para otimizar a listagem cronológica por prefeitura.

### Tabela: `notificacoes` (Alertas e Campanhas)

Focada em mensagens rápidas e alertas (como a "Campanha de Alimentos" ou avisos emergenciais).

| Coluna | Tipo | Chave / Restrições | Descrição | 
| ----- | ----- | ----- | ----- | 
| `id` | UUID | PK | Identificador único da notificação | 
| `tenant_id` | UUID | FK (`tenants.id`), INDEX | **Chave de multi-tenancy** (vínculo com a prefeitura) | 
| `titulo` | VARCHAR(150) | NOT NULL | Título curto do alerta (ex: "Campanha de Arrecadação de Inverno") | 
| `mensagem` | TEXT | NOT NULL | Descrição detalhada do alerta ou chamada para ação | 
| `tipo` | VARCHAR(30) | NOT NULL | Classificação: `alerta`, `campanha`, `utilidade_publica`, `emergencia` | 
| `link_acao` | VARCHAR(500) | NULLABLE | URL externa ou deep link caso o usuário queira mais detalhes | 
| `enviado_em` | TIMESTAMP | DEFAULT NOW() | Momento em que o alerta foi disparado | 
| `expira_em` | TIMESTAMP | NULLABLE | Data limite para o alerta expirar no app | 
| `ativo` | BOOLEAN | DEFAULT TRUE | Controle manual para desativar o alerta antecipadamente | 
| `created_at` | TIMESTAMP | DEFAULT NOW() | Data de criação | 
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última atualização | 

> **Índices recomendados:** `INDEX (tenant_id, ativo, expira_em)` para buscar rapidamente notificações ativas de uma prefeitura específica.

## 3. Exemplos de Contrato de API para os Alunos

Para facilitar a integração no aplicativo mobile, os endpoints na API exigem o escopo do tenant na URL (através do `tenant_slug`) ou via cabeçalho (ex: `X-Tenant-ID`).

### Exemplo 1: Listar Notícias de uma Prefeitura

* **Endpoint:** `GET /api/v1/tenants/{tenant_slug}/noticias`

* **Query Params (opcionais):** `page`, `per_page`

* **Response JSON esperado:**

```
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef0123456789",
      "titulo": "Prefeitura lança programa de revitalização de praças",
      "slug": "prefeitura-lanca-programa-revitalizacao",
      "resumo": "Iniciativa vai abranger dez bairros nos próximos meses.",
      "imagem_capa_url": "https://cdn.prefeitura.gov.br/imgs/pracas.jpg",
      "publicado_em": "2026-11-12T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "total": 48
  }
}

```

### Exemplo 2: Listar Notificações / Alertas Ativos

* **Endpoint:** `GET /api/v1/tenants/{tenant_slug}/notificacoes`

* **Response JSON esperado:**

```
{
  "data": [
    {
      "id": "f9e8d7c6-b5a4-3210-fedc-ba9876543210",
      "titulo": "Campanha de Alimentos",
      "mensagem": "Doe 1kg de alimento não perecível no posto de saúde mais próximo.",
      "tipo": "campanha",
      "link_acao": "https://prefeitura.gov.br/campanha-alimentos",
      "enviado_em": "2026-11-12T08:30:00Z"
    }
  ]
}

```