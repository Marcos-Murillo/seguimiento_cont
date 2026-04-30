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

export interface CuotaHistorial {
  cuotaNo: number
  valorPagado: number
  estadoCuota: 'pendiente' | 'en_proceso' | 'pagado' | 'rechazado'
  fechaPago: string
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
  estadoCuota: 'pendiente' | 'en_proceso' | 'pagado' | 'rechazado'
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
}

// Mock data for development
export const mockContractors: Contractor[] = [
  {
    id: '1',
    no: 1,
    cedula: '1234567890',
    nombre: 'Juan Carlos Pérez García',
    contratoNo: 'CT-2024-001',
    objetoContractual: 'Servicios de consultoría técnica para proyecto de infraestructura',
    egreso: 'EG-001',
    cuotaNo: 3,
    total: 15000000,
    informeSupervision: 'Completado',
    deuv: 'DEUV-2024-001',
    seguimientoSP: {
      noCP: 'CP-001',
      noSP: 'SP-001',
      fechaElaboracion: '2024-01-15'
    },
    consolidacionDocumentos: {
      fechaElaboracion: '2024-01-20',
      fecha: '2024-01-22'
    },
    fechaEnvioPresupuesto: '2024-01-25',
    contratacionCRD: {
      fechaRemisionInformes: '2024-01-28',
      doc: 'DOC-001',
      enlace: 'https://docs.example.com/001'
    },
    supervisor: 'supervisor@empresa.com',
    estadoCuota: 'en_proceso',
    observaciones: 'Documentación completa, pendiente aprobación final',
    documentosBase: {
      poliza: 'POL-001',
      evidencias: 'Completas',
      pactadas: 'Cumplidas'
    },
    procesoPago: {
      cuenta979001: 'Aprobado',
      cuenta979003: 'Pendiente',
      cuenta979005: 'N/A',
      cuenta979006: 'N/A'
    },
    valorCuota: 5000000,
    fechaEntrega: '2024-02-01',
    fechaElaboracionDFUV: '2024-01-18',
    fechaAprobacion: '2024-01-30',
    estadoCuenta: 'activo',
    revisado: true,
    historialCuotas: [
      {
        cuotaNo: 1,
        valorPagado: 5000000,
        estadoCuota: 'pagado',
        fechaPago: '2023-11-15',
        observaciones: 'Primer pago procesado sin inconvenientes',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      },
      {
        cuotaNo: 2,
        valorPagado: 5000000,
        estadoCuota: 'pagado',
        fechaPago: '2023-12-20',
        observaciones: 'Segundo pago aprobado',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      },
      {
        cuotaNo: 3,
        valorPagado: 5000000,
        estadoCuota: 'en_proceso',
        fechaPago: '',
        observaciones: 'Documentación completa, pendiente aprobación final',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Pendiente', cuenta979005: 'N/A', cuenta979006: 'N/A' }
      }
    ]
  },
  {
    id: '2',
    no: 2,
    cedula: '0987654321',
    nombre: 'María Elena Rodríguez López',
    contratoNo: 'CT-2024-002',
    objetoContractual: 'Desarrollo de software para gestión administrativa',
    egreso: 'EG-002',
    cuotaNo: 2,
    total: 25000000,
    informeSupervision: 'En revisión',
    deuv: 'DEUV-2024-002',
    seguimientoSP: {
      noCP: 'CP-002',
      noSP: 'SP-002',
      fechaElaboracion: '2024-02-01'
    },
    consolidacionDocumentos: {
      fechaElaboracion: '2024-02-05',
      fecha: '2024-02-07'
    },
    fechaEnvioPresupuesto: '2024-02-10',
    contratacionCRD: {
      fechaRemisionInformes: '2024-02-12',
      doc: 'DOC-002',
      enlace: 'https://docs.example.com/002'
    },
    supervisor: 'supervisor2@empresa.com',
    estadoCuota: 'pagado',
    observaciones: 'Pago procesado correctamente',
    documentosBase: {
      poliza: 'POL-002',
      evidencias: 'Completas',
      pactadas: 'Cumplidas'
    },
    procesoPago: {
      cuenta979001: 'Aprobado',
      cuenta979003: 'Aprobado',
      cuenta979005: 'Aprobado',
      cuenta979006: 'Aprobado'
    },
    valorCuota: 12500000,
    fechaEntrega: '2024-02-15',
    fechaElaboracionDFUV: '2024-02-03',
    fechaAprobacion: '2024-02-14',
    estadoCuenta: 'activo',
    revisado: true,
    historialCuotas: [
      {
        cuotaNo: 1,
        valorPagado: 12500000,
        estadoCuota: 'pagado',
        fechaPago: '2024-01-10',
        observaciones: 'Pago inicial procesado correctamente',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      },
      {
        cuotaNo: 2,
        valorPagado: 12500000,
        estadoCuota: 'pagado',
        fechaPago: '2024-02-14',
        observaciones: 'Pago procesado correctamente',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      }
    ]
  },
  {
    id: '3',
    no: 3,
    cedula: '5678901234',
    nombre: 'Carlos Andrés Martínez Sánchez',
    contratoNo: 'CT-2024-003',
    objetoContractual: 'Auditoría de procesos financieros',
    egreso: 'EG-003',
    cuotaNo: 1,
    total: 8000000,
    informeSupervision: 'Pendiente',
    deuv: 'DEUV-2024-003',
    seguimientoSP: {
      noCP: 'CP-003',
      noSP: 'SP-003',
      fechaElaboracion: '2024-02-20'
    },
    consolidacionDocumentos: {
      fechaElaboracion: '2024-02-25',
      fecha: '2024-02-27'
    },
    fechaEnvioPresupuesto: '2024-03-01',
    contratacionCRD: {
      fechaRemisionInformes: '2024-03-03',
      doc: 'DOC-003',
      enlace: 'https://docs.example.com/003'
    },
    supervisor: 'supervisor3@empresa.com',
    estadoCuota: 'pendiente',
    observaciones: 'Esperando documentación adicional',
    documentosBase: {
      poliza: 'POL-003',
      evidencias: 'Parciales',
      pactadas: 'En proceso'
    },
    procesoPago: {
      cuenta979001: 'Pendiente',
      cuenta979003: 'Pendiente',
      cuenta979005: 'N/A',
      cuenta979006: 'N/A'
    },
    valorCuota: 8000000,
    fechaEntrega: '2024-03-10',
    fechaElaboracionDFUV: '2024-02-22',
    fechaAprobacion: '',
    estadoCuenta: 'activo',
    revisado: false,
    historialCuotas: [
      {
        cuotaNo: 1,
        valorPagado: 0,
        estadoCuota: 'pendiente',
        fechaPago: '',
        observaciones: 'Esperando documentación adicional',
        procesoPago: { cuenta979001: 'Pendiente', cuenta979003: 'Pendiente', cuenta979005: 'N/A', cuenta979006: 'N/A' }
      }
    ]
  },
  {
    id: '4',
    no: 4,
    cedula: '1122334455',
    nombre: 'Ana Patricia González Ruiz',
    contratoNo: 'CT-2024-004',
    objetoContractual: 'Capacitación en normativas de seguridad laboral',
    egreso: 'EG-004',
    cuotaNo: 4,
    total: 12000000,
    informeSupervision: 'Completado',
    deuv: 'DEUV-2024-004',
    seguimientoSP: {
      noCP: 'CP-004',
      noSP: 'SP-004',
      fechaElaboracion: '2024-01-10'
    },
    consolidacionDocumentos: {
      fechaElaboracion: '2024-01-15',
      fecha: '2024-01-17'
    },
    fechaEnvioPresupuesto: '2024-01-20',
    contratacionCRD: {
      fechaRemisionInformes: '2024-01-22',
      doc: 'DOC-004',
      enlace: 'https://docs.example.com/004'
    },
    supervisor: 'supervisor@empresa.com',
    estadoCuota: 'pagado',
    observaciones: 'Contrato finalizado exitosamente',
    documentosBase: {
      poliza: 'POL-004',
      evidencias: 'Completas',
      pactadas: 'Cumplidas'
    },
    procesoPago: {
      cuenta979001: 'Aprobado',
      cuenta979003: 'Aprobado',
      cuenta979005: 'Aprobado',
      cuenta979006: 'Aprobado'
    },
    valorCuota: 3000000,
    fechaEntrega: '2024-01-25',
    fechaElaboracionDFUV: '2024-01-12',
    fechaAprobacion: '2024-01-24',
    estadoCuenta: 'activo',
    revisado: true,
    historialCuotas: [
      {
        cuotaNo: 1,
        valorPagado: 3000000,
        estadoCuota: 'pagado',
        fechaPago: '2023-10-05',
        observaciones: 'Pago inicial aprobado',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      },
      {
        cuotaNo: 2,
        valorPagado: 3000000,
        estadoCuota: 'pagado',
        fechaPago: '2023-11-10',
        observaciones: 'Segundo pago sin observaciones',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      },
      {
        cuotaNo: 3,
        valorPagado: 3000000,
        estadoCuota: 'pagado',
        fechaPago: '2023-12-15',
        observaciones: 'Tercer pago aprobado',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      },
      {
        cuotaNo: 4,
        valorPagado: 3000000,
        estadoCuota: 'pagado',
        fechaPago: '2024-01-24',
        observaciones: 'Contrato finalizado exitosamente',
        procesoPago: { cuenta979001: 'Aprobado', cuenta979003: 'Aprobado', cuenta979005: 'Aprobado', cuenta979006: 'Aprobado' }
      }
    ]
  },
  {
    id: '5',
    no: 5,
    cedula: '9988776655',
    nombre: 'Roberto Luis Herrera Díaz',
    contratoNo: 'CT-2024-005',
    objetoContractual: 'Mantenimiento de equipos de cómputo',
    egreso: 'EG-005',
    cuotaNo: 2,
    total: 6500000,
    informeSupervision: 'En revisión',
    deuv: 'DEUV-2024-005',
    seguimientoSP: {
      noCP: 'CP-005',
      noSP: 'SP-005',
      fechaElaboracion: '2024-03-01'
    },
    consolidacionDocumentos: {
      fechaElaboracion: '2024-03-05',
      fecha: '2024-03-07'
    },
    fechaEnvioPresupuesto: '2024-03-10',
    contratacionCRD: {
      fechaRemisionInformes: '2024-03-12',
      doc: 'DOC-005',
      enlace: 'https://docs.example.com/005'
    },
    supervisor: 'supervisor2@empresa.com',
    estadoCuota: 'rechazado',
    observaciones: 'Documentación incompleta, requiere corrección',
    documentosBase: {
      poliza: 'POL-005',
      evidencias: 'Incompletas',
      pactadas: 'Parciales'
    },
    procesoPago: {
      cuenta979001: 'Rechazado',
      cuenta979003: 'N/A',
      cuenta979005: 'N/A',
      cuenta979006: 'N/A'
    },
    valorCuota: 3250000,
    fechaEntrega: '2024-03-20',
    fechaElaboracionDFUV: '2024-03-03',
    fechaAprobacion: '',
    estadoCuenta: 'suspendido',
    revisado: false,
    historialCuotas: [
      {
        cuotaNo: 1,
        valorPagado: 3250000,
        estadoCuota: 'rechazado',
        fechaPago: '',
        observaciones: 'Documentación incompleta, requiere corrección',
        procesoPago: { cuenta979001: 'Rechazado', cuenta979003: 'N/A', cuenta979005: 'N/A', cuenta979006: 'N/A' }
      },
      {
        cuotaNo: 2,
        valorPagado: 0,
        estadoCuota: 'pendiente',
        fechaPago: '',
        observaciones: 'En espera de corrección de cuota anterior',
        procesoPago: { cuenta979001: 'Pendiente', cuenta979003: 'N/A', cuenta979005: 'N/A', cuenta979006: 'N/A' }
      }
    ]
  }
]

export const mockPendingUsers: User[] = [
  {
    id: 'pending-1',
    email: 'nuevo.contratista@email.com',
    name: 'Fernando Castro Mejía',
    role: 'contractor',
    cedula: '3344556677',
    approvalStatus: 'pending',
    createdAt: new Date('2024-03-15')
  },
  {
    id: 'pending-2',
    email: 'otro.usuario@email.com',
    name: 'Lucía Fernanda Vargas',
    role: 'contractor',
    cedula: '8899001122',
    approvalStatus: 'pending',
    createdAt: new Date('2024-03-14')
  },
  {
    id: 'pending-3',
    email: 'pendiente@empresa.com',
    name: 'Diego Armando Torres',
    role: 'contractor',
    cedula: '4455667788',
    approvalStatus: 'pending',
    createdAt: new Date('2024-03-13')
  }
]
