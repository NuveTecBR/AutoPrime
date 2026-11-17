-- ============================================================================
-- AUTOPRIME SEMINOVOS — DDL & SEEDS (SQLite / Método ENDS)
-- Aviso: Dados 100% fictícios para demonstração de portfólio Nuvetec
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  cargo TEXT NOT NULL DEFAULT 'vendedor' CHECK (cargo IN ('lojista', 'vendedor')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS veiculos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  versao TEXT NOT NULL,
  ano_fabricacao INTEGER NOT NULL,
  ano_modelo INTEGER NOT NULL,
  preco REAL NOT NULL CHECK (preco > 0),
  quilometragem INTEGER NOT NULL DEFAULT 0 CHECK (quilometragem >= 0),
  cambio TEXT NOT NULL CHECK (cambio IN ('Automático', 'Manual', 'CVT')),
  combustivel TEXT NOT NULL CHECK (combustivel IN ('Flex', 'Diesel', 'Híbrido', 'Gasolina', 'Elétrico')),
  cor TEXT NOT NULL,
  final_placa INTEGER NOT NULL CHECK (final_placa BETWEEN 0 AND 9),
  carroceria TEXT NOT NULL CHECK (carroceria IN ('SUV', 'Sedan', 'Hatch', 'Picape')),
  destaque INTEGER NOT NULL DEFAULT 0,
  laudo_cautelar TEXT NOT NULL DEFAULT '100% Aprovado Dekra',
  garantia_meses INTEGER NOT NULL DEFAULT 12,
  imagem_url TEXT NOT NULL,
  itens_serie TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Disponível' CHECK (status IN ('Disponível', 'Reservado', 'Vendido')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS simulacoes_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT NOT NULL UNIQUE,
  veiculo_id INTEGER NOT NULL,
  tipo_atendimento TEXT NOT NULL DEFAULT 'Simulação & Test-Drive' CHECK (tipo_atendimento IN ('Simulação & Test-Drive', 'Avaliação de Troca', 'Proposta à Vista')),
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  valor_entrada REAL NOT NULL DEFAULT 0,
  prazo_meses INTEGER NOT NULL DEFAULT 48,
  valor_parcela REAL NOT NULL DEFAULT 0,
  taxa_juros_mensal REAL NOT NULL DEFAULT 1.49,
  possui_troca INTEGER NOT NULL DEFAULT 0,
  descricao_troca TEXT,
  consentimento_lgpd INTEGER NOT NULL CHECK (consentimento_lgpd = 1),
  status TEXT NOT NULL DEFAULT 'Novo Lead' CHECK (status IN ('Novo Lead', 'Em Negociação', 'Test-Drive Agendado', 'Concluído')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS solicitacoes_lgpd (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT NOT NULL UNIQUE,
  nome_titular TEXT NOT NULL,
  email_titular TEXT NOT NULL,
  tipo_direito TEXT NOT NULL CHECK (tipo_direito IN ('Confirmacao', 'Acesso', 'Correcao', 'Exclusao')),
  detalhes TEXT,
  status TEXT NOT NULL DEFAULT 'Recebido',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_veiculos_marca ON veiculos(marca);
CREATE INDEX IF NOT EXISTS idx_veiculos_carroceria ON veiculos(carroceria);
CREATE INDEX IF NOT EXISTS idx_veiculos_preco ON veiculos(preco);
CREATE INDEX IF NOT EXISTS idx_veiculos_status ON veiculos(status);
CREATE INDEX IF NOT EXISTS idx_leads_veiculo ON simulacoes_leads(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_leads_protocolo ON simulacoes_leads(protocolo);
