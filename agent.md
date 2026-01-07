# Documentación Técnica de CaddiePro

## Resumen del Proyecto
CaddiePro es una plataforma integral para la gestión de turnos y colas de caddies en el Club Campestre Medellín. El sistema facilita la coordinación entre el área de recepción, los operadores de starter y el personal de caddies mediante una interfaz de alta visibilidad y herramientas administrativas precisas.

## Arquitectura de Escalabilidad Multi-Sede
El sistema ha sido diseñado para evolucionar hacia una plataforma unificada que gestione múltiples sedes y disciplinas deportivas.

### Esquema Maestro de Datos (Caddie)
Para soportar el crecimiento, cada objeto caddie incluye:
- Sede (Location): Diferenciación entre Llanogrande y Medellín.
- Rol (Role): Especialización en Golf, Tennis o perfil Híbrido.
- Disponibilidad (Availability): Horarios específicos por día de la semana (ej. "Viernes después de las 11 AM").
- Prioridad de Fin de Semana (WeekendPriority): Un índice numérico que permite sorteos aleatorios o reordenamiento manual (drag & drop conceptual) independiente del número de carné.

### Componentes Principales
1. Monitor Público (PublicQueue): Vista de alta visibilidad diseñada para pantallas de gran formato. Gestiona alertas de llamado en tiempo real.
2. Gestión de Listas (ListManager): Incluye herramientas de sorteo (Dices) para aleatorizar turnos en días de alta demanda (fines de semana) y filtros de rango.
3. Panel de Estadísticas (Reports): Centraliza la trazabilidad diaria y permite cierres de jornada con exportación CSV.

## Funcionalidades Implementadas
- Sistema de Llamado Dinámico: Notificaciones visuales masivas al autorizar salidas.
- Sorteo de Listas: Capacidad de aleatorizar el orden de una categoría específica para cumplir con normativas de fin de semana.
- Gestión de Incidencias: Registro de Ausencias, Permisos y Tardanzas.
- Arquitectura Multi-Contexto: Preparado para filtrar caddies por deporte y sede.

## Especificaciones Técnicas
- Framework: React 19.
- Estilizado: Tailwind CSS.
- Estado: Hooks personalizados con lógica de barajado (Fisher-Yates) para sorteos.
- Navegación: Sistema basado en hash.

## Hoja de Ruta Futura
- Implementación de Drag & Drop para ordenamiento manual fino en la vista de ListManager.
- Panel de configuración de disponibilidad por caddie (Calendario).
- Soporte para monitores específicos de Tennis en sede Medellín.
