import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

type TicketCreator = { nombre_completo?: string | null }

export default async function TicketsPage() {
  const supabase = await createClient()

  // Debido al RLS, esta consulta traerá los propios si es empleado, o todos si es coordinador.
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*, perfiles!tickets_creador_id_fkey(nombre_completo)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div><p className="font-mono text-[10px] font-bold tracking-[.18em] text-primary">OPERACIÓN</p><h2 className="text-2xl font-bold tracking-tight">Tickets</h2></div>
        </div>
        <Link href="/dashboard/tickets/nuevo" className={buttonVariants({ className: 'font-mono text-xs font-bold tracking-wide' })}>
          <Plus className="mr-2 h-4 w-4" /> NUEVO REPORTE
        </Link>
      </div>

      {error && <p className="text-destructive">Error al cargar los tickets.</p>}
      
      {!tickets || tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay reportes registrados todavía.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => {
            const creator = ticket.perfiles as TicketCreator | TicketCreator[] | null
            const creatorName = Array.isArray(creator) ? creator[0]?.nombre_completo : creator?.nombre_completo

            return (
              <Card key={ticket.id} className="border-border bg-card transition-colors hover:border-primary/50 hover:bg-muted/50">
                <Link href={`/dashboard/tickets/${ticket.id}`} className="block h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base truncate pr-2">{ticket.titulo}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.estado === 'abierto' ? 'bg-yellow-500/20 text-yellow-600' :
                        ticket.estado === 'resuelto' ? 'bg-green-500/20 text-green-600' :
                        ticket.estado === 'reabierto' ? 'bg-red-500/20 text-red-600' :
                        'bg-primary/15 text-primary'
                      }`}>
                        {ticket.estado}
                      </span>
                    </div>
                    <CardDescription className="text-xs">
                      {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm')}
                      <br />
                      Creado por: {creatorName || 'Desconocido'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground truncate">{ticket.descripcion}</p>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
