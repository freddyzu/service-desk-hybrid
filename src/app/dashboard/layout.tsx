import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Ticket, User, Package } from 'lucide-react'
import { MagmaBrand } from '@/components/magma-brand'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil para saber si es coordinador
  const { data: profile } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const isCoordinador = profile?.rol === 'coordinador'

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Navbar / Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:opacity-80"><MagmaBrand /></Link>
          {/* Navegación Desktop */}
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Inicio
            </Link>
            <Link href="/dashboard/tickets" className="text-muted-foreground hover:text-foreground transition-colors">
              Tickets
            </Link>
            {isCoordinador && (
              <Link href="/dashboard/kardex" className="text-muted-foreground hover:text-foreground transition-colors">
                Kárdex
              </Link>
            )}
            <Link href="/dashboard/perfil" className="text-muted-foreground hover:text-foreground transition-colors">
              Perfil
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            isCoordinador ? 'border border-primary/40 bg-primary/15 text-primary' : 'border border-border bg-muted text-muted-foreground'
          }`}>
            {isCoordinador ? 'Coordinador' : 'Empleado'}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6 w-full max-w-5xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 h-16 border-t bg-background sm:hidden flex items-center justify-around">
        <Link href="/dashboard" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Inicio</span>
        </Link>
        <Link href="/dashboard/tickets" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
          <Ticket className="h-5 w-5" />
          <span className="text-xs mt-1">Tickets</span>
        </Link>
        {isCoordinador && (
          <Link href="/dashboard/kardex" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Kárdex</span>
          </Link>
        )}
        <Link href="/dashboard/perfil" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </nav>

      {/* Sidebar for Desktop (Opcional, escondido en móvil) */}
      {/* Se puede agregar un aside hidden sm:flex ... */}
    </div>
  )
}
