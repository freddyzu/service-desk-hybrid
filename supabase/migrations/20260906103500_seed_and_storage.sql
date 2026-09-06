-- Crear bucket de almacenamiento público para fotos de tickets
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-photos', 'ticket-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de RLS en Storage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Lectura publica de fotos de tickets'
    ) THEN
        CREATE POLICY "Lectura publica de fotos de tickets"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'ticket-photos');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Subida de fotos por usuarios autenticados'
    ) THEN
        CREATE POLICY "Subida de fotos por usuarios autenticados"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'ticket-photos' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Permitir INSERT explícito a coordinadores en insumos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Coordinadores pueden insertar insumos'
    ) THEN
        CREATE POLICY "Coordinadores pueden insertar insumos"
        ON public.insumos FOR INSERT
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'coordinador')
        );
    END IF;
END $$;

-- Insumos de prueba para el Kárdex
INSERT INTO public.insumos (nombre, descripcion, stock_actual, stock_minimo, unidad_medida)
VALUES
  ('Foco LED 15W Luz Blanca', 'Foco ahorrador para oficinas y pasillos', 30, 5, 'unidad'),
  ('Jabón Líquido Antibacterial 5L', 'Insumo de recarga para dispensadores de baños', 10, 2, 'galón'),
  ('Papel Higiénico Jumbo', 'Rollo institucional de doble hoja', 50, 10, 'rollo'),
  ('Tubo LED T8 18W 120cm', 'Luminaria para salas de conferencias', 15, 3, 'unidad'),
  ('Pastillas Desinfectantes para Baño', 'Pastillas aromáticas y desinfectantes para sanitarios', 25, 5, 'paquete')
ON CONFLICT DO NOTHING;
