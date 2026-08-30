import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { logout } from '@/app/login/actions'
import { createClient } from '@/utils/supabase/server'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).single()

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold tracking-tight">Mi Perfil</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Cuenta</CardTitle>
          <CardDescription>Información del usuario actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Nombre</p>
            <p>{profile?.nombre_completo || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Rol en el Sistema</p>
            <p className="capitalize">{profile?.rol}</p>
          </div>
          
          <div className="pt-6">
            <form action={logout}>
              <Button variant="destructive" className="w-full">Cerrar Sesión</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
