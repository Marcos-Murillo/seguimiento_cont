export type UserRole = 'super_admin' | 'admin' | 'contractor'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  cedula?: string
  approvalStatus: ApprovalStatus
  createdAt: Date
}

export type EstadoCuota = 
  | 'pendiente_informe_contratista'
  | 'pendiente_informe_supervision'
  | 'gestion_documentos_pago'
  | 'enviado_presupuesto'
  | 'remitido_pagaduria'
  | 'pagado'

export interface CuotaHistorial {
  cuotaNo: number
  valorPagado: number
  estadoCuota: EstadoCuota
  fechaPago: string
  fechaActualizacion: string // Fecha y hora de cuando se guardó este registro
  observaciones: string
  procesoPago: {
    cuenta979001: string
    cuenta979003: string
    cuenta979005: string
    cuenta979006: string
  }
}

export interface Contractor {
  id: string
  no: number
  cedula: string
  nombre: string
  contratoNo: string
  objetoContractual: string
  egreso: string
  cuotaNo: number
  total: number
  informeSupervision: string
  deuv: string
  seguimientoSP: {
    noCP: string
    noSP: string
    fechaElaboracion: string
  }
  consolidacionDocumentos: {
    fechaElaboracion: string
    fecha: string
  }
  fechaEnvioPresupuesto: string
  contratacionCRD: {
    fechaRemisionInformes: string
    doc: string
    enlace: string
  }
  supervisor: string
  estadoCuota: EstadoCuota
  observaciones: string
  documentosBase: {
    poliza: string
    evidencias: string
    pactadas: string
  }
  procesoPago: {
    cuenta979001: string
    cuenta979003: string
    cuenta979005: string
    cuenta979006: string
  }
  valorCuota: number
  fechaEntrega: string
  fechaElaboracionDFUV: string
  fechaAprobacion: string
  estadoCuenta: 'activo' | 'inactivo' | 'suspendido'
  revisado: boolean
  historialCuotas?: CuotaHistorial[]
  // Nuevos campos para control de contrato
  fechaInicio?: string
  fechaFin?: string
  numeroCuotas?: number // Calculado: total / valorCuota
}
