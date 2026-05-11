import { type Contractor, type EstadoCuota } from './types'

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida que no se salten cuotas
 */
export function validarSecuenciaCuotas(
  cuotaActual: number,
  nuevaCuota: number,
  estadoActual: EstadoCuota,
  historial?: Contractor['historialCuotas']
): ValidationResult {
  // Si no cambia la cuota, es válido
  if (cuotaActual === nuevaCuota) {
    return { valid: true }
  }

  // Solo se puede avanzar de 1 en 1
  if (nuevaCuota !== cuotaActual + 1) {
    return {
      valid: false,
      error: `No puede saltar de la cuota ${cuotaActual} a la cuota ${nuevaCuota}. Debe avanzar secuencialmente.`
    }
  }

  // Si el estado actual es 'pagado', permitir el avance (se está procesando el pago)
  if (estadoActual === 'pagado') {
    return { valid: true }
  }

  // Verificar que la cuota anterior esté pagada en el historial
  const cuotaAnteriorPagada = historial?.some(
    h => h.cuotaNo === cuotaActual && h.estadoCuota === 'pagado'
  )

  if (!cuotaAnteriorPagada) {
    return {
      valid: false,
      error: `No puede avanzar a la cuota ${nuevaCuota} porque la cuota ${cuotaActual} no está marcada como pagada.`
    }
  }

  return { valid: true }
}

/**
 * Valida que no se pueda cambiar de cuota sin estar en estado pagado
 */
export function validarCambioCuotaRequierePago(
  cuotaActual: number,
  nuevaCuota: number,
  estadoActual: EstadoCuota
): ValidationResult {
  // Si no cambia la cuota, es válido
  if (cuotaActual === nuevaCuota) {
    return { valid: true }
  }

  // Para cambiar de cuota, el estado actual debe ser 'pagado'
  if (estadoActual !== 'pagado') {
    return {
      valid: false,
      error: `No puede avanzar a la siguiente cuota porque el estado actual es "${estadoActual}". Debe estar en estado "pagado" primero.`
    }
  }

  return { valid: true }
}

/**
 * Valida que el número de cuota no exceda el total de cuotas del contrato
 */
export function validarCuotaDentroDelLimite(
  nuevaCuota: number,
  totalContrato: number,
  valorCuota: number
): ValidationResult {
  const numeroCuotas = Math.ceil(totalContrato / valorCuota)

  if (nuevaCuota > numeroCuotas) {
    return {
      valid: false,
      error: `La cuota ${nuevaCuota} excede el número total de cuotas del contrato (${numeroCuotas}).`
    }
  }

  return { valid: true }
}

/**
 * Valida que no se pueda retroceder en las cuotas
 */
export function validarNoRetrocederCuotas(
  cuotaActual: number,
  nuevaCuota: number
): ValidationResult {
  if (nuevaCuota < cuotaActual) {
    return {
      valid: false,
      error: `No puede retroceder de la cuota ${cuotaActual} a la cuota ${nuevaCuota}.`
    }
  }

  return { valid: true }
}

/**
 * Ejecuta todas las validaciones de cuotas
 * NOTA: Esta función se ejecuta DESPUÉS de prepararAvanceCuota
 */
export function validarCambioCuota(
  contractor: Contractor,
  updates: Partial<Contractor>
): ValidationResult {
  console.log('🔍 validarCambioCuota:', {
    cuotaActual: contractor.cuotaNo,
    cuotaNueva: updates.cuotaNo,
    estadoActual: contractor.estadoCuota,
    estadoNuevo: updates.estadoCuota
  })

  // Si no se está cambiando la cuota O la cuota es la misma, no hay nada que validar
  if (updates.cuotaNo === undefined || updates.cuotaNo === contractor.cuotaNo) {
    console.log('✅ No hay cambio de cuota - Validación OK')
    return { valid: true }
  }

  const nuevaCuota = updates.cuotaNo

  // 1. No retroceder
  if (nuevaCuota < contractor.cuotaNo) {
    console.log('❌ Intento de retroceso')
    return {
      valid: false,
      error: `No puede retroceder de la cuota ${contractor.cuotaNo} a la cuota ${nuevaCuota}.`
    }
  }

  // 2. Solo avanzar de 1 en 1
  if (nuevaCuota !== contractor.cuotaNo + 1) {
    console.log('❌ Intento de saltar cuotas')
    return {
      valid: false,
      error: `No puede saltar de la cuota ${contractor.cuotaNo} a la cuota ${nuevaCuota}. Debe avanzar secuencialmente.`
    }
  }

  // 3. No exceder límite
  const numeroCuotas = contractor.numeroCuotas || Math.ceil(contractor.total / contractor.valorCuota)
  if (nuevaCuota > numeroCuotas) {
    console.log('❌ Excede límite de cuotas')
    return {
      valid: false,
      error: `La cuota ${nuevaCuota} excede el número total de cuotas del contrato (${numeroCuotas}).`
    }
  }

  // Si llegamos aquí, el avance es válido (ya sea automático o manual)
  console.log('✅ Validación de cuota exitosa')
  return { valid: true }
}

/**
 * Prepara los datos para avanzar automáticamente a la siguiente cuota
 * cuando la cuota actual se marca como pagada (solo para admins)
 */
export function prepararAvanceCuota(
  contractor: Contractor,
  updates: Partial<Contractor>
): Partial<Contractor> {
  console.log('🔍 prepararAvanceCuota - Entrada:', {
    cuotaActual: contractor.cuotaNo,
    estadoActual: contractor.estadoCuota,
    estadoNuevo: updates.estadoCuota,
    cuotaNueva: updates.cuotaNo
  })

  // Si se está marcando como pagado y no se está cambiando la cuota manualmente
  if (
    updates.estadoCuota === 'pagado' &&
    contractor.estadoCuota !== 'pagado' &&
    updates.cuotaNo === undefined
  ) {
    const numeroCuotas = contractor.numeroCuotas || Math.ceil(contractor.total / contractor.valorCuota)
    
    console.log('✅ Condición cumplida - Preparando avance automático')
    console.log('📊 Número de cuotas:', numeroCuotas)
    
    // Si no es la última cuota, preparar avance automático
    if (contractor.cuotaNo < numeroCuotas) {
      const resultado = {
        ...updates,
        cuotaNo: contractor.cuotaNo + 1,
        estadoCuota: 'pendiente_informe_contratista' as EstadoCuota,
      }
      console.log('🚀 Avanzando a cuota:', resultado.cuotaNo)
      return resultado
    }
    
    // Si es la última cuota, solo marcar como pagado sin avanzar
    console.log('🏁 Es la última cuota - No avanzar')
    return {
      ...updates,
      estadoCuota: 'pagado' as EstadoCuota
    }
  }

  console.log('⏭️ No se cumple condición de avance automático')
  return updates
}
