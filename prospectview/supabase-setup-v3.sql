-- ============================================================
-- ProspectView v3 - Migração: Métricas por TIER
-- Executar no SQL Editor do painel Supabase
-- ============================================================

-- 1. Adicionar dimensões de TIER e sequência de ligação à tabela eventos
ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS tier integer CHECK (tier IN (1, 2, 3, 4)),
  ADD COLUMN IF NOT EXISTS sequencia_ligacao text
    CHECK (sequencia_ligacao IN ('cold1', 'cold2', 'cold3', 'fup'));

-- 2. Adicionar campo de reuniões realizadas à tabela registros
ALTER TABLE registros
  ADD COLUMN IF NOT EXISTS reunioes_realizadas integer DEFAULT 0;

-- 3. Índice para queries de métricas agrupadas por tier/sequência
CREATE INDEX IF NOT EXISTS idx_eventos_tier
  ON eventos (tier, sequencia_ligacao);

CREATE INDEX IF NOT EXISTS idx_eventos_tipo_tier
  ON eventos (tipo, tier, data);

-- ============================================================
-- Classificação de TIERs (referência):
-- Tier 4: cliente Skymail/Revenda, outro exec. tratando, ou < 50 funcionários
-- Tier 3: > 1.000 funcionários
-- Tier 2: 50–1.000 funcionários usando Microsoft ou Google
-- Tier 1: 50–1.000 funcionários NÃO usando Microsoft/Google
-- ============================================================
