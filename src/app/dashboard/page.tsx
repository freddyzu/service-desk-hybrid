import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowUpRight, ClipboardCheck, PackageCheck } from 'lucide-react'

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
      <div className="border-b border-border pb-5">
        <p className="font-mono text-[10px] font-bold tracking-[.18em] text-primary">CENTRO DE OPERACIONES</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Resuelve con orden.</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Cada reporte se convierte en una acción trazable: contexto, ejecución y control de recursos.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Atajos Rápidos */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <ClipboardCheck className="mb-2 size-5 text-primary" />
            <CardTitle>Reportes y tickets</CardTitle>
            <CardDescription>Visualiza el estado y da seguimiento a cada solicitud.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tickets" className={buttonVariants({ className: "w-full font-mono text-xs font-bold tracking-wide" })}>
              VER TICKETS <ArrowUpRight className="size-4" />
            </Link>
          </CardContent>
        </Card>

        {isCoordinador && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <PackageCheck className="mb-2 size-5 text-primary" />
              <CardTitle>Control de insumos</CardTitle>
              <CardDescription>Consulta existencias y registra los recursos de la operación.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/kardex" className={buttonVariants({ variant: "secondary", className: "w-full font-mono text-xs font-bold tracking-wide" })}>
                ABRIR KÁRDEX <ArrowUpRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
