---
description: Detectar nuevos módulos y actualizar el sidebar automáticamente
---

# Workflow: Actualizar Sidebar

Este workflow detecta nuevos módulos en `src/app/(protected)` y actualiza el sidebar en `src/components/app-sidebar.tsx`.

## Pasos

// turbo-all

1. Listar todas las páginas actuales en el proyecto:
```powershell
Get-ChildItem -Path src\app -Filter page.tsx -Recurse | Select-Object FullName
```

2. Comparar con las rutas definidas en `src/components/app-sidebar.tsx`

3. Identificar nuevas rutas que no estén en el sidebar

4. **AGREGAR DIRECTAMENTE** las nuevas rutas al sidebar sin pedir confirmación

5. Actualizar `app-sidebar.tsx` con las nuevas rutas detectadas, asignando iconos apropiados de `@tabler/icons-react`

6. Notificar al usuario de los cambios realizados

## Consideraciones

- Las rutas bajo `(protected)` son las que deben aparecer en el sidebar
- Ignorar `/login` y otras rutas públicas
- Mantener comentadas las rutas de módulos planificados pero no implementados
- Usar iconos coherentes con el contenido del módulo
