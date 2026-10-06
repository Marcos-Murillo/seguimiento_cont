'use client'

import { type Contractor } from '@/lib/types'
import { isContractFinished } from '@/lib/contractor-utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ContractSwitcher({
  contracts,
  value,
  onChange,
}: {
  contracts: Contractor[]
  value: string
  onChange: (id: string) => void
}) {
  if (contracts.length < 2) return null

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[240px] text-sm">
        <SelectValue placeholder="Contrato" />
      </SelectTrigger>
      <SelectContent>
        {contracts.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.contratoNo || 'Sin número'}
            {isContractFinished(c) ? ' · Finalizado' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
