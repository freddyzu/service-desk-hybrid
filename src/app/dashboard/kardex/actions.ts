'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createInsumo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar rol
  const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'coordinador') {
    redirect('/dashboard/kardex?error=No autorizado')
  }

  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string
  const stock_actual = parseInt(formData.get('stock_actual') as string, 10) || 0
  const stock_minimo = parseInt(formData.get('stock_minimo') as string, 10) || 0
  const unidad_medida = (formData.get('unidad_medida') as string) || 'unidad'

  const { error } = await supabase.from('insumos').insert({
    nombre,
    descripcion,
    stock_actual,
    stock_minimo,
    unidad_medida,
  })

  if (error) {
    console.error('Error al crear insumo:', error)
    redirect(`/dashboard/kardex/nuevo?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/kardex')
  redirect('/dashboard/kardex')
}
