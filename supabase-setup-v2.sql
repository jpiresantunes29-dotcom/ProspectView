-- ================================================================
-- ProspectView v2 — Rodar no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/xvtuhtkfhnmzehsfmgsw/sql/new
-- ================================================================

-- 1. Novas colunas na tabela existente registros
ALTER TABLE registros
  ADD COLUMN IF NOT EXISTS follow_ups        integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ligacoes_feitas   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ligacoes_sucesso  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ligacoes_falha    integer NOT NULL DEFAULT 0;

-- 2. Tabela de eventos para o Quick Log (feed com timestamp)
CREATE TABLE IF NOT EXISTS eventos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  data         date        NOT NULL,
  usuario      text        NOT NULL CHECK (usuario IN ('joao_pedro', 'atanael')),
  tipo         text        NOT NULL,
  criado_em    timestamptz NOT NULL DEFAULT now(),
  motivo_falha text        NULL
);

CREATE INDEX IF NOT EXISTS eventos_data_usuario_idx ON eventos (data, usuario);
CREATE INDEX IF NOT EXISTS eventos_criado_em_idx    ON eventos (criado_em DESC);

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'eventos' AND policyname = 'allow all'
  ) THEN
    CREATE POLICY "allow all" ON eventos FOR ALL USING (true) WITH CHECK (true);
  END IF;
END$$;

-- 3. Função para incremento atômico — usada pelo Quick Log
CREATE OR REPLACE FUNCTION incrementar_registro(
  p_data    date,
  p_usuario text,
  p_campo   text,
  p_delta   integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Garante que a linha existe
  INSERT INTO registros (data, usuario)
  VALUES (p_data, p_usuario)
  ON CONFLICT (data, usuario) DO NOTHING;

  -- Incremento atômico via SQL dinâmico
  EXECUTE format(
    'UPDATE registros SET %I = %I + $1 WHERE data = $2 AND usuario = $3',
    p_campo, p_campo
  ) USING p_delta, p_data, p_usuario;
END;
$$;
