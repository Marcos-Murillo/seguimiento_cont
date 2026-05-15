'use client'

import { memo, useRef, useEffect, type ElementType, type ReactNode } from 'react'
import { type Contractor } from '@/lib/types'
import { Input } from '@/components/ui/input'

export const ContractorSectionHeader = memo(function ContractorSectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: ElementType
  title: string
  color: string
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
    </div>
  )
})

type ScalarFieldProps = {
  label: string
  icon?: ElementType
  span2?: boolean
  span3?: boolean
  editing: boolean
  value?: string | number
  field?: keyof Contractor
  onFieldChange: (field: keyof Contractor, value: unknown) => void
  children?: ReactNode
  numeric?: boolean
  emptyReadLabel?: string
}

/** Campo escalar memoizado: al editar una celda, el resto no se re-renderiza. */
export const ContractorScalarField = memo(function ContractorScalarField({
  label,
  icon: Icon,
  span2,
  span3,
  editing,
  value,
  field,
  onFieldChange,
  children,
  numeric,
  emptyReadLabel,
}: ScalarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input value when switching to edit mode or when value changes externally
  useEffect(() => {
    if (editing && inputRef.current && !numeric) {
      inputRef.current.value = String(value ?? '')
    }
  }, [editing, numeric]) // intentionally omit value to avoid overwriting mid-edit

  const readView = () => {
    if (numeric && typeof value === 'number') {
      return (
        <div className="text-base font-semibold text-foreground leading-snug">
          {value.toLocaleString('es-CO')}
        </div>
      )
    }
    const empty = value === '' || value == null
    if (empty && emptyReadLabel) {
      return (
        <div className="text-base font-semibold text-muted-foreground leading-snug">{emptyReadLabel}</div>
      )
    }
    const s = value === 0 ? String(value) : value
    return <div className="text-base font-semibold text-foreground leading-snug">{s ? String(s) : '—'}</div>
  }

  return (
    <div className={span3 ? 'col-span-3' : span2 ? 'col-span-2' : ''}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      {children ? (
        <div className="text-base font-semibold text-foreground leading-snug">{children}</div>
      ) : editing && field ? (
        numeric ? (
          <Input
            className="h-8 text-sm"
            type="number"
            defaultValue={typeof value === 'number' && Number.isFinite(value) ? value : ''}
            onBlur={(e) => onFieldChange(field, Number(e.target.value) || 0)}
          />
        ) : (
          <Input
            ref={inputRef}
            className="h-8 text-sm"
            type="text"
            defaultValue={String(value ?? '')}
            onBlur={(e) => onFieldChange(field, e.target.value)}
          />
        )
      ) : (
        readView()
      )}
    </div>
  )
})

/** Input de una sola línea (bloques anidados: seguimiento, CRD, documentos). */
export const ContractorInlineField = memo(function ContractorInlineField({
  label,
  icon: Icon,
  editing,
  value,
  onValueChange,
  placeholder,
  className = '',
}: {
  label: string
  icon: ElementType
  editing: boolean
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.value = value
    }
  }, [editing]) // intentionally omit value to avoid overwriting mid-edit

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      {editing ? (
        <Input
          ref={inputRef}
          className="h-8 text-sm"
          defaultValue={value}
          onBlur={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="text-base font-semibold text-foreground leading-snug">{value || '—'}</div>
      )}
    </div>
  )
})
