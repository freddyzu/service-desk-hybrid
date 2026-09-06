# Documento de Continuidad: Service Desk Híbrido

Este documento existe para retomar el proyecto sin pérdida de contexto.

## Estado Actual (Fase 5 Completada)
Todo el código base (Backend y Frontend unificado en Next.js) está escrito y versionado en Git.

**Módulos Terminados:**
1. **Base de Datos (Supabase):** Migración creada con el modelo relacional completo (Perfiles, Kárdex, Tickets, Movimientos), RLS, Enums y una función RPC (`cerrar_ticket_y_descontar`) para el cierre atómico.
2. **Autenticación:** Server Actions listos (`/login` y `/signup`). Rutas protegidas mediante Middleware.
3. **Módulo de Tickets:** Flujo del empleado (crear ticket y listarlos) y flujo del coordinador (aprobar, imprimir orden y cerrar atómicamente).
4. **Candado Digital (Resend):** La utilidad para mandar correos y el endpoint `/api/tickets/reopen` para que el empleado reabra el ticket están creados e integrados en el código de cierre.

## ¿Qué falta hacer al retomar? (El Despliegue - Fase 6)

1. **Configurar el entorno local (`.env.local`):**
   - El código necesita las credenciales para funcionar. Deberás crear un archivo `.env.local` en la raíz del proyecto basándote en la plantilla de abajo.
   - Conectar con tu cuenta recién creada de Supabase y Resend.

2. **Impactar la Base de Datos (Migración):**
   - Necesitarás empujar la estructura local de SQL hacia tu proyecto de Supabase en la nube usando la terminal:
     ```bash
     npx supabase login
     npx supabase link --project-ref TU_REF_ID
     npx supabase db push
     ```

3. **Probar el Flujo End-to-End en Local:**
   - Correr `npm run dev`.
   - Registrarte como un usuario normal.
   - Forzar el rol de ese usuario a `coordinador` desde el Dashboard de Supabase (Editor SQL o Tabla `perfiles`) para poder probar el flujo completo de cierre y descuento de inventario.

4. **Desplegar en Vercel:**
   - Una vez probado en local, conectar el repositorio de GitHub con Vercel.
   - Pasar las mismas variables del `.env.local` al panel de Variables de Entorno de Vercel.

---

### Plantilla de `.env.local` pendiente de crear mañana:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[TU_REF_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_anon_key_aqui"

# Resend
RESEND_API_KEY="tu_api_key_de_resend_aqui"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
