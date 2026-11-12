# News API - Minha Prefeitura

API REST **pública e somente leitura (GET)** para consumo pelos aplicativos mobile do projeto **Minha Prefeitura**. Os dados são isolados por prefeitura (multi-tenant) e armazenados em **MySQL**.

- Sem autenticação (API aberta)
- Apenas endpoints `GET`
- Documentação interativa com **Swagger UI**
- Conexão MySQL com pool (`mysql2`)
- Estrutura criada via **migrations**
- Carga inicial via arquivo de **seed**
- Configuração por `.env`
- Docker pronto, expondo a API na **porta externa 8500**

## Stack

- Node.js 20+ (testado com Node 24)
- Express 4
- MySQL 8
- `mysql2`
- `swagger-ui-express`
- Docker / Docker Compose

## Estrutura do projeto

```text
.
├── Dockerfile
├── docker-compose.yml          # MySQL + API (8500 -> 3000)
├── .env                        # configuração local
├── .env.example
├── migrations/
│   ├── 001_create_tenants.sql
│   ├── 002_create_noticias.sql
│   └── 003_create_notificacoes.sql
├── scripts/
│   ├── migrate.js              # executor de migrations
│   └── seed.js                 # carga do seed
├── seed_prefeituras_multitenant.sql
└── src/
    ├── app.js
    ├── server.js
    ├── config/                 # env + OpenAPI
    ├── controllers/
    ├── repositories/           # SQL
    ├── services/
    ├── middlewares/
    ├── routes/
    └── utils/
```

## Configuração (`.env`)

```env
NODE_ENV=development
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=minha_prefeitura
DB_PASSWORD=minha_prefeitura
DB_NAME=minha_prefeitura
DB_POOL_LIMIT=10
```

> O `npm run migrate` cria o banco `DB_NAME` automaticamente caso ele não exista.

## Rodando localmente

Pré-requisitos: Node.js 20+ e MySQL acessível com as credenciais do `.env`.

```bash
npm install
npm run migrate   # cria as tabelas
npm run seed      # carrega 5 prefeituras, 115 notícias e 38 notificações
npm start         # http://localhost:3000
```

Durante o desenvolvimento:

```bash
npm run dev       # reinício automático com node --watch
```

- Swagger UI: <http://localhost:3000/docs>
- OpenAPI JSON: <http://localhost:3000/docs.json>
- Health check: <http://localhost:3000/api/v1/health>

### Seed

O script usa por padrão o arquivo `seed_prefeituras_multitenant.sql`. Para usar outro arquivo, defina `SEED_FILE` no `.env`.

O seed é idempotente na prática: se já existirem tenants, ele não executa novamente. Para limpar e recarregar:

```bash
npm run seed -- --reset
```

## Rodando com Docker (porta externa 8500)

O compose sobe o **MySQL 8 + API** de forma isolada. Na primeira inicialização, o container da API aguarda o MySQL, aplica as migrations e carrega o seed automaticamente.

```bash
docker compose up -d --build
```

- API: **<http://localhost:8500>**
- Swagger UI: **<http://localhost:8500/docs>**
- MySQL: `localhost:3306` (usuário `minha_prefeitura`, senha `minha_prefeitura`)

A porta interna da API é `3000`; a externa é `8500`.

Acompanhar logs (úteis para ver migrations/seed):

```bash
docker compose logs -f api
```

Para parar:

```bash
docker compose down          # mantém os dados
docker compose down -v       # remove também o volume do MySQL
```

> Se você já tiver um MySQL local usando a porta `3306`, pare-o antes ou altere o mapeamento para `"3307:3306"` no compose. Nesse caso, ajuste também `DB_PORT` no `.env` para execução local.

## Endpoints

Todos os endpoints são `GET`, abertos e sem token. O tenant é identificado pelo `tenantSlug` na URL.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/v1/health` | Saúde da API e conexão com o MySQL |
| GET | `/api/v1/tenants` | Lista prefeituras ativas |
| GET | `/api/v1/tenants/:tenantSlug` | Detalha uma prefeitura |
| GET | `/api/v1/tenants/:tenantSlug/noticias` | Lista notícias publicadas |
| GET | `/api/v1/tenants/:tenantSlug/noticias/:noticiaSlug` | Detalha uma notícia |
| GET | `/api/v1/tenants/:tenantSlug/notificacoes` | Lista notificações ativas |
| GET | `/api/v1/tenants/:tenantSlug/notificacoes/:notificacaoId` | Detalha uma notificação |

### Parâmetros de paginação

Aplicáveis às listagens (`tenants`, `noticias`, `notificacoes`):

| Parâmetro | Padrão | Limite | Descrição |
| --- | --- | --- | --- |
| `page` | `1` | mínimo `1` | Página desejada |
| `per_page` | `10` | máximo `100` | Itens por página |

Filtros adicionais:

- `noticias`: `q` (busca por título ou resumo, até 100 caracteres)
- `notificacoes`: `tipo` (`alerta`, `campanha`, `utilidade_publica`, `emergencia`)

### Regras de visibilidade

- **Notícias:** somente `status = 'publicado'`, sem `deleted_at` e com `publicado_em <= NOW()`.
- **Notificações:** somente `ativo = 1`, com `enviado_em <= NOW()` e `expira_em` nulo ou futuro.

### Exemplos

```bash
# Listar prefeituras
curl http://localhost:8500/api/v1/tenants

# Notícias da prefeitura de Venda Nova do Imigrante
curl "http://localhost:8500/api/v1/tenants/venda-nova-do-imigrante/noticias?page=1&per_page=10"

# Buscar notícia por slug
curl "http://localhost:8500/api/v1/tenants/venda-nova-do-imigrante/noticias/<noticia-slug>"

# Alertas e campanhas ativas
curl "http://localhost:8500/api/v1/tenants/venda-nova-do-imigrante/notificacoes?tipo=campanha"
```

Resposta de listagem:

```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef0123456789",
      "titulo": "Prefeitura lança programa de revitalização de praças",
      "slug": "prefeitura-lanca-programa-de-revitalizacao-de-pracas",
      "resumo": "Iniciativa vai abranger dez bairros nos próximos meses.",
      "imagem_capa_url": "https://cdn.prefeitura.gov.br/imgs/pracas.jpg",
      "publicado_em": "2026-11-12T10:00:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 48
  }
}
```

Erro:

```json
{
  "error": {
    "status": 404,
    "message": "Prefeitura nao encontrada para o slug \"inexistente\"."
  }
}
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm start` | Sobe a API |
| `npm run dev` | Sobe com `node --watch` |
| `npm run migrate` | Aplica as migrations pendentes |
| `npm run seed` | Carrega o seed (se o banco estiver vazio) |
| `npm run seed -- --reset` | Limpa e recarrega o seed |
| `npm run db:setup` | Executa migrations + seed |

## Modelo de dados

- `tenants`: prefeituras (`id`, `nome`, `slug`, `codigo_ibge`, `ativo`, timestamps)
- `noticias`: notícias por tenant (`tenant_id`, `titulo`, `slug`, `resumo`, `conteudo`, `imagem_capa_url`, `status`, `publicado_em`, soft delete)
- `notificacoes`: alertas/campanhas por tenant (`tenant_id`, `titulo`, `mensagem`, `tipo`, `link_acao`, `enviado_em`, `expira_em`, `ativo`)

Consulte `modelo_de_dados_api_minha_prefeitura.md` para a especificação completa.
