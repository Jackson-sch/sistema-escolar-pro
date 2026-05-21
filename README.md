# Sistema Escolar Pro

Sistema de gestión escolar peruano construido con Next.js 16, diseñado para instituciones educativas que buscan modernizar sus procesos administrativos y académicos.

## Tecnologías

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth v5 (JWT, Credentials)
- **UI:** Tailwind CSS v4 + shadcn/ui + Radix UI
- **IA:** Google Gemini (asistente académico/financiero)
- **PDF:** React-PDF + PDFx
- **Mapas:** MapLibre GL

## Módulos

- Dashboard con métricas
- Gestión académica (niveles, grados, cursos, horarios)
- Matrículas y admisiones
- Evaluaciones y notas
- Asistencia
- Finanzas (pagos, cronogramas, comprobantes)
- Uniformes (ventas, inventario)
- Portal de padres (notas, asistencia, horario, pagos)
- Comunicaciones (anuncios, eventos)
- Psicopedagogía
- Chat con IA
- Super-admin multi-institucion

## Requisitos

- Node.js 22+
- Bun (gestor de paquetes)
- PostgreSQL 15+
- (Opcional) Docker + Docker Compose

## Inicio rápido

```bash
# Clonar el repositorio
git clone <repo-url>
cd sistema-escolar-pro

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Instalar dependencias
bun install

# Generar cliente Prisma y migrar
bun run db:generate
bun run db:migrate:deploy

# (Opcional) Poblar datos de prueba
bun run db:seed

# Iniciar servidor de desarrollo
bun run dev
```

### Con Docker

```bash
docker compose up -d
docker compose exec app bun run db:migrate:deploy
docker compose exec app bun run db:seed
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia servidor de desarrollo |
| `bun run build` | Compila para producción |
| `bun run lint` | Ejecuta ESLint |
| `bun run typecheck` | Verifica tipos TypeScript |
| `bun run format` | Formatea código con Prettier |
| `bun run db:generate` | Genera cliente Prisma |
| `bun run db:migrate` | Crea migración de BD |
| `bun run db:seed` | Pobla datos de prueba |
| `bun run setup` | Instalación completa desde cero |

## Variables de entorno

Ver `.env.example` para las variables requeridas.

## Licencia

Privado — Uso interno.
