import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const isCoordinador = profile?.rol === 'coordinador'

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold tracking-tight">Bienvenido</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Atajos Rápidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Mis Tickets</CardTitle>
            <CardDescription>Visualiza el estado de tus reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tickets" className={buttonVariants({ className: "w-full" })}>
              Ver Tickets
            </Link>
          </CardContent>
        </Card>

        {isCoordinador && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Gestión de Insumos</CardTitle>
              <CardDescription>Administra el inventario actual</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/kardex" className={buttonVariants({ variant: "secondary", className: "w-full" })}>
                Ir al Kárdex
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
