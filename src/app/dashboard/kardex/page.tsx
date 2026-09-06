import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function KardexPage() {
  const supabase = await createClient()
  
  // Proteger ruta
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'coordinador') {
    return (
      <div className="p-4 text-center text-destructive">
        No tienes permisos para ver el Kárdex.
      </div>
    )
  }

  const { data: insumos } = await supabase.from('insumos').select('*').order('nombre')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Kárdex de Insumos</h2>
        </div>
        <Link href="/dashboard/kardex/nuevo" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Insumo
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {insumos?.map(insumo => (
          <Card key={insumo.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base truncate">{insumo.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {insumo.stock_actual} <span className="text-sm font-normal text-muted-foreground">{insumo.unidad_medida}</span>
              </div>
              <p className="text-xs text-muted-foreground">Stock Mínimo: {insumo.stock_minimo}</p>
            </CardContent>
          </Card>
        ))}
        
        {(!insumos || insumos.length === 0) && (
          <p className="text-sm text-muted-foreground col-span-full">No hay insumos registrados en el inventario.</p>
        )}
      </div>
    </div>
  )
}
