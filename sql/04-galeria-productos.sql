ALTER TABLE public.variedades
  ADD COLUMN IF NOT EXISTS fotos jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.variedades
SET fotos = jsonb_build_array(imagen_url)
WHERE imagen_url IS NOT NULL
  AND (fotos IS NULL OR fotos = '[]'::jsonb);
