import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticketId = searchParams.get('id')

  if (!ticketId) {
    return NextResponse.json({ error: 'Falta el ID del ticket' }, { status: 400 })
  }

  // Nota: En un sistema en producción real, aquí se debería validar
  // un token JWT emitido específicamente para esta acción para evitar 
  // que cualquiera con el UUID pueda reabrir el ticket.
  // Por simplicidad del modelo "Vibe Coding" actual, confiamos en el UUID.

  const supabase = await createClient()

  // 1. Verificar estado actual del ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('estado, coordinador_cierre_id')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  }

  if (ticket.estado !== 'resuelto') {
    return NextResponse.json({ error: 'El ticket no está en un estado válido para reapertura' }, { status: 400 })
  }

  // 2. Reabrir el ticket
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ 
      estado: 'reabierto',
      fecha_cierre: null // Reseteamos fecha de cierre 
    })
    .eq('id', ticketId)

  if (updateError) {
    return NextResponse.json({ error: 'Error al reabrir el ticket' }, { status: 500 })
  }

  // 3. Revalidamos la caché
  revalidatePath('/dashboard/tickets')
  revalidatePath(`/dashboard/tickets/${ticketId}`)

  // 4. Redirigimos al usuario a una página de confirmación dentro de la app
  return NextResponse.redirect(new URL(`/dashboard/tickets/${ticketId}?reabierto=true`, request.url))
}
