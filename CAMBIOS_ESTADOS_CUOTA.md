# Cambios en Estados de Cuota

## Resumen
Se actualizaron los estados de las cuotas en el sistema de seguimiento de contratistas para reflejar un flujo de trabajo más detallado.

## Estados Anteriores
1. `pendiente` - Pendiente
2. `en_proceso` - En Proceso
3. `pagado` - Pagado
4. `rechazado` - Rechazado

## Nuevos Estados
1. `pendiente_informe_contratista` - Pendiente informe de actividades (contratista)
2. `pendiente_informe_supervision` - Pendiente informe de supervisión
3. `gestion_documentos_pago` - Gestión documentos para pago en trámite
4. `enviado_presupuesto` - Enviado a Presupuesto
5. `remitido_pagaduria` - Remitido a Pagaduría
6. `pagado` - Pagado

## Archivos Modificados

### 1. `lib/types.ts`
- Se creó el tipo `EstadoCuota` con los nuevos estados
- Se actualizó la interfaz `CuotaHistorial` para usar el nuevo tipo
- Se actualizó la interfaz `Contractor` para usar el nuevo tipo

### 2. `lib/estado-utils.ts` (NUEVO)
- Archivo de utilidades para manejo de estados
- `ESTADO_CUOTA_LABELS`: Mapeo de estados a etiquetas legibles
- `ESTADO_CUOTA_COLORS`: Mapeo de estados a clases de color
- `getEstadoCuotaLabel()`: Función para obtener la etiqueta de un estado
- `getEstadoCuotaColor()`: Función para obtener el color de un estado

### 3. `components/admin-dashboard.tsx`
- Actualizado para usar los nuevos estados
- Se agregaron iconos específicos para cada estado
- Se eliminó la alerta de "Pagos rechazados" (ya no existe ese estado)
- Se actualizó la sección "Estado de Pagos" con los 6 nuevos estados
- Se actualizó el cálculo de contratos "al día" y "con retraso"

### 4. `components/contractor-dashboard.tsx`
- Actualizado para usar `getEstadoCuotaLabel` y `getEstadoCuotaColor`
- Se agregó el parámetro `isEstadoCuota` a la función `getStatusBadge`

### 5. `components/contractor-detail-sheet.tsx`
- Actualizado para usar las utilidades de estado
- Se agregó el parámetro `isEstadoCuota` al componente `StatusBadge`

### 6. `components/payment-history-panel.tsx`
- Actualizado para usar las utilidades de estado
- Se eliminó el mapeo local de estados

### 7. `app/dashboard/contratistas/page.tsx`
- Actualizado para usar las utilidades de estado
- Se actualizaron los selectores de estado en el formulario de edición
- Se actualizaron los selectores de estado en el formulario de nuevo contrato
- Se actualizó el filtro de estados en la tabla
- Se cambió el estado por defecto de `'pendiente'` a `'pendiente_informe_contratista'`

## Colores Asignados

| Estado | Color |
|--------|-------|
| Pendiente informe contratista | Amarillo |
| Pendiente informe supervisión | Naranja |
| Gestión documentos pago | Azul |
| Enviado a Presupuesto | Índigo |
| Remitido a Pagaduría | Púrpura |
| Pagado | Verde |

## Migración de Datos

**IMPORTANTE**: Los datos existentes en Firestore que tengan los estados antiguos (`pendiente`, `en_proceso`, `rechazado`) necesitarán ser migrados manualmente o mediante un script de migración.

### Sugerencia de Mapeo para Migración:
- `pendiente` → `pendiente_informe_contratista`
- `en_proceso` → `gestion_documentos_pago`
- `rechazado` → (evaluar caso por caso, podría ser cualquier estado anterior a `pagado`)
- `pagado` → `pagado` (sin cambios)

## Próximos Pasos

1. Crear un script de migración de datos en Firestore
2. Actualizar la documentación del usuario
3. Capacitar al equipo sobre los nuevos estados
