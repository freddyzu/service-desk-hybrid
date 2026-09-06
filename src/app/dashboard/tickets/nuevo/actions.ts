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
  const fotoFile = formData.get('foto') as File | null

  const fotos_urls: string[] = []

  // Subir imagen a Supabase Storage si el usuario adjuntó una
  if (fotoFile && fotoFile.size > 0) {
    try {
      const fileExt = fotoFile.name.split('.').pop() || 'jpg'
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('ticket-photos')
        .upload(filePath, fotoFile, {
          contentType: fotoFile.type || 'image/jpeg',
          upsert: false
        })

      if (uploadError) {
        console.error('Error subiendo imagen a Storage:', uploadError)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('ticket-photos')
          .getPublicUrl(filePath)
        
        fotos_urls.push(publicUrl)
      }
    } catch (uploadErr) {
      console.error('Excepción al procesar archivo de foto:', uploadErr)
    }
  }
  
  const { error } = await supabase.from('tickets').insert({
    creador_id: user.id,
    titulo,
    descripcion,
    ubicacion,
    fotos_urls,
    estado: 'abierto',
  })

  if (error) {
    console.error('Error al crear ticket:', error)
    redirect(`/dashboard/tickets/nuevo?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/tickets')
  redirect('/dashboard/tickets')
}
