# Sistema de Diseño Institucional (EduNova Institutional OS)

> **Propósito:** Guía de diseño de primer nivel para software escolar operativo peruano (SIS).
> **Principio Rector:** *"El staff necesita un tablero de control denso y calmado; el docente necesita su agenda operativa en 3 clics; la familia necesita el recado del día en el móvil."*

---

## 1. Filosofía de Marca & White-Label

* **Identidad Institucional Primero:** La Institución Educativa (Colegio) es la protagonista visual:
  * Logotipo/Escudo y Nombre de la IE visibles en el header del Sidebar y reportes oficiales.
  * Selector de Ciclo/Periodo Escolar activo (ej. `2025` / `2026`).
  * "EduNova" se posiciona únicamente como motor de tecnología (*Powered by EduNova*), de forma sobria y discreta.
* **Tono de Producto:** Serio, confiable, rápido, sin distracciones lúdicas infantiles en la operación administrativa y docente.

---

## 2. Tokens de Color & Superficies

| Token | Light Mode (OKLCH / Hex) | Dark Mode (OKLCH / Hex) | Uso Institucional |
|---|---|---|---|
| **Primary (Brand IE)** | `oklch(0.51 0.24 275)` / `#4F46E5` | `oklch(0.65 0.22 275)` / `#818CF8` | Acciones primarias, botones institucionales, links clave |
| **Background** | `oklch(0.99 0 0)` / `#FAFAFA` | `oklch(0.145 0 0)` / `#12141A` | Lienzo base |
| **Card / Surface** | `oklch(1 0 0)` / `#FFFFFF` | `oklch(0.185 0 0)` / `#181B22` | Tarjetas de datos, tablas operativas |
| **Border** | `oklch(0.922 0 0)` / `#E2E8F0` | `oklch(1 0 0 / 12%)` | Separadores y bordes nítidos |
| **Text Primary** | `oklch(0.145 0 0)` / `#0F172A` | `oklch(0.985 0 0)` / `#F8FAFC` | Jerarquía tipográfica alta |
| **Text Muted** | `oklch(0.556 0 0)` / `#64748B` | `oklch(0.708 0 0)` / `#94A3B8` | Etiquetas secundarias y metadatos |
| **Success (Asistencia/Pago)** | `oklch(0.627 0.194 149.214)` | `oklch(0.68 0.18 149.214)` | Presente, Pago al día, Logro CNEB |
| **Warning (Pendiente/Tardanza)**| `oklch(0.646 0.222 41.116)` | `oklch(0.70 0.20 41.116)` | Tardanza, Por Calificar, En Proceso |
| **Destructive (Falta/Deuda)** | `oklch(0.577 0.245 27.325)` | `oklch(0.65 0.22 27.325)` | Inasistencia, Deuda vencida, En Inicio |

---

## 3. Tipografía & Jerarquía de Densidad

* **Tipografía Principal:** `Plus Jakarta Sans`, sans-serif (legibilidad óptima en dashboards y tablas densas).
* **Tipografía Monospace:** `JetBrains Mono` (para DNI, Código Modular SIAGIE, montos `S/`, horas lectivas y códigos).
* **Títulos Operativos (PageHeader):**
  * **Título:** `text-lg sm:text-xl font-bold tracking-tight text-foreground` (Nunca `text-5xl` de landing page).
  * **Subtítulo:** `text-xs text-muted-foreground max-w-2xl font-normal`.
  * **Badge de Contexto:** `text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5`.

---

## 4. Radios & Geometría

* **Tarjetas:** `rounded-xl` (o `rounded-2xl` máximo para contenedores maestros).
* **Controles (Inputs, Botones, Selects):** `rounded-lg` (8px).
* **Badges & Chips:** `rounded-full` o `rounded-md` según si es estado o código.
* **Prohibido:** Formas excesivamente redondeadas ("bubbly pills" o estilos inflados tipo juguete).

---

## 5. Arquitectura de Navegación por Rol (Job-to-be-Done)

### A. Staff (Dirección / Secretaría / Administración)
1. **Inicio:** Dashboard institucional con alertas tempranas y agenda ejecutiva.
2. **Matrícula:**
   * Admisiones (CRM)
   * Padrón de Estudiantes
   * Matrículas & Vacantes
   * Cierre & Promociones
3. **Académico:**
   * Secciones y Horarios
   * Evaluaciones (CNEB & SIAGIE)
   * Asistencia & Tardanzas
4. **Personas:**
   * Estudiantes & Familias
   * Personal Docente & Administrativo
5. **Tesorería:**
   * Cronogramas y Deudas
   * Verificar Pagos (conciliación rápida)
   * Operaciones / Uniformes
6. **Comunidad:**
   * Anuncios y Comunicados
   * Tutoría y Convivencia Escolar
7. **Configuración:**
   * Datos de la I.E.
   * Periodos & Turnos
   * Permisos & Auditoría

### B. Docente (Agenda Operativa Diaria)
1. **Inicio:** Mi Agenda de Hoy & Clases Activas (`/dashboard`).
2. **Operación Diaria:**
   * Pasar Asistencia en 20s (`/asistencia`).
   * Cargar Notas / Registro CNEB (`/evaluaciones`).
   * Mis Secciones & Alumnos (`/gestion/estudiantes`).
3. **Comunidad:**
   * Avisos & Circulares (`/comunicaciones`).

### C. Familia / Apoderado (Mobile-First)
* *"El parte del día":*
  1. ¿Mi hijo llegó al colegio hoy? (Hora y estado en grande).
  2. ¿Tengo pagos pendientes? (Monto claro con botón de pago/comprobante).
  3. ¿Cómo va en sus cursos? (Últimas notas y observaciones del tutor).

---

## 6. Reglas de Componentes Operativos

* **PageHeader Estándar:** Todas las páginas internas usan el componente `PageHeader` compacto con icono, título operativo, descripción concisa y barra de acciones a la derecha.
* **Tablas de Datos:**
  * Modo compacto por defecto (`py-2 px-3` en celdas).
  * Hover sutil en fila (`hover:bg-muted/50`).
  * Atajos de teclado en formularios (`Alt + G` Guardar, `Esc` Cancelar).
* **Dark Mode:** Totalmente habilitado y optimizado con contraste 7:1 en textos principales.

