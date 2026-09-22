# Análisis técnico — sistema-escolar-pro

**Repositorio:** https://github.com/Jackson-sch/sistema-escolar-pro
**Fecha del análisis:** 18 de agosto de 2026

---

## 1. Resumen del stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL + Prisma ORM 7
- **Autenticación:** NextAuth v5 (JWT, Credentials)
- **UI:** Tailwind CSS v4 + shadcn/ui + Radix UI
- **IA:** Google Gemini (asistente académico/financiero)
- **PDF:** React-PDF + PDFx
- **Mapas:** MapLibre GL
- **Notificaciones:** Twilio (SMS/WhatsApp) + Resend (email)
- **Storage:** Cloudinary (con fallback local)
- **Gestor de paquetes:** Bun

## 2. Lo que ya está implementado (sólido)

- **Modelo de datos maduro:** 54 modelos en Prisma cubriendo académico, matrículas, notas, asistencia, finanzas, uniformes (con inventario y variantes), psicopedagogía, disciplina, admisiones, multi-sede y multi-institución.
- **Módulos funcionales de verdad** (no solo maquetas):
  - Dashboard con métricas
  - Gestión académica completa (niveles, grados, cursos, horarios, competencias CNEB, promociones)
  - Matrículas y admisiones
  - Evaluaciones y notas
  - Asistencia con políticas configurables por nivel/turno
  - Finanzas: cronogramas de pago, comprobantes, reportes de morosidad
  - Uniformes: catálogo, variantes, inventario, ventas
  - Portal de padres: notas, asistencia, horario, pagos, disciplina, uniformes
  - Comunicaciones: anuncios, eventos, logs multicanal
  - Psicopedagogía (fichas, seguimiento)
  - Chat con IA (Gemini)
  - OCR de documentos
  - Super-admin multi-institución
- **Buenas prácticas de código:**
  - Server actions con `createSafeAction` + validación Zod
  - Rate limiting propio (`src/lib/rate-limit.ts`)
  - Audit log (`AuditLog` model)
  - Sistema de permisos granular (`Permiso` / `RolPermiso` / `CargoPermiso` / `UsuarioPermiso`)
  - Integraciones (Cloudinary, Twilio, Resend) configuradas dinámicamente desde BD (`VariableSistema`) en vez de hardcodeadas
- **CI en GitHub Actions:** typecheck, lint y build automatizados en cada push/PR.

## 3. Estado de Mejoras Recientes (Agosto 2026)

### 3.1 Tests Automatizados en CI ✅ IMPLEMENTADO
- Ejecución de Vitest integrada en el flujo de GitHub Actions (`.github/workflows/ci.yml`).
- Cobertura ampliada con 7 suites de pruebas (29 tests pasando): acciones académicas, upload seguro, Gemini AI, pagos y finanzas, asistencia por QR, exportación SIAGIE y conciliación bancaria.

### 3.2 Normativa MINEDU y SIAGIE ✅ IMPLEMENTADO
- Generador de plantillas oficiales de evaluación en Excel (`src/actions/siagie.ts`) respetando la estructura exigida por SIAGIE Perú.
- Modal de exportación institucional integrado en el módulo de evaluaciones (`src/components/evaluaciones/siagie-export-dialog.tsx`).
- Asistente IA con Gemini (`src/actions/ai-conclusiones.ts`) para redactar conclusiones descriptivas formativas automáticas según competencias y estándares del CNEB.

### 3.3 Conciliación Bancaria Masiva & SUNAT ✅ IMPLEMENTADO
- Parser y liquidador masivo de extractos de cuenta/bancos (`src/actions/finance/conciliacion.ts`) con modal interactivo de carga y previsualización (`src/components/finanzas/conciliacion-dialog.tsx`).
- Cliente tipado para conexión con `facturacion-electronica-api` (`src/lib/facturacion-client.ts`) para emisión de Boletas y Facturas electrónicas ante SUNAT.

### 3.4 Soporte PWA (Progressive Web App) ✅ IMPLEMENTADO
- Manifiesto web (`public/manifest.json`), service worker (`public/sw.js`) y meta tags en `src/app/layout.tsx` para instalación directa en dispositivos móviles (Android/iOS).

---

## 4. Próximos Pasos Recomendados

1. **Pasarela de pago online en vivo:** Habilitar cobro directo con tarjeta/Yape/Plin (Culqi o Niubiz) en el portal de padres.
2. **2FA para roles administrativos:** TOTP con autenticador móvil para administradores y directivos.
3. **Observabilidad en Producción:** Integración de Sentry o OpenTelemetry.

---

*Actualizado a partir de las implementaciones completadas en el repositorio.*