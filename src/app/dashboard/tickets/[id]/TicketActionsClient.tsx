'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Printer, CheckCircle } from 'lucide-react'
import { approveTicket, closeTicket } from './actions'
import { useState, useTransition } from 'react'

type Insumo = { id: string; nombre: string; stock_actual: number; unidad_medida: string }

export function TicketActionsClient({ 
  ticketId, 
  estado, 
  insumos 
}: { 
  ticketId: string, 
  estado: string, 
  insumos: Insumo[] 
}) {
  const [isPending, startTransition] = useTransition()
  const [showCloseForm, setShowCloseForm] = useState(false)

  const handleApprove = () => {
    startTransition(async () => {
      await approveTicket(ticketId)
    })
  }

  const handlePrint = () => {
    window.print()
  }

  if (estado === 'resuelto' || estado === 'cerrado_definitivo') {
    return (
      <Card className="mt-6 border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6 flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <p className="font-medium">Este ticket ya fue resuelto.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Botones de acción principal */}
      <div className="flex flex-wrap gap-2 hide-on-print">
        {estado === 'abierto' && (
          <Button onClick={handleApprove} disabled={isPending}>
            {isPending ? 'Aprobando...' : 'Aprobar Ticket'}
          </Button>
        )}
        
        {(estado === 'abierto' || estado === 'aprobado' || estado === 'reabierto') && (
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Orden Física
          </Button>
        )}

        {(estado === 'aprobado' || estado === 'reabierto') && (
          <Button variant="default" onClick={() => setShowCloseForm(!showCloseForm)}>
            <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Resuelto
          </Button>
        )}
      </div>

      {/* Formulario de Cierre Atómico */}
      {showCloseForm && (
        <Card className="border-primary/40 hide-on-print mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Cierre y Consumo de Material</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={closeTicket} className="flex flex-col gap-4">
              <input type="hidden" name="ticketId" value={ticketId} />
              
              <div className="grid gap-2">
                <Label htmlFor="insumoId">Insumo Utilizado (Opcional)</Label>
                <select 
                  name="insumoId" 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Ninguno (o no requerido) --</option>
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id} disabled={i.stock_actual <= 0}>
                      {i.nombre} (Stock: {i.stock_actual} {i.unidad_medida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cantidad">Cantidad Utilizada</Label>
                <Input type="number" name="cantidad" min="1" defaultValue="1" />
              </div>

              <Button type="submit" className="w-full">
                Confirmar Cierre y Descontar Inventario
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
