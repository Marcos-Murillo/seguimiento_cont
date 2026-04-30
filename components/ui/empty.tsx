"use client"

import { cn } from "@/lib/utils"
import { InboxIcon } from "lucide-react"

interface EmptyProps { className?: string; children?: React.ReactNode }
interface EmptyIconProps { children?: React.ReactNode }
interface EmptyTitleProps { children?: React.ReactNode }
interface EmptyDescriptionProps { children?: React.ReactNode }

function EmptyIcon({ children }: EmptyIconProps) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
      {children ?? <InboxIcon className="h-7 w-7" />}
    </div>
  )
}

function EmptyTitle({ children }: EmptyTitleProps) {
  return <p className="text-sm font-semibold text-foreground">{children}</p>
}

function EmptyDescription({ children }: EmptyDescriptionProps) {
  return <p className="text-xs text-muted-foreground max-w-xs">{children}</p>
}

export function Empty({ className, children }: EmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
      {children}
    </div>
  )
}

Empty.Icon        = EmptyIcon
Empty.Title       = EmptyTitle
Empty.Description = EmptyDescription
