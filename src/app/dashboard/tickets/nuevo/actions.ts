'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTicket(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const titulo = formData.get('titulo') as string
  const descripcion = formData.get('descripcion') as string
  const ubicacion = formData.get('ubicacion') as string

  // TODO: Manejo de subida de imágenes a Supabase Storage (omitido por simplicidad inicial)
  
  const { error } = await supabase.from('tickets').insert({
    creador_id: user.id,
    titulo,
    descripcion,
    ubicacion,
    estado: 'abierto',
  })

  if (error) {
    // Retornar error al cliente si falla (debe manejarse en el form si usamos useActionState, pero usaremos redirect por ahora)
    console.error('Error al crear ticket:', error)
    redirect('/dashboard/tickets/nuevo?error=Error al crear ticket')
  }

  revalidatePath('/dashboard/tickets')
  redirect('/dashboard/tickets')
}
