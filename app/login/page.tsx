'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LoginForm } from '@/components/login-form'
import { FileText, Shield, Clock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [error, setError] = useState('')

  const handleLogin = async (email: string, password: string) => {
    setError('')
    const success = await login(email, password)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Credenciales incorrectas. Por favor, intente nuevamente.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Marketing content */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground">ContratistasApp</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground leading-tight text-balance">
              Conoce el estado de tu contrato y tus pagos
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-md leading-relaxed">
              Accede a toda la información de tus contratos, revisa el estado de tus pagos y mantente informado en tiempo real.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Documentación centralizada</h3>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  Accede a todos tus documentos y contratos en un solo lugar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Seguimiento en tiempo real</h3>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  Conoce el estado actual de tus pagos y procesos al instante.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">Seguridad garantizada</h3>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  Tu información protegida con los más altos estándares de seguridad.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Sistema de Seguimiento de Pagos. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">ContratistasApp</span>
            </div>
            <p className="text-muted-foreground">
              Conoce el estado de tu contrato y tus pagos
            </p>
          </div>

          <LoginForm 
            onSubmit={handleLogin} 
            isLoading={isLoading} 
            error={error} 
          />

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Problemas para acceder?{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Contactar soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
