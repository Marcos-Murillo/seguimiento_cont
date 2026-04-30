'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const SidePanel = DialogPrimitive.Root
const SidePanelTrigger = DialogPrimitive.Trigger
const SidePanelPortal = DialogPrimitive.Portal

function SidePanelOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

function SidePanelContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <SidePanelPortal>
      <SidePanelOverlay />
      <DialogPrimitive.Content
        className={cn(
          // Flotante: margen en todos los lados, pegado a la derecha
          'fixed top-4 right-4 bottom-4 z-50',
          'w-[50vw] min-w-[480px]',
          'bg-card border border-border rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2',
          'duration-300',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SidePanelPortal>
  )
}

function SidePanelHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-5 pb-3 border-b border-border shrink-0', className)} {...props} />
}

function SidePanelFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-3 border-t border-border shrink-0 flex justify-end gap-2', className)} {...props} />
}

const SidePanelTitle = DialogPrimitive.Title
const SidePanelDescription = DialogPrimitive.Description

export {
  SidePanel,
  SidePanelTrigger,
  SidePanelContent,
  SidePanelHeader,
  SidePanelFooter,
  SidePanelTitle,
  SidePanelDescription,
}
