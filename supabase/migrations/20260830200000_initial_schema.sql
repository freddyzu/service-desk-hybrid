-- Enums
CREATE TYPE rol_usuario AS ENUM ('empleado', 'coordinador');
CREATE TYPE estado_ticket AS ENUM ('abierto', 'aprobado', 'resuelto', 'reabierto', 'cerrado_definitivo');
CREATE TYPE tipo_movimiento AS ENUM ('entrada', 'salida');

-- Perfiles (Extiende auth.users)
CREATE TABLE public.perfiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    rol rol_usuario DEFAULT 'empleado' NOT NULL,
    nombre_completo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Perfiles
CREATE POLICY "Perfiles visibles para todos los autenticados" 
ON public.perfiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON public.perfiles FOR UPDATE USING (auth.uid() = id);

-- Kárdex de Insumos
CREATE TABLE public.insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    stock_actual INTEGER DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INTEGER DEFAULT 0,
    unidad_medida TEXT DEFAULT 'unidad',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;

-- Políticas de Insumos (Todos ven, coordinadores modifican)
CREATE POLICY "Insumos visibles para todos los autenticados" 
ON public.insumos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo coordinadores pueden modificar insumos" 
ON public.insumos FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'coordinador')
);

-- Tickets
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creador_id UUID REFERENCES public.perfiles(id) NOT NULL,
    estado estado_ticket DEFAULT 'abierto' NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    ubicacion TEXT NOT NULL,
    fotos_urls TEXT[] DEFAULT '{}',
    coordinador_cierre_id UUID REFERENCES public.perfiles(id),
    fecha_cierre TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de Tickets
CREATE POLICY "Empleados ven sus propios tickets" 
ON public.tickets FOR SELECT 
USING (creador_id = auth.uid());

CREATE POLICY "Coordinadores ven todos los tickets" 
ON public.tickets FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'coordinador'));

CREATE POLICY "Empleados pueden crear tickets" 
ON public.tickets FOR INSERT 
WITH CHECK (creador_id = auth.uid());

CREATE POLICY "Coordinadores pueden actualizar tickets" 
ON public.tickets FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'coordinador'));

-- Ticket Insumos (Tabla pivote)
CREATE TABLE public.ticket_insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    insumo_id UUID REFERENCES public.insumos(id) ON DELETE RESTRICT NOT NULL,
    cantidad_aprobada INTEGER NOT NULL CHECK (cantidad_aprobada > 0),
    cantidad_utilizada INTEGER CHECK (cantidad_utilizada >= 0)
);

ALTER TABLE public.ticket_insumos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso a ticket_insumos" 
ON public.ticket_insumos FOR ALL 
USING (auth.role() = 'authenticated');

-- Movimientos Inventario
CREATE TABLE public.movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo_id UUID REFERENCES public.insumos(id) NOT NULL,
    ticket_id UUID REFERENCES public.tickets(id),
    cantidad INTEGER NOT NULL,
    tipo_movimiento tipo_movimiento NOT NULL,
    responsable_id UUID REFERENCES public.perfiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movimientos visibles para todos los autenticados" 
ON public.movimientos_inventario FOR SELECT USING (auth.role() = 'authenticated');

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON public.perfiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_insumos_updated_at BEFORE UPDATE ON public.insumos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para crear perfil automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre_completo)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nombre_completo');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función RPC para Cierre Atómico de Tickets
CREATE OR REPLACE FUNCTION public.cerrar_ticket_y_descontar(
  p_ticket_id UUID,
  p_coordinador_id UUID,
  p_insumos_utilizados JSONB
) RETURNS VOID AS $$
DECLARE
  v_item JSONB;
BEGIN
  -- Validar coordinador
  IF NOT EXISTS (SELECT 1 FROM public.perfiles WHERE id = p_coordinador_id AND rol = 'coordinador') THEN
    RAISE EXCEPTION 'Usuario no autorizado';
  END IF;

  -- Actualizar el ticket
  UPDATE public.tickets
  SET estado = 'resuelto',
      coordinador_cierre_id = p_coordinador_id,
      fecha_cierre = NOW()
  WHERE id = p_ticket_id AND estado IN ('abierto', 'aprobado', 'reabierto');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket no encontrado o inválido';
  END IF;

  -- Iterar e insertar
  IF p_insumos_utilizados IS NOT NULL AND jsonb_array_length(p_insumos_utilizados) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_insumos_utilizados)
    LOOP
      UPDATE public.insumos
      SET stock_actual = stock_actual - (v_item->>'cantidad')::INTEGER
      WHERE id = (v_item->>'insumo_id')::UUID;

      UPDATE public.ticket_insumos
      SET cantidad_utilizada = (v_item->>'cantidad')::INTEGER
      WHERE ticket_id = p_ticket_id AND insumo_id = (v_item->>'insumo_id')::UUID;

      INSERT INTO public.movimientos_inventario (insumo_id, ticket_id, cantidad, tipo_movimiento, responsable_id)
      VALUES ((v_item->>'insumo_id')::UUID, p_ticket_id, (v_item->>'cantidad')::INTEGER, 'salida', p_coordinador_id);
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
