# Sistema de Validaciones de Cuotas

## Resumen
Se implementó un sistema robusto de validaciones para controlar el flujo de cuotas y prevenir errores de digitación o manipulación incorrecta de datos.

## Validaciones Implementadas

### 1. **No Retroceder en Cuotas**
- **Regla**: No se puede cambiar de una cuota mayor a una menor
- **Ejemplo**: Si está en cuota 3, no puede volver a cuota 2
- **Error**: "No puede retroceder de la cuota X a la cuota Y"

### 2. **No Saltar Cuotas**
- **Regla**: Solo se puede avanzar de 1 en 1 (secuencial)
- **Ejemplo**: Si está en cuota 1, solo puede pasar a cuota 2 (no a 3)
- **Error**: "No puede saltar de la cuota X a la cuota Y. Debe avanzar secuencialmente"

### 3. **Cuota Anterior Debe Estar Pagada**
- **Regla**: Para avanzar a la siguiente cuota, la actual debe estar en estado "pagado"
- **Ejemplo**: Si la cuota 1 no está pagada, no puede pasar a cuota 2
- **Error**: "No puede avanzar a la cuota Y porque la cuota X no está marcada como pagada"

### 4. **Estado Actual Debe Ser "Pagado"**
- **Regla**: El estado de la cuota actual debe ser "pagado" para cambiar de cuota
- **Ejemplo**: Si está en "Pendiente informe contratista", no puede cambiar de cuota
- **Error**: "No puede avanzar a la siguiente cuota porque el estado actual es 'X'. Debe estar en estado 'pagado' primero"

### 5. **No Exceder Límite de Cuotas**
- **Regla**: El número de cuota no puede exceder el total de cuotas del contrato
- **Cálculo**: Total de cuotas = Total del contrato ÷ Valor de cuota
- **Ejemplo**: Si el contrato tiene 12 cuotas, no puede ir a cuota 13
- **Error**: "La cuota X excede el número total de cuotas del contrato (Y)"

## Funcionalidad de Avance Automático (Solo Admins)

### Cuando un admin marca una cuota como "Pagado":
1. **Se guarda en el historial**: La cuota actual se registra en `historialCuotas`
2. **Se avanza automáticamente**: `cuotaNo` se incrementa en 1
3. **Se resetea el estado**: `estadoCuota` vuelve a `pendiente_informe_contratista`
4. **Excepción**: Si es la última cuota, no avanza automáticamente

### Ejemplo de Flujo:
```
Estado inicial:
- cuotaNo: 1
- estadoCuota: 'pendiente_informe_contratista'

Admin cambia estado a 'pagado':
↓
Sistema automáticamente:
- Guarda cuota 1 en historial con estado 'pagado'
- cuotaNo: 2
- estadoCuota: 'pendiente_informe_contratista'
```

### Importante:
- ✅ El avance es **automático** cuando se marca como "pagado"
- ✅ No requiere que la cuota esté en el historial previamente
- ✅ Solo los admins pueden cambiar estados
- ✅ El sistema valida DESPUÉS de preparar el avance automático

## Archivos Modificados

### 1. `lib/cuota-validations.ts` (NUEVO)
Contiene todas las funciones de validación:
- `validarSecuenciaCuotas()`: Valida que no se salten cuotas
- `validarCambioCuotaRequierePago()`: Valida que esté pagado
- `validarCuotaDentroDelLimite()`: Valida límite de cuotas
- `validarNoRetrocederCuotas()`: Valida que no retroceda
- `validarCambioCuota()`: Ejecuta todas las validaciones
- `prepararAvanceCuota()`: Prepara el avance automático

### 2. `lib/firebase-db.ts`
- Se importan las funciones de validación
- `updateContractor()` ahora:
  - Obtiene el contratista anterior si no se proporciona
  - Ejecuta las validaciones antes de actualizar
  - Lanza un error si la validación falla
  - Prepara el avance automático si se marca como pagado

### 3. `app/dashboard/contratistas/page.tsx`
- `handleSave()`: Maneja errores y los muestra al usuario
- `handleNew()`: Maneja errores al crear
- `handleDelete()`: Agrega confirmación antes de eliminar
- `ContractorDialog`: No cierra el dialog si hay error
- `NewContractDialog`: No cierra el dialog si hay error

## Manejo de Errores

### En el Frontend:
- Los errores se capturan con try-catch
- Se muestran al usuario con `alert()` (temporal, se puede mejorar con toast)
- El dialog no se cierra si hay un error
- El usuario puede corregir y volver a intentar

### En el Backend:
- Las validaciones lanzan errores con mensajes descriptivos
- Los errores se propagan hasta el frontend
- Se registran en la consola para debugging

## Mejoras Futuras Sugeridas

1. **Sistema de Toast/Notificaciones**
   - Reemplazar `alert()` con un sistema de notificaciones más elegante
   - Usar Sonner o React Hot Toast

2. **Validaciones en Tiempo Real**
   - Deshabilitar el campo de cuota si no está pagado
   - Mostrar advertencias antes de intentar guardar

3. **Permisos por Rol**
   - Solo administradores pueden cambiar cuotas manualmente
   - Contratistas solo ven su información

4. **Auditoría**
   - Registrar quién y cuándo cambió cada cuota
   - Mantener un log de intentos fallidos

5. **Notificaciones Automáticas**
   - Notificar al contratista cuando debe entregar informe
   - Notificar al supervisor cuando hay informe pendiente

## Pruebas Recomendadas

### Casos de Prueba:
1. ✅ Intentar saltar de cuota 1 a cuota 3
2. ✅ Intentar avanzar sin estar en estado "pagado"
3. ✅ Intentar retroceder de cuota 3 a cuota 2
4. ✅ Intentar ir más allá del número total de cuotas
5. ✅ Marcar como pagado y verificar avance automático
6. ✅ Marcar la última cuota como pagada (no debe avanzar)

## Notas Importantes

- Las validaciones se ejecutan en el servidor (Firebase Functions)
- No se pueden eludir desde el frontend
- El historial de cuotas es inmutable (solo se agregan entradas)
- El avance automático solo ocurre cuando se marca como "pagado"
