'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
  error: string
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Registro
  const [registerOpen, setRegisterOpen] = useState(false)
  const [regForm, setRegForm] = useState({ name: '', email: '', cedula: '', password: '', confirmPassword: '' })
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regError, setRegError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(email, password)
  }

  const handleRegister = async () => {
    if (!regForm.name || !regForm.email || !regForm.cedula || !regForm.password) return
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Las contraseñas no coinciden')
      return
    }
    if (regForm.password.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setRegLoading(true)
    setRegError('')
    try {
      await addDoc(collection(db, 'solicitudes_acceso'), {
        name: regForm.name,
        email: regForm.email,
        cedula: regForm.cedula,
        password: regForm.password,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setRegSuccess(true)
    } catch {
      setRegError('Error al enviar la solicitud. Intenta de nuevo.')
    } finally {
      setRegLoading(false)
    }
  }

  const closeRegister = () => {
    setRegisterOpen(false)
    setRegSuccess(false)
    setRegError('')
    setRegForm({ name: '', email: '', cedula: '', password: '', confirmPassword: '' })
  }

  return (
    <>
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Iniciar sesión</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <a href="#" className="text-sm text-primary hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                    : <Eye className="h-4 w-4 text-muted-foreground" />}
                  <span className="sr-only">{showPassword ? 'Ocultar' : 'Mostrar'} contraseña</span>
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
              {isLoading ? <><Spinner className="mr-2" />Ingresando...</> : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-2">
            <p className="text-sm text-muted-foreground">¿Eres contratista y no tienes acceso?</p>
            <Button variant="outline" className="w-full" onClick={() => setRegisterOpen(true)}>
              Solicitar acceso
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de solicitud de acceso */}
      <Dialog open={registerOpen} onOpenChange={closeRegister}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar acceso</DialogTitle>
            <DialogDescription>
              Un administrador revisará tu solicitud y te enviará las credenciales por correo.
            </DialogDescription>
          </DialogHeader>

          {regSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-foreground">Solicitud enviada</p>
              <p className="text-sm text-muted-foreground">
                Un administrador revisará tu solicitud y te contactará pronto.
              </p>
              <Button className="mt-2" onClick={closeRegister}>Cerrar</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Nombre completo</Label>
                  <Input id="reg-name" placeholder="Tu nombre completo"
                    value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-cedula">Número de cédula</Label>
                  <Input id="reg-cedula" placeholder="1005943788"
                    value={regForm.cedula} onChange={e => setRegForm(p => ({ ...p, cedula: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Correo electrónico</Label>
                  <Input id="reg-email" type="email" placeholder="tu@correo.com"
                    value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <Input id="reg-password" type="password" placeholder="Mínimo 6 caracteres"
                    value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                  <Input id="reg-confirm" type="password" placeholder="Repite tu contraseña"
                    value={regForm.confirmPassword} onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))} />
                </div>
                {regError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" />{regError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeRegister}>Cancelar</Button>
                <Button
                  onClick={handleRegister}
                  disabled={regLoading || !regForm.name || !regForm.email || !regForm.cedula || !regForm.password || !regForm.confirmPassword}
                >
                  {regLoading ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
