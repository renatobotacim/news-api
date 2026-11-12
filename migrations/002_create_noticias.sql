CREATE TABLE IF NOT EXISTS noticias (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  resumo TEXT NOT NULL,
  conteudo LONGTEXT NOT NULL,
  imagem_capa_url VARCHAR(500) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'rascunho',
  publicado_em TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_noticias_tenant_slug (tenant_id, slug),
  KEY idx_noticias_tenant_status_publicado (tenant_id, status, publicado_em),
  CONSTRAINT fk_noticias_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
