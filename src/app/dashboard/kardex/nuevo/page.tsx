import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createInsumo } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NuevoInsumoPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/kardex" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Insumo</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar en Kárdex</CardTitle>
          <CardDescription>Añade un nuevo material o insumo al inventario.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createInsumo} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Insumo</Label>
              <Input name="nombre" placeholder="Ej: Foco LED 15W Luz Cálida" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input name="descripcion" placeholder="Ej: Para oficinas y baños" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock_actual">Stock Inicial</Label>
                <Input name="stock_actual" type="number" min="0" defaultValue="10" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock_minimo">Stock Mínimo (Alerta)</Label>
                <Input name="stock_minimo" type="number" min="0" defaultValue="3" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unidad_medida">Unidad de Medida</Label>
              <select 
                name="unidad_medida" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                defaultValue="unidad"
              >
                <option value="unidad">Unidad</option>
                <option value="pieza">Pieza</option>
                <option value="galón">Galón</option>
                <option value="litro">Litro</option>
                <option value="rollo">Rollo</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {decodeURIComponent(error)}
              </p>
            )}

            <Button type="submit" className="w-full mt-2">
              Guardar Insumo en Kárdex
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
