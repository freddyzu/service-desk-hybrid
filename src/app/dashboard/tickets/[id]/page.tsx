import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { TicketActionsClient } from './TicketActionsClient'

type Insumo = { id: string; nombre: string; stock_actual: number; unidad_medida: string }
type TicketCreator = { nombre_completo?: string | null }

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*, perfiles!tickets_creador_id_fkey(nombre_completo)')
    .eq('id', id)
    .single()

  if (error || !ticket) {
    notFound()
  }

  // Comprobar rol
  const { data: { user } } = await supabase.auth.getUser()
  let isCoordinador = false
  if (user) {
    const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    isCoordinador = profile?.rol === 'coordinador'
  }

  // Traer insumos disponibles si es coordinador para el formulario de cierre
  let insumos: Insumo[] = []
  if (isCoordinador && (ticket.estado === 'aprobado' || ticket.estado === 'reabierto')) {
    const { data } = await supabase.from('insumos').select('*').order('nombre')
    if (data) insumos = data as Insumo[]
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto printable-area">
      
      {/* Estilos para impresión (Ocultar navs y botones extra) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .hide-on-print { display: none !important; }
        }
      `}} />

      <div className="flex items-center gap-2 hide-on-print">
        <Link href="/dashboard/tickets" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Detalle del Ticket</h2>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl mb-1">{ticket.titulo}</CardTitle>
              <CardDescription>
                Ticket ID: <span className="font-mono text-xs">{ticket.id}</span>
              </CardDescription>
            </div>
            <span className={`text-sm px-3 py-1 font-semibold rounded-full border ${
              ticket.estado === 'abierto' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              ticket.estado === 'resuelto' ? 'bg-green-50 text-green-700 border-green-200' :
              ticket.estado === 'reabierto' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {ticket.estado.toUpperCase()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-1">Solicitante</p>
              <p>{(() => { const creator = ticket.perfiles as TicketCreator | TicketCreator[] | null; return (Array.isArray(creator) ? creator[0]?.nombre_completo : creator?.nombre_completo) || 'Desconocido' })()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-1">Fecha de Solicitud</p>
              <p>{format(new Date(ticket.created_at), 'dd/MM/yyyy - HH:mm')}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-1">Ubicación</p>
            <p className="p-3 bg-muted/50 rounded-md">{ticket.ubicacion}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-1">Descripción del Problema</p>
            <p className="whitespace-pre-wrap p-4 bg-muted rounded-md text-sm">
              {ticket.descripcion}
            </p>
          </div>

          {/* Evidencia Fotográfica */}
          {ticket.fotos_urls && ticket.fotos_urls.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-2">Evidencia Fotográfica</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ticket.fotos_urls.map((fotoUrl: string, idx: number) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border bg-muted/30 p-1">
                    <img 
                      src={fotoUrl} 
                      alt={`Foto evidencia ${idx + 1}`} 
                      className="w-full h-auto max-h-80 object-contain rounded-md mx-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de firmas exclusiva para el documento físico impreso */}
          <div className="hidden print:block mt-12 pt-8 border-t-2 border-dashed">
            <h3 className="text-lg font-bold mb-8 text-center">ORDEN DE TRABAJO - CONTROL DE SERVICIOS</h3>
            <div className="flex justify-between px-8 mt-16">
              <div className="text-center">
                <div className="w-48 border-b border-black mb-2 mx-auto"></div>
                <p className="text-sm font-semibold">Firma Coordinador (Triaje)</p>
              </div>
              <div className="text-center">
                <div className="w-48 border-b border-black mb-2 mx-auto"></div>
                <p className="text-sm font-semibold">Firma Conserje (Ejecución)</p>
              </div>
            </div>
            <p className="text-xs text-center mt-8 text-gray-500">
              * El conserje debe entregar este documento firmado al coordinador una vez solucionado el problema.
            </p>
          </div>
        </CardContent>
      </Card>

      {isCoordinador && (
        <TicketActionsClient ticketId={ticket.id} estado={ticket.estado} insumos={insumos} />
      )}
    </div>
  )
}
