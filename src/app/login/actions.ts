'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error login:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre_completo = formData.get('nombre_completo') as string

  console.log('Intentando registrar:', { email, nombre_completo })

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_completo,
      }
    }
  })

  if (error) {
    console.error('Error signup:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  // Si Supabase tiene confirmación de email activa, no devuelve session inmediatamente
  if (data.user && !data.session) {
    redirect('/login?message=Cuenta+creada.+Por+favor+revisa+tu+correo+para+confirmar+tu+cuenta+o+inicia+sesión.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
