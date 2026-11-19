ALTER TABLE public.variedades
  ADD COLUMN IF NOT EXISTS descripcion_larga text NOT NULL DEFAULT '';
