'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendTicketClosedEmail } from '@/utils/emails/resend'

export async function approveTicket(ticketId: string) {
  const supabase = await createClient()

  // Obtener rol del usuario actual (solo coordinadores pueden aprobar)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'coordinador') throw new Error('Solo coordinadores pueden aprobar tickets')

  const { error } = await supabase
    .from('tickets')
    .update({ estado: 'aprobado' })
    .eq('id', ticketId)

  if (error) {
    console.error('Error aprobando ticket:', error)
    throw new Error('Error al aprobar el ticket')
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`)
}

export async function closeTicket(formData: FormData) {
  const supabase = await createClient()
  
  const ticketId = formData.get('ticketId') as string
  const insumoId = formData.get('insumoId') as string
  const cantidad = parseInt(formData.get('cantidad') as string, 10)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Array JSON requerido por nuestra función RPC
  // Formato: [{insumo_id: "uuid", cantidad: int}]
  const insumosUtilizados = (insumoId && !isNaN(cantidad) && cantidad > 0) 
    ? [{ insumo_id: insumoId, cantidad }] 
    : [] // Puede cerrarse sin usar insumos

  // Obtener el correo del creador del ticket antes de cerrarlo
  const { data: ticketData } = await supabase
    .from('tickets')
    .select('titulo, perfiles!tickets_creador_id_fkey(email)')
    .eq('id', ticketId)
    .single()

  const { error } = await supabase.rpc('cerrar_ticket_y_descontar', {
    p_ticket_id: ticketId,
    p_coordinador_id: user.id,
    p_insumos_utilizados: insumosUtilizados
  })

  if (error) {
    console.error('Error al cerrar ticket y descontar:', error)
    redirect(`/dashboard/tickets/${ticketId}?error=No se pudo cerrar el ticket`)
  }

  // Integración con Resend para el envío del correo del "Candado Digital"
  const userProfile = ticketData?.perfiles as { email?: string | null } | { email?: string | null }[] | null
  const userEmail = Array.isArray(userProfile) ? userProfile[0]?.email : userProfile?.email
  if (userEmail && ticketData) {
    await sendTicketClosedEmail(userEmail, ticketId, ticketData.titulo)
  }

  revalidatePath('/dashboard/tickets')
  redirect(`/dashboard/tickets/${ticketId}?success=Ticket cerrado exitosamente`)
}
