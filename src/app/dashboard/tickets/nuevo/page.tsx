import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createTicket } from './actions'
import Link from 'next/link'
import { ArrowLeft, Camera } from 'lucide-react'

export default async function NuevoTicketPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/tickets" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Reportar Avería</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Problema</CardTitle>
          <CardDescription>Describe el insumo faltante o la avería a solucionar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTicket} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título breve</Label>
              <Input name="titulo" placeholder="Ej: Foco fundido en pasillo 3" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ubicacion">Ubicación exacta</Label>
              <Input name="ubicacion" placeholder="Piso 2, Baño de hombres" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción detallada</Label>
              <textarea 
                name="descripcion" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="El foco parpadea constantemente y no ilumina bien." 
                required 
              />
            </div>

            {/* Carga real de fotografía */}
            <div className="grid gap-2">
              <Label htmlFor="foto" className="flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-muted-foreground" />
                Fotografía de la avería (Opcional)
              </Label>
              <Input 
                id="foto"
                name="foto" 
                type="file" 
                accept="image/*"
                className="cursor-pointer file:cursor-pointer file:text-primary file:font-medium"
              />
              <p className="text-xs text-muted-foreground">Puedes adjuntar una foto o tomarla con la cámara de tu móvil.</p>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{decodeURIComponent(error)}</p>}

            <Button type="submit" className="w-full mt-2">Enviar Reporte</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
