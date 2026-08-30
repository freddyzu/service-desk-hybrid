import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams
  return (
    <div className="flex-1 flex flex-col w-full px-4 sm:max-w-md justify-center gap-2 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Service Desk</CardTitle>
          <CardDescription>Inicia sesión o crea una cuenta nueva.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex-1 flex flex-col w-full gap-4 text-foreground">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Este campo solo será necesario si el usuario da clic en Registrarse, pero para simplificar lo mostramos siempre (opcional) */}
            <div className="grid gap-2">
              <Label htmlFor="nombre_completo">Nombre Completo (solo registro)</Label>
              <Input
                name="nombre_completo"
                type="text"
                placeholder="Juan Pérez"
              />
            </div>

            <Button formAction={login} className="w-full">
              Iniciar Sesión
            </Button>
            <Button formAction={signup} variant="outline" className="w-full">
              Registrarse
            </Button>
            
            {message && (
              <p className="mt-4 p-4 bg-destructive/10 text-destructive text-center text-sm rounded-md">
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
