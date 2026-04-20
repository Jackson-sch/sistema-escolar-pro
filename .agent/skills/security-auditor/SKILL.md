---
name: Auditoria y Prevención de Seguridad (Security Auditor)
description: Protocolos y mejores prácticas para proteger el Sistema Escolar Pro contra vulnerabilidades, ataques y exposición de datos.
---

# Auditoría y Prevención de Seguridad (Security Auditor)

Esta skill define el protocolo de seguridad obligatorio para el desarrollo y mantenimiento del "Sistema Escolar Pro". Como agente, al crear nuevas funcionalidades o modificar código existente, DEBES aplicar las siguientes directrices y verificar su cumplimiento riguroso.

## 1. Autenticación y Autorización (Broken Access Control)

La prevención del acceso no autorizado es crítica en un entorno escolar.

*   **Validación de Sesión (Server Actions):** NUNCA confíes en que el cliente enviará el `userId` u otro identificador correctamente. Todas las Server Actions deben verificar validando la sesión de Auth.js:
    ```typescript
    // ✅ CORRECTO: Usar la utilidad segura centralizada (createSafeAction)
    import { createSafeAction } from "@/lib/safe-action";
    
    export const modifyGradeAction = createSafeAction(
      Schema,
      async (data, session) => {
        const userId = session.user.id; // Extraído de forma segura
        // logica...
      },
      { roles: ["profesor", "administrativo"] } // Control de Roles (RBAC) Obligatorio
    );
    ```
*   **Aislamiento de Institución (Multi-Tenant):** Si el usuario es de la Institución A, NO debe poder consultar o alterar datos de la Institución B. Asegura que las consultas (`where:`) incluyan el `institucionId` extraído de la sesión del usuario.
*   **Manejo de Contraseñas:** 
    *   Siempre utiliza `bcryptjs` con un salt de al menos 10 rondas para guardar contraseñas.
    *   No expongas nunca contraseñas en respuestas JSON desde la base de datos (Ej: excluye el campo password en el select de Prisma).

## 2. Inyección SQL y Seguridad de Base de Datos

*   **Uso del ORM:** Usa Prisma Client de forma estricta. Prisma previene por defecto la inyección SQL porque las consultas se envían como sentencias preparadas (Prepared Statements).
*   **Prohibición Parcial:** EVITA el uso de `prisma.$queryRawUnsafe` o `prisma.$executeRawUnsafe`. Si es imperativamente necesario usar SQL nativo por temas de rendimiento extremo, usa `prisma.$queryRaw` con interpolación de variables pura (`${variable}`).

## 3. Validación de Entradas (Input Validation & XSS)

*   **Zod es Ley:** No proceses peticiones de POST/PUT sin validarlas usando `Zod`. Todos los campos deben estar previstos. 
*   **Saneamiento HTML:** Next.js y React escapan automáticamente el contenido inyectado por defecto. Bajo **NINGUNA CIRCUNSTANCIA** utilices `dangerouslySetInnerHTML` a no ser que el texto provenga de una librería RichText segura (como Tiptap) sanitizada previamente con `DOMPurify`.

## 4. Protección de Credenciales Externas (API Keys)

*   Las variables sensibles o "Secretos" (Cloudinary Config, Resend API Key, Gemini API Key, etc.) introducidas por la UI se guardan en la base de datos (`VariableSistema`).
*   **Doble Capa de Respaldo:** Accede a ellas a través de `getSystemVariable` (que las obtendrá de DB o entorno en `.env.local`).
*   NUNCA expongas claves privadas mandándolas en `Client Components` (Ej: el componente `"use client"`). Las claves siempre deben evaluarse en Server Components (`.server.tsx` o Server Actions).
*   Las variables de entorno expuestas al cliente deben ser exclusivamente públicas y estar antecedidas por `NEXT_PUBLIC_`.

## 5. Denegación de Servicio (DDoS & Brute Force)

*   **Paginación Obligatoria:** Consultas que involucren listas masivas (estudiantes, historiales de pagos, reportes psicopedagógicos) DEBEN estar limitados (`take`, `skip`) para no agotar la RAM del servidor y sobrecargar las iteraciones de React.
*   **Optimización de Solicitudes:** Fomentar el uso de `prisma.$transaction()` para reducir los round-trips a la red y el agotamiento de pools de conexión en lugar de enviar iteraciones individuales a la BD con `Promise.all`.

## 🔄 Protocolo de Respuesta (Agente)

Cuando se te pida "asegurar el módulo X" o "iniciar la skill de auditoría de seguridad", debes:
1. Inspeccionar qué Server Actions usa ese módulo.
2. Comprobar que en Prisma haya filtros por `institucionId` e IDs sacados desde la sesión.
3. Verificar si existen inputs de usuario sin Zod y reportarlos al usuario final.
4. Auditar fugas de datos que crucen el puente Servidor -> Cliente (que no se envíen campos `password`, `tokens` o `secrets` por inercia en la serialización).
